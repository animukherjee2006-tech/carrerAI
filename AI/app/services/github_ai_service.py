import json
from app.services.llm_service import generate_response

def generate_ai_analysis(profile_data: dict, objective_score: int) -> dict:
    """Uses Groq LLM to generate qualitative feedback based on real data."""
    username = profile_data["username"]
    repos_summary = profile_data["repos"][:8]  # Send top 8 recent repos to LLM

    prompt = f"""
You are an expert technical recruiter and senior software engineer. Analyze this real GitHub developer profile.

Developer: @{username}
Bio: {profile_data.get('bio')}
Public Repos Count: {profile_data.get('public_repos')}
Objective Calculated Score: {objective_score}/100
Recent Repositories & Tech Stack:
{json.dumps(repos_summary, indent=2)}

Return ONLY valid JSON matching this exact structure:
{
  "username": "{username}",
  "profileScore": {objective_score},
  "strengths": [
    "Specific strength based on their actual repositories or languages",
    "Another specific observation"
  ],
  "recommendations": [
    "Actionable tip 1 tailored to their tech stack",
    "Actionable tip 2"
  ],
  "suggestedPortfolioProjects": [
    "Project idea 1 that complements their current stack",
    "Project idea 2"
  ]
}
"""
    try:
        raw_res = generate_response(prompt=prompt, temperature=0.3, max_tokens=800)
        # Clean potential markdown block wrappers
        clean_json = raw_res.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(clean_json)
    except Exception:
        # Fallback dictionary if LLM formatting fails
        return {
            "username": username,
            "profileScore": objective_score,
            "strengths": ["Active public code repositories", "Consistent project structure"],
            "recommendations": ["Add comprehensive README files", "Include live deployment links"],
            "suggestedPortfolioProjects": ["Full-Stack Dashboard with CI/CD", "REST API with Automated Testing"]
        }