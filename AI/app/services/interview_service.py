import re
import json
from app.services.llm_service import generate_response

def generate_interview_questions(target_role: str = "Software Engineer", career_level: str = "Fresher", interview_type: str = "Technical", count: int = 5) -> list:
    """Generate role-specific and level-calibrated interview questions."""
    prompt = f"""
You are a Lead Hiring Manager. Generate {count} interview questions for a {career_level} {target_role}.
Interview Type: {interview_type} (e.g. Technical, Behavioral, System Design, HR).

Return ONLY a valid JSON array of objects with this schema:
[
  {{
    "id": 1,
    "question": "Question text",
    "category": "Topic or Competency",
    "difficulty": "Easy/Medium/Hard",
    "hint": "Short tip on what interviewers look for"
  }}
]
"""
    try:
        raw_res = generate_response(prompt=prompt, temperature=0.5, max_tokens=1000)
        clean_json = re.sub(r"^```json\s*", "", raw_res.strip())
        clean_json = re.sub(r"\s*```$", "", clean_json)
        questions = json.loads(clean_json)
        if isinstance(questions, list) and len(questions) > 0:
            return questions
    except Exception:
        pass

    # High quality fallback question sets
    if interview_type.lower() == "behavioral":
        return [
            {"id": 1, "question": "Describe a challenging technical disagreement with a colleague and how you arrived at a consensus.", "category": "Conflict Resolution", "difficulty": "Medium", "hint": "Demonstrate active listening and data-driven debate."},
            {"id": 2, "question": "Tell me about a high-pressure deadline where requirements changed late. How did you manage expectations?", "category": "Adaptability", "difficulty": "Medium", "hint": "Focus on trade-off communication and prioritization."},
            {"id": 3, "question": "Give an example of a mistake you made in production code and how you addressed it.", "category": "Accountability & Postmortem", "difficulty": "Hard", "hint": "Highlight rapid remediation and blameless retrospective."},
            {"id": 4, "question": "How do you handle ambiguous requirements when starting a new initiative?", "category": "Problem Solving", "difficulty": "Medium", "hint": "Explain how you ask clarifying questions and build quick prototypes."},
            {"id": 5, "question": "What is an engineering practice or tool you introduced to improve team workflow?", "category": "Leadership & Initiative", "difficulty": "Medium", "hint": "Discuss measurable efficiency gains."}
        ]
    elif interview_type.lower() == "hr":
        return [
            {"id": 1, "question": f"What motivates you to pursue a {target_role} role at this stage of your career?", "category": "Motivation", "difficulty": "Easy", "hint": "Connect your passion to the role's challenges."},
            {"id": 2, "question": "How do you maintain work-life balance and avoid burnout during intensive project sprints?", "category": "Self Management", "difficulty": "Easy", "hint": "Talk about proactive timeboxing and communication."},
            {"id": 3, "question": "Describe your ideal team environment and culture for doing your best work.", "category": "Culture Fit", "difficulty": "Easy", "hint": "Focus on collaboration, psychological safety, and continuous learning."},
            {"id": 4, "question": "Where do you see your technical trajectory over the next 2 to 3 years?", "category": "Career Vision", "difficulty": "Medium", "hint": "Show ambitions aligned with technical depth or engineering leadership."},
            {"id": 5, "question": "How do you give and receive constructive feedback during code or peer reviews?", "category": "Communication", "difficulty": "Medium", "hint": "Emphasize empathy and focus on code quality, not ego."}
        ]
    else: # Technical
        return [
            {"id": 1, "question": f"How do you design a high-throughput caching layer for a {target_role} application using Redis?", "category": "Architecture", "difficulty": "Medium", "hint": "Discuss cache invalidation, cache-aside, and eviction policies."},
            {"id": 2, "question": "Explain event loop concurrency in Node.js/JavaScript vs multi-threaded concurrency.", "category": "Runtime Internals", "difficulty": "Medium", "hint": "Cover the call stack, libuv, microtasks, and macrotasks."},
            {"id": 3, "question": "How do database indexes work internally (e.g. B-Trees), and when might an index degrade performance?", "category": "Databases", "difficulty": "Medium", "hint": "Explain write amplification and cardinality."},
            {"id": 4, "question": "How do you detect and mitigate race conditions in concurrent web requests?", "category": "System Design", "difficulty": "Hard", "hint": "Discuss transactional locks, atomic operations, and idempotency keys."},
            {"id": 5, "question": "What strategies do you employ to guarantee 99.9% uptime during zero-downtime deployments?", "category": "DevOps & Reliability", "difficulty": "Hard", "hint": "Mention blue/green or rolling deployments and database schema migrations."}
        ]

def evaluate_interview_answer(question: str, answer: str, target_role: str = "Software Engineer", interview_type: str = "Technical") -> dict:
    """Evaluate candidate interview response with rubric scoring, strengths, gaps, and model response."""
    if not answer or len(answer.strip()) < 10:
        return {
            "score": 30,
            "strengths": ["Attempted response"],
            "weaknesses": ["Answer is too brief to evaluate properly. Provide a structured explanation."],
            "rubric": {"clarity": 3, "technicalAccuracy": 3, "depth": 3},
            "modelAnswer": f"A comprehensive answer to '{question}' should clearly establish context, describe technical implementation choices, mention potential trade-offs, and detail measurable outcomes."
        }

    prompt = f"""
Evaluate this candidate's interview answer.
Target Role: {target_role}
Interview Type: {interview_type}
Question: {question}
Candidate Answer:
\"\"\"
{answer}
\"\"\"

Return ONLY valid JSON matching this structure:
{{
  "score": 85,
  "strengths": ["point 1", "point 2"],
  "weaknesses": ["area for improvement 1"],
  "rubric": {{
    "clarity": 8,
    "technicalAccuracy": 9,
    "depth": 8
  }},
  "modelAnswer": "An exemplary, concise senior-level answer to this question."
}}
"""
    try:
        raw_res = generate_response(prompt=prompt, temperature=0.3, max_tokens=900)
        clean_json = re.sub(r"^```json\s*", "", raw_res.strip())
        clean_json = re.sub(r"\s*```$", "", clean_json)
        result = json.loads(clean_json)
        if "score" in result:
            return result
    except Exception:
        pass

    # Heuristic scoring fallback
    words = len(answer.strip().split())
    base_score = min(92, max(55, 60 + int(words / 4)))
    return {
        "score": base_score,
        "strengths": [
            "Directly targeted the core technical question",
            "Demonstrated logical flow and structured thinking"
        ],
        "weaknesses": [
            "Could incorporate more concrete real-world numbers and edge-case handling",
            "Consider explaining alternate technical trade-offs"
        ],
        "rubric": {
            "clarity": min(10, max(5, int(base_score / 10))),
            "technicalAccuracy": min(10, max(5, int((base_score - 2) / 10))),
            "depth": min(10, max(5, int((base_score - 4) / 10)))
        },
        "modelAnswer": f"To master '{question}': start with the high-level principle, explain your exact architectural or behavioral choice, address alternative approaches considered, and conclude with the tangible impact achieved."
    }
