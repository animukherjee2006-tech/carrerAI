
const mongoose = require('mongoose');

const Conversation = require('../model/conversation.model');
const Message = require('../model/message.model');

const {
    generateAIResponse
} = require('../services/ai.service');


// CREATE NEW CONVERSATION
exports.createConversation = async (req, res) => {
    try {
        const conversation = await Conversation.create({
            user: req.user.id,
            title: 'New Chat'
        });

        return res.status(201).json({
            success: true,
            conversation
        });

    } catch (error) {
        console.error('Create Conversation:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to create conversation'
        });
    }
};


// GET ALL USER CONVERSATIONS
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            user: req.user.id,
            isArchived: false
        })
        .sort({ updatedAt: -1 })
        .lean();

        return res.status(200).json({
            success: true,
            conversations
        });

    } catch (error) {
        console.error('Get Conversations:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to fetch conversations'
        });
    }
};


// GET MESSAGES OF A CONVERSATION
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation ID'
            });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            user: req.user.id,
            isArchived: false
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const messages = await Message.find({
            conversation: conversationId
        })
        .sort({ createdAt: 1 })
        .lean();

        return res.status(200).json({
            success: true,
            messages
        });

    } catch (error) {
        console.error('Get Messages:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to fetch messages'
        });
    }
};


// SEND MESSAGE AND GENERATE AI RESPONSE
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { message } = req.body;

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation ID'
            });
        }

        if (
            typeof message !== 'string' ||
            !message.trim() ||
            message.length > 10000
        ) {
            return res.status(400).json({
                success: false,
                message: 'Message must contain 1-10000 characters'
            });
        }

        const conversation = await Conversation.findOne({
            _id: conversationId,
            user: req.user.id,
            isArchived: false
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const cleanMessage = message.trim();

        // Save user message
        const userMessage = await Message.create({
            conversation: conversationId,
            role: 'user',
            content: cleanMessage
        });

        // Get previous conversation history
        const previousMessages = await Message.find({
            conversation: conversationId,
            _id: { $ne: userMessage._id },
            status: 'completed'
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

        const history = previousMessages.reverse().map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        try {
            // Generate AI response
            const aiResponse = await generateAIResponse(
                cleanMessage,
                history
            );

            // Save AI message
            const assistantMessage = await Message.create({
                conversation: conversationId,
                role: 'assistant',
                content: aiResponse
            });

            // Update conversation metadata
            if (conversation.title === 'New Chat') {
                conversation.title = cleanMessage.slice(0, 50);
            }

            conversation.lastMessage = aiResponse.slice(0, 200);

            await conversation.save();

            return res.status(200).json({
                success: true,
                userMessage,
                assistantMessage
            });

        } catch (aiError) {
            console.error('AI Generation:', aiError);

            return res.status(502).json({
                success: false,
                message: 'Your message was saved, but AI generation failed.',
                userMessage
            });
        }

    } catch (error) {
        console.error('Send Message:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to process your message'
        });
    }
};


// RENAME CONVERSATION
exports.renameConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { title } = req.body;

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation ID'
            });
        }

        if (
            typeof title !== 'string' ||
            !title.trim() ||
            title.trim().length > 150
        ) {
            return res.status(400).json({
                success: false,
                message: 'Title must contain 1-150 characters'
            });
        }

        const conversation = await Conversation.findOneAndUpdate(
            {
                _id: conversationId,
                user: req.user.id,
                isArchived: false
            },
            {
                title: title.trim()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        return res.status(200).json({
            success: true,
            conversation
        });

    } catch (error) {
        console.error('Rename Conversation:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to rename conversation'
        });
    }
};


// DELETE CONVERSATION
exports.deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        if (!mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid conversation ID'
            });
        }

        const conversation = await Conversation.findOneAndDelete({
            _id: conversationId,
            user: req.user.id
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        await Message.deleteMany({
            conversation: conversationId
        });

        return res.status(200).json({
            success: true,
            message: 'Conversation deleted successfully'
        });

    } catch (error) {
        console.error('Delete Conversation:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to delete conversation'
        });
    }
};
