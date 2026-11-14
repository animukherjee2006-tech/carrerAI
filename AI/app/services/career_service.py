import re
import json
from app.services.llm_service import generate_response

CAREER_PATHS_DATABASE = {
    "software engineer": {
        "requiredSkills": ["Data Structures", "Algorithms", "System Design", "Git", "REST APIs", "SQL", "CI/CD", "Docker"],
        "certifications": ["AWS Certified Developer Associate", "CKAD: Certified Kubernetes Application Developer"],
        "milestones": [
            {"phase": "Phase 1: Foundations", "focus": "Clean code, testing paradigms, and relational database normalization."},
            {"phase": "Phase 2: System Scalability", "focus": "Caching architectures (Redis), asynchronous queues (RabbitMQ/Kafka), and Docker containers."},
            {"phase": "Phase 3: Production Leadership", "focus": "Distributed architectures, microservices, observability, and mentoring junior devs."}
        ]
    },
    "full stack developer": {
        "requiredSkills": ["React", "Node.js", "TypeScript", "Tailwind CSS", "MongoDB", "PostgreSQL", "REST APIs", "Docker", "GraphQL", "Testing"],
        "certifications": ["Meta Front-End Developer", "MongoDB Certified Developer Associate"],
        "milestones": [
            {"phase": "Phase 1: UI & Server Foundations", "focus": "Master modern React 19/Next.js, state management, and Express/Node.js API patterns."},
            {"phase": "Phase 2: Full-Stack Integration", "focus": "Authentication (JWT/OAuth), relational + document databases, and cloud asset storage."},
            {"phase": "Phase 3: Enterprise Deployment", "focus": "End-to-end testing (Playwright/Jest), Docker deployment, and performance monitoring."}
        ]
    },
    "devops engineer": {
        "requiredSkills": ["Linux", "Docker", "Kubernetes", "AWS/GCP", "Terraform", "CI/CD", "Prometheus", "Bash/Python"],
        "certifications": ["AWS Certified Solutions Architect", "CKA: Certified Kubernetes Administrator"],
        "milestones": [
            {"phase": "Phase 1: Infrastructure & Scripting", "focus": "Linux administration, networking fundamentals, and automation scripting."},
            {"phase": "Phase 2: Container Orchestration", "focus": "Kubernetes cluster operations, Helm charts, and declarative deployments."},
            {"phase": "Phase 3: GitOps & Site Reliability", "focus": "Terraform Infrastructure as Code, Prometheus/Grafana alerting, and zero-downtime rollouts."}
        ]
    }
}

def generate_career_guidance(target_role: str = "Full Stack Developer", career_level: str = "Fresher", current_skills: list = None) -> dict:
    """Generate personalized career guidance, competencies, and milestones."""
    current_skills = current_skills or []
    prompt = f"""
Provide comprehensive career guidance for a {career_level} aspiring to be a {target_role}.
Current Skills: {', '.join(current_skills) if current_skills else 'Beginner fundamentals'}

Return ONLY a valid JSON object matching this schema:
{{
  "targetRole": "{target_role}",
  "overview": "Detailed strategic trajectory overview",
  "keyCompetencies": ["comp1", "comp2", "comp3", "comp4"],
  "milestones": [
    {{"phase": "Months 1-2: Title", "focus": "Key learning and practice focus"}},
    {{"phase": "Months 3-4: Title", "focus": "Key learning and practice focus"}},
    {{"phase": "Months 5-6: Title", "focus": "Key learning and practice focus"}}
  ],
  "recommendedCertifications": ["Cert 1", "Cert 2"]
}}
"""
    try:
        raw_res = generate_response(prompt=prompt, temperature=0.4, max_tokens=900)
        clean_json = re.sub(r"^```json\s*", "", raw_res.strip())
        clean_json = re.sub(r"\s*```$", "", clean_json)
        result = json.loads(clean_json)
        if "keyCompetencies" in result:
            return result
    except Exception:
        pass

    defaults = CAREER_PATHS_DATABASE.get(target_role.lower(), CAREER_PATHS_DATABASE["full stack developer"])
    return {
        "targetRole": target_role,
        "overview": f"A targeted, actionable roadmap to accelerate your proficiency and compensation as a {target_role}.",
        "keyCompetencies": defaults["requiredSkills"][:5],
        "milestones": defaults["milestones"],
        "recommendedCertifications": defaults["certifications"]
    }

