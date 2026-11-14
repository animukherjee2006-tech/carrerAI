// src/Api/aiAxios.js
import axios from "axios";

const aiApi = axios.create({
    baseURL: "http://localhost:5000/api", // 👈 Make sure this matches your Flask server port (5000, 8000, etc.)
    headers: {
        "Content-Type": "application/json"
    }
});

export default aiApi;