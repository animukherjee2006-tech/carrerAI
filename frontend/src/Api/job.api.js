import api from "./axios";

// Get jobs with filters
export const getJobs = async (filters = {}) => {
    const response = await api.get("/jobs", { params: filters });
    return response.data;
};

// Get single job
export const getJobById = async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
};

// Get user applications / saved jobs
export const getUserApplications = async () => {
    const response = await api.get("/jobs/applications");
    return response.data;
};

// Track or save job
export const trackApplication = async (data) => {
    const response = await api.post("/jobs/applications", data);
    return response.data;
};

// Update status
export const updateApplicationStatus = async (applicationId, status, notes) => {
    const response = await api.patch(`/jobs/applications/${applicationId}`, { status, notes });
    return response.data;
};

// Delete application
export const deleteApplication = async (applicationId) => {
    const response = await api.delete(`/jobs/applications/${applicationId}`);
    return response.data;
};
