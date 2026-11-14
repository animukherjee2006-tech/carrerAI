from fastapi import HTTPException
from app.services.github_service import fetch_github_profile
from app.services.github_analysis import calculate_objective_score
from app.services.github_ai_service import generate_ai_analysis

def handle_analyze_profile(username: str):
    try:
        # 1. Fetch real data from GitHub
        profile_data = fetch_github_profile(username)
        
        # 2. Calculate objective metrics
        score = calculate_objective_score(profile_data)
        
        # 3. Pass real context to Groq for qualitative review
        ai_result = generate_ai_analysis(profile_data, score)
        
        return ai_result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")