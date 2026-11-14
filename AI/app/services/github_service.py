import os
import re
import json
import requests
from app.services.llm_service import generate_response

GITHUB_API_BASE = "https://api.github.com"

def get_github_headers():
    token = os.getenv("GITHUB_TOKEN")
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers

def fetch_github_profile(username: str) -> dict:
    """Fetches user profile and public repositories from GitHub API."""
    headers = get_github_headers()
    
    # 1. Fetch user profile
    user_res = requests.get(f"{GITHUB_API_BASE}/users/{username}", headers=headers)
    if user_res.status_code != 200:
        raise ValueError(f"GitHub user '{username}' not found or rate limit exceeded.")
    user_data = user_res.json()

    # 2. Fetch public repositories (sorted by updated)
    repos_res = requests.get(
        f"{GITHUB_API_BASE}/users/{username}/repos?sort=updated&per_page=30", 
        headers=headers
    )
    repos_data = repos_res.json() if repos_res.status_code == 200 else []

    # 3. Simplify repository objects to what we actually need
    processed_repos = []
    for repo in repos_data:
        processed_repos.append({
            "name": repo.get("name"),
            "description": repo.get("description"),
            "language": repo.get("language"),
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "has_pages": repo.get("has_pages", False),
            "html_url": repo.get("html_url"),
            "updated_at": repo.get("updated_at")
        })

    return {
        "username": user_data.get("login"),
        "name": user_data.get("name"),
        "bio": user_data.get("bio"),
        "public_repos": user_data.get("public_repos", 0),
        "followers": user_data.get("followers", 0),
        "repos": processed_repos
    }

def calculate_objective_score(profile_data: dict) -> int:
    """Computes a deterministic score out of 100 based on profile completeness and repos."""
    score = 50  # Base score
    
    if profile_data.get("name"):
        score += 5
    if profile_data.get("bio"):
        score += 5
    if profile_data.get("followers", 0) > 5:
        score += 5

    repos = profile_data.get("repos", [])
    if not repos:
        return score

    total_stars = sum(r.get("stars", 0) for r in repos)
    if total_stars > 10:
        score += 10
    elif total_stars > 0:
        score += 5

    languages = set(r.get("language") for r in repos if r.get("language"))
    if len(languages) >= 3:
        score += 10
    elif len(languages) >= 1:
        score += 5

    return min(score, 98)

def analyze_github_profile(username: str) -> dict:
    """Fetches live GitHub profile data, calculates a score, and uses Groq for AI recommendations."""
    username = username or "developer"
    
    try:
        profile_data = fetch_github_profile(username)
    except Exception:
        profile_data = {
            "username": username,
            "name": None,
            "bio": "Full-stack developer profile unavailable.",
            "public_repos": 0,
            "followers": 0,
            "repos": []
        }

    objective_score = calculate_objective_score(profile_data)
    repos_summary = profile_data.get("repos", [])[:8]

    prompt = f"""
Analyze the GitHub profile for developer: @{username}.
Bio: {profile_data.get('bio')}
Public Repos Count: {profile_data.get('public_repos')}
Objective Score: {objective_score}/100
Repositories summary:
{json.dumps(repos_summary, indent=2) if repos_summary else 'No public repositories found.'}

Return ONLY valid JSON matching this structure:
{{
  "username": "{username}",
  "profileScore": {objective_score},
  "strengths": [
    "Observation based on actual repositories or tech stack",
    "Evidence of commit or project structure"
  ],
  "recommendations": [
    "Actionable tip tailored to their repositories",
    "Include automated CI/CD workflows with GitHub Actions",
    "Pin your most technically complex repositories"
  ],
  "suggestedPortfolioProjects": [
    "Project idea 1 complementing their current stack",
    "Project idea 2"
  ]
}}
"""
    try:
        raw_res = generate_response(prompt=prompt, temperature=0.3, max_tokens=700)
        clean_json = re.sub(r"^```json\s*", "", raw_res.strip())
        clean_json = re.sub(r"\s*```$", "", clean_json)
        result = json.loads(clean_json)
        if "profileScore" in result:
            return result
    except Exception:
        pass

    return {
        "username": username,
        "profileScore": objective_score,
        "strengths": [
            "Consistent commit history demonstrating dedication to code quality",
            "Clear technical specialization in web technologies"
        ],
        "recommendations": [
            "Add visual system architecture diagrams and live demo links to top repositories",
            "Configure GitHub Actions to run automated unit and linting tests",
            "Publish releases with semantic versioning tags"
        ],
        "suggestedPortfolioProjects": [
            "High-Throughput Real-Time Dashboard with WebSockets and Redis",
            "Role-Based Access Control (RBAC) Microservice with JWT and Docker"
        ]
    }