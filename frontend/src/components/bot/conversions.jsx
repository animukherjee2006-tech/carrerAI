import React from "react";
import { Plus, MessageSquare, Trash2, Edit3, Check, X } from "lucide-react";

export default function Conversions({
    conversations = [],
    activeConversationId,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
    onRenameConversation
}) {
    const [editingId, setEditingId] = React.useState(null);
    const [editTitle, setEditTitle] = React.useState("");

    const startRename = (conv, e) => {
        e.stopPropagation();
        setEditingId(conv._id);
        setEditTitle(conv.title || "New Chat");
    };

    const submitRename = (convId, e) => {
        e.stopPropagation();
        if (editTitle.trim()) {
            onRenameConversation(convId, editTitle.trim());
        }
        setEditingId(null);
    };

    return (
        <div className="w-full sm:w-72 bg-[#090d16] dark:bg-[#070714] border-r border-slate-800 text-slate-200 flex flex-col h-full shrink-0">
            {/* Header & New Chat Button */}
            <div className="p-4 border-b border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversations</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                        {conversations.length}
                    </span>
                </div>

                <button
                    onClick={onNewChat}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Start New Chat</span>
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {conversations.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-8">No chats yet. Start one!</p>
                ) : (
                    conversations.map((conv) => {
                        const isActive = activeConversationId === conv._id;
                        const isEditing = editingId === conv._id;

                        return (
                            <div
                                key={conv._id}
                                onClick={() => onSelectConversation(conv)}
                                className={`group px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer ${
                                    isActive
                                        ? "bg-slate-800 text-white shadow-sm border border-slate-700/80"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                                }`}
                            >
                                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-indigo-400" />
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full bg-slate-900 px-2 py-0.5 rounded border border-indigo-500 text-white text-xs outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="truncate">{conv.title || "New Chat"}</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={(e) => submitRename(conv._id, e)}
                                                className="p-1 text-emerald-400 hover:text-emerald-300"
                                            >
                                                <Check className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingId(null);
                                                }}
                                                className="p-1 text-slate-400 hover:text-slate-300"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => startRename(conv, e)}
                                                className="p-1 text-slate-400 hover:text-white"
                                                title="Rename"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteConversation(conv._id);
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-400"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