def analyze_skill_gap(target_role: str = "Full Stack Developer", current_skills: list = None) -> dict:
    """Calculate missing skills, proficiency priorities, learning sequence, and portfolio projects."""
    current = [s.strip() for s in (current_skills or []) if s.strip()]
    current_lower = {s.lower() for s in current}

    defaults = CAREER_PATHS_DATABASE.get(target_role.lower(), CAREER_PATHS_DATABASE["full stack developer"])
    required = defaults["requiredSkills"]

    missing = []
    for req in required:
        if req.lower() not in current_lower:
            missing.append({
                "skill": req,
                "priority": "High" if len(missing) < 2 else "Medium",
                "difficulty": "Intermediate" if "Design" not in req and "Kubernetes" not in req else "Advanced",
                "estimatedHours": 20 if "Design" not in req else 35
            })

    learning_sequence = [
        f"Master {m['skill']} through hands-on implementation and architecture design"
        for m in missing[:4]
    ] or [f"Deepen knowledge in scalable architectures and distributed system trade-offs for {target_role}"]

    recommended_projects = [
        {
            "name": f"{target_role.replace(' ', '')} Microservices Architecture",
            "description": "Construct an end-to-end resilient service with event streaming, caching, and CI/CD pipelines.",
            "skills": [m["skill"] for m in missing[:3]] or ["Docker", "Redis", "TypeScript"]
        },
        {
            "name": "High-Throughput Collaborative Workspace",
            "description": "Create a real-time collaborative document editor with WebSocket syncing and optimistic concurrency.",
            "skills": ["WebSockets", "State Management", "Automated Testing"]
        }
    ]

    return {
        "targetRole": target_role,
        "currentSkills": current,
        "requiredSkills": required,
        "skillsAcquired": current,
        "skillsMissing": missing,
        "learningSequence": learning_sequence,
        "recommendedProjects": recommended_projects
    }

def generate_roadmap(target_role: str = "Full Stack Developer", career_level: str = "Fresher", timeframe_months: int = 6, current_skills: list = None) -> dict:
    """Generate a phased career roadmap with milestones and goals."""
    months = max(3, min(12, timeframe_months))
    num_phases = 3 if months <= 6 else 4
    months_per_phase = months // num_phases

    phases = []
    for i in range(1, num_phases + 1):
        start_m = (i - 1) * months_per_phase + 1
        end_m = i * months_per_phase
        if i == 1:
            title = "Core Mastery & Code Hygiene"
            goals = ["Refactor existing projects into modular patterns", "Implement unit test suites with >80% coverage", "Master advanced language idioms and asynchronous execution"]
        elif i == 2:
            title = "Systems Architecture & Cloud Infrastructure"
            goals = ["Containerize full application stacks with Docker", "Integrate automated CI/CD builds with GitHub Actions", "Design database indexes and optimize slow queries"]
        else:
            title = "Production Capstone & Interview Readiness"
            goals = ["Deploy a live production capstone with monitoring & alerts", "Conduct 20+ mock interview rounds on data structures and system design", "Polish resume and portfolio targeting top-tier openings"]

        phases.append({
            "phaseNumber": i,
            "title": title,
            "duration": f"Month {start_m} - Month {end_m}",
            "goals": goals,
            "completed": False
        })

    return {
        "targetRole": target_role,
        "timeframe": f"{months} Months",
        "phases": phases
    }
