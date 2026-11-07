import os
from dotenv import load_dotenv

load_dotenv()

class Config:

    SECRET_KEY = os.getenv("SECRET_KEY")

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    AI_PORT = int(os.getenv("AI_PORT", 5000))

    DEBUG = os.getenv("DEBUG", "False").lower() == "true"