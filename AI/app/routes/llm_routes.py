from flask import Blueprint
from app.controllers.llm_controller import generate_ai_response
llm_bp = Blueprint("llm", __name__)

llm_bp.route(
    "/generate",
    methods = ["POST"]
)(generate_ai_response)