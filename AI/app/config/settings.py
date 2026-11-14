import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "career-ai-default-secret-key-2026")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    AI_PORT = int(os.getenv("AI_PORT", 5000))
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
