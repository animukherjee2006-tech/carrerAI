
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        title: {
            type: String,
            default: 'New Chat',
            trim: true,
            maxlength: 150
        },

        lastMessage: {
            type: String,
            default: ''
        },

        isArchived: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model(
    'Conversation',
    conversationSchema
);
