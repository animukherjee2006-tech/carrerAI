import api from "./axios";

// Dashboard overview
export const getDashboardOverview = async () => {
    const response = await api.get("/career/dashboard");
    return response.data;
};

// Resume Analysis
export const getResumeAnalysis = async () => {
    const response = await api.get("/career/resume/analysis");
    return response.data;
};

export const reanalyzeResume = async (data) => {
    const response = await api.post("/career/resume/reanalyze", data);
    return response.data;
};

export const matchResumeWithJob = async (jobDescription, targetRole) => {
    const response = await api.post("/career/resume/match-job", { jobDescription, targetRole });
    return response.data;
};

// Career Guidance & Skill Gap
export const getCareerGuidance = async (targetRole, careerLevel) => {
    const response = await api.get("/career/guidance", { params: { targetRole, careerLevel } });
    return response.data;
};

export const getSkillGap = async (targetRole) => {
    const response = await api.get("/career/skill-gap", { params: { targetRole } });
    return response.data;
};

// Career Roadmap
export const getRoadmap = async () => {
    const response = await api.get("/career/roadmap");
    return response.data;
};

export const updateRoadmapGoal = async (phaseIndex, goalIndex, completed) => {
    const response = await api.put("/career/roadmap/goal", { phaseIndex, goalIndex, completed });
    return response.data;
};

export const regenerateRoadmap = async (targetRole, timeframeMonths) => {
    const response = await api.post("/career/roadmap/regenerate", { targetRole, timeframeMonths });
    return response.data;
};

// GitHub Analysis
export const analyzeGithub = async (username) => {
    const response = await api.post("/career/github/analyze", { username });
    return response.data;
};
