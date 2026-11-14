import re
import json
from app.services.llm_service import generate_response

COMMON_TECH_SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP",
    "React", "Next.js", "Vue.js", "Angular", "HTML", "CSS", "Tailwind CSS", "Redux",
    "Node.js", "Express", "Flask", "Django", "FastAPI", "Spring Boot", ".NET",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Elasticsearch", "SQLite", "Firebase",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub Actions",
    "GraphQL", "REST APIs", "Microservices", "Kafka", "RabbitMQ", "Linux",
    "System Design", "Agile", "Scrum", "Jest", "Pytest", "Unit Testing"
]

ROLE_REQUIREMENTS = {
    "software engineer": ["Data Structures", "Algorithms", "Git", "REST APIs", "Unit Testing", "System Design"],
    "frontend developer": ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Tailwind CSS", "Redux", "Web Performance"],
    "backend developer": ["Node.js", "Python", "MongoDB", "PostgreSQL", "REST APIs", "Docker", "System Design", "Microservices"],
    "full stack developer": ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", "Docker", "REST APIs", "Git"],
    "devops engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform", "Linux", "Git", "Monitoring"],
    "data scientist": ["Python", "Machine Learning", "Pandas", "NumPy", "SQL", "Statistics", "Scikit-Learn"]
}

def extract_skills_from_text(text: str) -> list:
    """Extract known technical skills from text with case-insensitive boundary matching."""
    text_lower = text.lower()
    found = []
    for skill in COMMON_TECH_SKILLS:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.append(skill)
    return list(dict.fromkeys(found))

def analyze_resume(resume_text: str, target_role: str = "Software Engineer", career_level: str = "Fresher") -> dict:
    """
    Perform deep ATS analysis, skill extraction, bullet improvements, and scoring.
    """
    if not resume_text or len(resume_text.strip()) < 20:
        return {
            "overallScore": 45,
            "atsCompatibility": 50,
            "impactScore": 40,
            "brevityScore": 60,
            "skillsFound": [],
            "missingSkills": ROLE_REQUIREMENTS.get(target_role.lower(), ["Problem Solving", "Git", "REST APIs"]),
            "summary": "The resume text provided is too short or empty for complete analysis.",
            "sectionFeedback": [],
            "bulletImprovements": []
        }

    skills_found = extract_skills_from_text(resume_text)
    norm_role = target_role.lower()
    role_skills = ROLE_REQUIREMENTS.get(norm_role, ["JavaScript", "Python", "Git", "REST APIs", "System Design"])
    missing_skills = [s for s in role_skills if s not in skills_found]

    # Metrics heuristics
    numbers_count = len(re.findall(r"\b\d+(?:\.\d+)?%?\b", resume_text))
    bullet_count = len(re.findall(r"(?:•|\*|-|\d+\.)", resume_text))
    action_verbs = len(re.findall(r"\b(led|built|developed|architected|designed|implemented|optimized|reduced|increased|delivered)\b", resume_text, re.I))

    # Calculate sub-scores (0-100)
    ats_score = min(96, max(50, 60 + len(skills_found) * 3))
    impact_score = min(95, max(45, 50 + numbers_count * 3 + action_verbs * 2))
    brevity_score = 85 if 200 <= len(resume_text.split()) <= 800 else 70
    overall = int((ats_score * 0.4) + (impact_score * 0.4) + (brevity_score * 0.2))

    # Prompt LLM for structured analysis
    prompt = f"""
Analyze this resume for a {target_role} ({career_level} level).
Resume Text:
\"\"\"
{resume_text[:2500]}
\"\"\"

Return ONLY valid JSON matching this exact structure:
{{
  "summary": "2-3 sentence executive assessment of candidate fit and ATS readiness",
  "sectionFeedback": [
    {{"section": "Contact Information", "status": "Good", "feedback": "assessment"}},
    {{"section": "Work Experience", "status": "Needs Improvement", "feedback": "assessment"}},
    {{"section": "Skills & Keywords", "status": "Good", "feedback": "assessment"}}
  ],
  "bulletImprovements": [
    {{"original": "weak bullet or project detail from resume", "improved": "strong Google XYZ bullet with numbers"}}
  ]
}}
"""
    try:
        raw_res = generate_response(prompt=prompt, temperature=0.3, max_tokens=1000)
        # Extract JSON from code blocks if present
        clean_json = re.sub(r"^```json\s*", "", raw_res.strip())
        clean_json = re.sub(r"\s*```$", "", clean_json)
        parsed = json.loads(clean_json)

        return {
            "overallScore": overall,
            "atsCompatibility": ats_score,
            "impactScore": impact_score,
            "brevityScore": brevity_score,
            "skillsFound": skills_found,
            "missingSkills": missing_skills,
            "summary": parsed.get("summary", f"Solid profile for {target_role}. Incorporate more quantifiable outcomes and high-demand cloud keywords."),
            "sectionFeedback": parsed.get("sectionFeedback", [
                {"section": "Work Experience", "status": "Good", "feedback": "Clear progression, but add more business impact metrics."},
                {"section": "Skills & Keywords", "status": "Needs Improvement", "feedback": f"Add missing keywords: {', '.join(missing_skills[:3])}."}
            ]),
            "bulletImprovements": parsed.get("bulletImprovements", [
                {"original": "Worked on backend APIs", "improved": "Engineered 12+ RESTful microservices in Node.js/Python, reducing response latency by 35%"}
            ])
        }
    except Exception:
        return {
            "overallScore": overall,
            "atsCompatibility": ats_score,
            "impactScore": impact_score,
            "brevityScore": brevity_score,
            "skillsFound": skills_found,
            "missingSkills": missing_skills,
            "summary": f"Your resume demonstrates strong technical foundations for {target_role}. Boost your score by integrating quantifiable metrics into each experience item.",
            "sectionFeedback": [
                {"section": "Work Experience", "status": "Good", "feedback": "Strong descriptions, recommend highlighting concrete outcomes."},
                {"section": "Skills & Keywords", "status": "Needs Improvement", "feedback": f"Target missing key tools: {', '.join(missing_skills[:4])}."}
            ],
            "bulletImprovements": [
                {"original": "Helped develop web application features", "improved": "Spearheaded implementation of 8+ user-facing features using modern React and TypeScript, boosting conversion by 22%"}
            ]
        }

def match_resume_with_job(resume_text: str, job_description: str, target_role: str = "") -> dict:
    """Calculate semantic and keyword compatibility between resume and a job description."""
    resume_skills = set(extract_skills_from_text(resume_text))
    job_skills = set(extract_skills_from_text(job_description))

    matching = list(resume_skills.intersection(job_skills))
    missing = list(job_skills.difference(resume_skills))

    match_ratio = len(matching) / max(1, len(job_skills))
    score = min(98, max(45, int(match_ratio * 100)))

    return {
        "matchScore": score,
        "matchingSkills": matching,
        "missingKeywords": missing,
        "recommendation": f"Your profile matches {len(matching)} key requirements. To achieve a 90%+ match, incorporate experience with {', '.join(missing[:3]) if missing else 'system architecture'}."
    }
