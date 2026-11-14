def calculate_objective_score(profile_data: dict) -> int:
    """Computes a deterministic score out of 100 based on profile completeness and repos."""
    score = 50  # Base score
    
    # Profile completeness
    if profile_data.get("name"):
        score += 5
    if profile_data.get("bio"):
        score += 5
    if profile_data.get("followers", 0) > 5:
        score += 5

    repos = profile_data.get("repos", [])
    if not repos:
        return score

    # Repository metrics
    total_stars = sum(r.get("stars", 0) for r in repos)
    if total_stars > 10:
        score += 10
    elif total_stars > 0:
        score += 5

    # Check for repository descriptions & languages diversity
    languages = set(r.get("language") for r in repos if r.get("language"))
    if len(languages) >= 3:
        score += 10
    elif len(languages) >= 1:
        score += 5

    # Cap score at 98 to leave room for perfection
    return min(score, 98)