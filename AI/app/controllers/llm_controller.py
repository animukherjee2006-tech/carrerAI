from flask import request, jsonify
from app.services.llm_service import generate_response
from app.services.resume_service import analyze_resume, match_resume_with_job
from app.services.interview_service import generate_interview_questions, evaluate_interview_answer
from app.services.career_service import generate_career_guidance, analyze_skill_gap, generate_roadmap
from app.services.rag_service import query_rag, index_user_resume
from app.services.github_service import analyze_github_profile
from app.utils.document_parser import extract_text_from_file

def generate_ai_response():
    try:
        data = request.get_json() or {}
        prompt = data.get("prompt", "").strip()
        history = data.get("history", [])

        if not prompt:
            return jsonify({
                "success": False,
                "message": "Prompt is required"
            }), 400

        response = generate_response(prompt=prompt, history=history)

        return jsonify({
            "success": True,
            "message": "AI response generated successfully",
            "data": {
                "response": response
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to generate AI response",
            "error": str(e)
        }), 500

def handle_resume_analyze():
    try:
        data = request.get_json() or {}
        resume_text = data.get("resumeText", "").strip()
        target_role = data.get("targetRole", "Software Engineer")
        career_level = data.get("careerLevel", "Fresher")

        if not resume_text:
            return jsonify({"success": False, "message": "resumeText is required"}), 400

        result = analyze_resume(resume_text=resume_text, target_role=target_role, career_level=career_level)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Resume analysis failed",
            "error": str(e)
        }), 500

def handle_resume_match_job():
    try:
        data = request.get_json() or {}
        resume_text = data.get("resumeText", "").strip()
        job_description = data.get("jobDescription", "").strip()
        target_role = data.get("targetRole", "")

        if not resume_text or not job_description:
            return jsonify({"success": False, "message": "Both resumeText and jobDescription are required"}), 400

        result = match_resume_with_job(resume_text=resume_text, job_description=job_description, target_role=target_role)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Job match analysis failed",
            "error": str(e)
        }), 500

def handle_parse_file():
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "message": "No file uploaded"}), 400
        f = request.files["file"]
        if not f.filename:
            return jsonify({"success": False, "message": "Empty filename"}), 400

        file_bytes = f.read()
        extracted = extract_text_from_file(file_bytes, f.filename)
        return jsonify({
            "success": True,
            "filename": f.filename,
            "extractedText": extracted,
            "charCount": len(extracted)
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "File parsing failed", "error": str(e)}), 500

def handle_interview_generate():
    try:
        data = request.get_json() or {}
        target_role = data.get("targetRole", "Software Engineer")
        career_level = data.get("careerLevel", "Fresher")
        interview_type = data.get("interviewType", "Technical")
        count = int(data.get("count", 5))

        questions = generate_interview_questions(
            target_role=target_role,
            career_level=career_level,
            interview_type=interview_type,
            count=count
        )
        return jsonify({
            "success": True,
            "data": {
                "questions": questions
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Failed to generate interview", "error": str(e)}), 500

def handle_interview_evaluate():
    try:
        data = request.get_json() or {}
        question = data.get("question", "").strip()
        answer = data.get("answer", "").strip()
        target_role = data.get("targetRole", "Software Engineer")
        interview_type = data.get("interviewType", "Technical")

        if not question or not answer:
            return jsonify({"success": False, "message": "Both question and answer are required"}), 400

        evaluation = evaluate_interview_answer(
            question=question,
            answer=answer,
            target_role=target_role,
            interview_type=interview_type
        )
        return jsonify({
            "success": True,
            "data": evaluation
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Evaluation failed", "error": str(e)}), 500

def handle_career_guidance():
    try:
        data = request.get_json() or {}
        target_role = data.get("targetRole", "Full Stack Developer")
        career_level = data.get("careerLevel", "Fresher")
        current_skills = data.get("currentSkills", [])

        result = generate_career_guidance(target_role=target_role, career_level=career_level, current_skills=current_skills)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Career guidance failed", "error": str(e)}), 500

def handle_skill_gap():
    try:
        data = request.get_json() or {}
        target_role = data.get("targetRole", "Full Stack Developer")
        current_skills = data.get("currentSkills", [])

        result = analyze_skill_gap(target_role=target_role, current_skills=current_skills)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Skill gap analysis failed", "error": str(e)}), 500

def handle_career_roadmap():
    try:
        data = request.get_json() or {}
        target_role = data.get("targetRole", "Full Stack Developer")
        career_level = data.get("careerLevel", "Fresher")
        timeframe_months = int(data.get("timeframeMonths", 6))
        current_skills = data.get("currentSkills", [])

        result = generate_roadmap(target_role=target_role, career_level=career_level, timeframe_months=timeframe_months, current_skills=current_skills)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Roadmap generation failed", "error": str(e)}), 500

def handle_github_analyze():
    try:
        data = request.get_json() or {}
        username = data.get("username", "").strip()
        repo_data = data.get("repoData", [])

        if not username:
            return jsonify({"success": False, "message": "GitHub username is required"}), 400

        result = analyze_github_profile(username=username, repo_data=repo_data)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "GitHub analysis failed", "error": str(e)}), 500

def handle_rag_query():
    try:
        data = request.get_json() or {}
        query = data.get("query", "").strip()
        user_id = data.get("userId", None)

        if not query:
            return jsonify({"success": False, "message": "Query is required"}), 400

        result = query_rag(query=query, user_id=user_id)
        return jsonify({
            "success": True,
            "data": result
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "RAG query failed", "error": str(e)}), 500

def handle_rag_index_resume():
    try:
        data = request.get_json() or {}
        user_id = data.get("userId", "default")
        resume_text = data.get("resumeText", "").strip()

        if not resume_text:
            return jsonify({"success": False, "message": "resumeText is required for indexing"}), 400

        index_user_resume(user_id=user_id, resume_text=resume_text)
        return jsonify({
            "success": True,
            "message": "Resume indexed successfully into vector store"
        }), 200
    except Exception as e:
        return jsonify({"success": False, "message": "Indexing failed", "error": str(e)}), 500