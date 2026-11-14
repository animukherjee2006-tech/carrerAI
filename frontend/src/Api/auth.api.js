import api from "./axios";

// Register
export const register = async (data) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
};

// Login
export const login = async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
};

// Logout
export const logout = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};

// Get current user
export const getme = async () => {
    const response = await api.get("/auth/getme");
    return response.data;
};


