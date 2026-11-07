from flask import Flask
from flask_cors import CORS # type: ignore
from app.config.settings import Config
from app.routes.llm_routes import llm_bp

def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    app.register_blueprint(
            llm_bp,
            url_prefix="/api/ai"
        )

    @app.route("/", methods=["GET"])
    def home():
        return {
            "success": True,
            "message": "CareerAI AI Service is running!"
        }

    @app.route("/health", methods=["GET"])
    def health():
        return {
            "success": True,
            "status": "healthy",
            "service": "CareerAI AI Engine"
        }

 
    return app