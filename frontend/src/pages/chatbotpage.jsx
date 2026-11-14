import React, { useState, useEffect } from 'react';
import Conversions from '../components/bot/conversions';
import ChatWithCareerAI from '../components/bot/chatwithcarrerai';
import {
    getConversations,
    createConversation,
    deleteConversation,
    renameConversation
} from '../Api/chatstore.api';

export default function ChatbotPage() {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);

    const handleNewChat = async () => {
        try {
            const data = await createConversation();
            if (data.success && data.conversation) {
                setConversations(prev => [data.conversation, ...prev]);
                setActiveConversation(data.conversation);
            }
        } catch (err) {
            console.error('Create conversation error:', err);
        }
    };

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            if (data.success && data.conversations) {
                setConversations(data.conversations);
                if (data.conversations.length > 0) {
                    setActiveConversation(data.conversations[0]);
                } else {
                    handleNewChat();
                }
            }
        } catch (err) {
            console.error('Failed to load conversations:', err);
        }
    };

    useEffect(() => {
        loadConversations();
    }, []);

    const handleDeleteConversation = async (id) => {
        try {
            await deleteConversation(id);
            const remaining = conversations.filter(c => c._id !== id);
            setConversations(remaining);
            if (activeConversation?._id === id) {
                setActiveConversation(remaining[0] || null);
            }
        } catch (err) {
            console.error('Delete conversation error:', err);
        }
    };

    const handleRenameConversation = async (id, title) => {
        try {
            const res = await renameConversation(id, title);
            if (res.success && res.conversation) {
                setConversations(prev => prev.map(c => c._id === id ? res.conversation : c));
                if (activeConversation?._id === id) {
                    setActiveConversation(res.conversation);
                }
            }
        } catch (err) {
            console.error('Rename conversation error:', err);
        }
    };

    const handleMessageSent = (userMsg, aiMsg) => {
        // If the conversation was "New Chat", it might have been auto-titled
        loadConversations();
    };

    return (
        <div className="h-[82vh] rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-2xl flex overflow-hidden">
            <Conversions
                conversations={conversations}
                activeConversationId={activeConversation?._id}
                onSelectConversation={(conv) => setActiveConversation(conv)}
                onNewChat={handleNewChat}
                onDeleteConversation={handleDeleteConversation}
                onRenameConversation={handleRenameConversation}
            />

            <ChatWithCareerAI
                activeConversation={activeConversation}
                onMessageSent={handleMessageSent}
            />
        </div>
    );
}
