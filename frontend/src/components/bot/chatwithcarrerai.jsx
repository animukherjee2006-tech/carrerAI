import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, RefreshCw } from 'lucide-react';
import { getMessages, sendMessage } from '../../Api/chatstore.api';

export default function ChatWithCareerAI({ activeConversation, onMessageSent }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (activeConversation?._id) {
            loadConversationMessages(activeConversation._id);
        } else {
            setMessages([
                {
                    role: 'assistant',
                    content: "Hello! I am CareerAI with RAG intelligence. I have direct access to your verified resume, profile skills, and target career goals. How can I assist you with your career strategy, interview prep, or resume today?"
                }
            ]);
        }
    }, [activeConversation?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, sending]);

    const loadConversationMessages = async (conversationId) => {
        try {
            setLoadingMessages(true);
            const data = await getMessages(conversationId);
            if (data.success) {
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                } else {
                    setMessages([
                        {
                            role: 'assistant',
                            content: `Starting conversation: "${activeConversation.title || 'New Chat'}". What would you like to discuss?`
                        }
                    ]);
                }
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        const userText = input.trim();
        setInput('');

        // Optimistically show user message
        const optimisticMsg = { role: 'user', content: userText, _id: `temp_${Date.now()}` };
        setMessages(prev => [...prev, optimisticMsg]);
        setSending(true);

        try {
            if (activeConversation?._id) {
                const res = await sendMessage(activeConversation._id, userText);
                if (res.success && res.assistantMessage) {
                    setMessages(prev => [...prev.filter(m => m._id !== optimisticMsg._id), res.userMessage, res.assistantMessage]);
                    onMessageSent?.(res.userMessage, res.assistantMessage);
                }
            }
        } catch (err) {
            console.error('Send error:', err);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: err.response?.data?.message || "Sorry, I encountered an issue processing your request. Please try again."
                }
            ]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0b0f19] text-slate-200 min-w-0">
            {/* Top Bar */}
            <div className="p-4 px-6 border-b border-slate-800/80 bg-[#070913]/60 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20 shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-white truncate">
                            {activeConversation?.title || "CareerAI Assistant"}
                        </h2>
                        <p className="text-[11px] text-slate-400">Contextual RAG Career Guidance</p>
                    </div>
                </div>

                <span className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Ready</span>
                </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-xs text-slate-500 space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Loading conversation...</span>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div
                                key={msg._id || idx}
                                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start space-x-2.5 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                                        isUser
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gradient-to-tr from-amber-500 to-pink-500 text-white'
                                    }`}>
                                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>

                                    <div
                                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                                            isUser
                                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {sending && (
                    <div className="flex justify-start">
                        <div className="p-4 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                            <span className="ml-1 text-slate-400">Synthesizing career advice...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-800/80 bg-[#070913]/60 flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask CareerAI about resume optimization, interview answers, or tech roadmap..."
                    disabled={sending}
                    className="flex-1 bg-[#090d16] border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1.5"
                >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                </button>
            </form>
        </div>
    );
}
