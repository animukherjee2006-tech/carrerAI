
import api from "./axios";

// Create new conversation
export const createConversation = async () => {
    const response = await api.post("/chat/conversations");
    return response.data;
};

// Get all conversations
export const getConversations = async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
};

// Get messages of a conversation
export const getMessages = async (conversationId) => {
    const response = await api.get(
        `/chat/conversations/${conversationId}/messages`
    );
    return response.data;
};

// Send message to AI
export const sendMessage = async (conversationId, message) => {
    const response = await api.post(
        `/chat/conversations/${conversationId}/messages`,
        { message }
    );
    return response.data;
};

// Rename conversation
export const renameConversation = async (conversationId, title) => {
    const response = await api.patch(
        `/chat/conversations/${conversationId}`,
        { title }
    );
    return response.data;
};

// Delete conversation
export const deleteConversation = async (conversationId) => {
    const response = await api.delete(
        `/chat/conversations/${conversationId}`
    );
    return response.data;
};
