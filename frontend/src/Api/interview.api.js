import api from "./axios";

// Start interview session
export const startInterview = async (data) => {
    const response = await api.post("/interviews/start", data);
    return response.data;
};

// Submit answer for evaluation
export const submitInterviewAnswer = async (interviewId, questionIndex, answer) => {
    const response = await api.post(`/interviews/${interviewId}/submit`, { questionIndex, answer });
    return response.data;
};

// Get interview history
export const getInterviewHistory = async () => {
    const response = await api.get("/interviews/history");
    return response.data;
};

// Get single interview details
export const getInterviewDetails = async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}`);
    return response.data;
};
