// src/Api/ai.api.js
import aiApi from "./flaskaxios";

export const generateAiResponse = (data) =>
    aiApi.post("/ai/generate", data);