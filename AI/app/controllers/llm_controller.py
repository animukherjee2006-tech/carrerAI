from flask import request,jsonify
from app.services.llm_service import generate_response


def generate_ai_response():

    try:
        data = request.get_json()

        if not data or "prompt" not in data:
            return jsonify({
                "success": False,
                "message": "Prompt is required"
            }), 400

        prompt = data["prompt"].strip()

        if not prompt:
            return jsonify({
                "success": False,
                "message": "Prompt cannot be empty"
            }), 400

        response = generate_response(prompt)

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