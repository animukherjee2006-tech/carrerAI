from flask import Blueprint
from app.controllers.llm_controller import (
    generate_ai_response,
    handle_resume_analyze,
    handle_resume_match_job,
    handle_parse_file,
    handle_interview_generate,
    handle_interview_evaluate,
    handle_career_guidance,
    handle_skill_gap,
    handle_career_roadmap,
    handle_github_analyze,
    handle_rag_query,
    handle_rag_index_resume
)

llm_bp = Blueprint("llm", __name__)

# General AI Chat
llm_bp.route("/generate", methods=["POST"])(generate_ai_response)

# Resume & ATS Analysis
llm_bp.route("/resume/analyze", methods=["POST"])(handle_resume_analyze)
llm_bp.route("/resume/match-job", methods=["POST"])(handle_resume_match_job)
llm_bp.route("/resume/parse-file", methods=["POST"])(handle_parse_file)

# Interview Preparation
llm_bp.route("/interview/generate", methods=["POST"])(handle_interview_generate)
llm_bp.route("/interview/evaluate", methods=["POST"])(handle_interview_evaluate)

# Career Guidance & Skill Gap
llm_bp.route("/career/guidance", methods=["POST"])(handle_career_guidance)
llm_bp.route("/career/skill-gap", methods=["POST"])(handle_skill_gap)
llm_bp.route("/career/roadmap", methods=["POST"])(handle_career_roadmap)

# Advanced: GitHub & RAG
llm_bp.route("/github/analyze", methods=["POST"])(handle_github_analyze)
llm_bp.route("/rag/query", methods=["POST"])(handle_rag_query)
llm_bp.route("/rag/index-resume", methods=["POST"])(handle_rag_index_resume)
