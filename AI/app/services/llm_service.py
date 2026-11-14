
from openai import (
    OpenAI,
    APIError,
    APITimeoutError,
    RateLimitError,
    AuthenticationError,
)
from flask import current_app


def get_groq_client():
    """Initialize Groq client using Flask configuration."""

    api_key = current_app.config.get("GROQ_API_KEY")

    if not api_key:
        current_app.logger.warning("GROQ_API_KEY is missing.")
        return None

    return OpenAI(
        api_key=api_key,
        base_url="https://api.groq.com/openai/v1",
        timeout=25.0,
        max_retries=1,
    )


def generate_response(
    prompt: str,
    system_prompt: str = (
        "You are CareerAI, an expert career advisor, "
        "senior technical interviewer, and talent strategist. "
        "Provide clear, actionable, structured guidance."
    ),
    temperature: float = 0.7,
    max_tokens: int = 1500,
    history: list = None
) -> str:

    if not isinstance(prompt, str) or not prompt.strip():
        raise ValueError("Prompt must be a non-empty string.")

    client = get_groq_client()

    if client is None:
        return fallback_career_reply(prompt)

    messages = [
        {"role": "system", "content": system_prompt.strip()}
    ]

    if history and isinstance(history, list):
        for msg in history[-8:]:
            if not isinstance(msg, dict):
                continue

            role = "user" if msg.get("role") == "user" else "assistant"
            content = msg.get("content", "")

            if isinstance(content, str) and content.strip():
                messages.append({
                    "role": role,
                    "content": content.strip()
                })

    messages.append({
        "role": "user",
        "content": prompt.strip()
    })

    # Updated Groq production model IDs
    models_to_try = [
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b"
    ]

    for model in models_to_try:
        try:
            current_app.logger.info(
                f"Trying Groq model: {model}"
            )

            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_completion_tokens=max_tokens,
            )

            if response.choices:
                content = response.choices[0].message.content

                if content and content.strip():
                    current_app.logger.info(
                        f"Groq response successful: {model}"
                    )
                    return content.strip()

            current_app.logger.warning(
                f"Empty response from {model}"
            )

        except AuthenticationError as exc:
            current_app.logger.error(
                f"Groq authentication failed: {exc}"
            )
            break

        except RateLimitError as exc:
            current_app.logger.warning(
                f"Groq rate limit for {model}: {exc}"
            )

        except APITimeoutError as exc:
            current_app.logger.warning(
                f"Groq timeout for {model}: {exc}"
            )

        except APIError as exc:
            current_app.logger.warning(
                f"Groq API error for {model}: {exc}"
            )

        except Exception as exc:
            current_app.logger.exception(
                f"Unexpected LLM error for {model}: {exc}"
            )

    current_app.logger.warning(
        "All Groq models failed. Using offline fallback."
    )

    return fallback_career_reply(prompt)


def fallback_career_reply(prompt: str) -> str:

    p = prompt.lower()

    if "resume" in p or "cv" in p:
        return (
            "Here are strategic recommendations for improving "
            "your resume:\n\n"
            "1. Use measurable achievements.\n"
            "2. Optimize ATS keywords for your target role.\n"
            "3. Use clear resume sections and formatting."
        )

    elif "interview" in p:
        return (
            "Interview preparation recommendations:\n\n"
            "1. Practice the STAR method.\n"
            "2. Strengthen DSA and system design.\n"
            "3. Explain time and space complexity."
        )

    return (
        f"CareerAI Insights for: {prompt}\n\n"
        "1. Align your skills with industry requirements.\n"
        "2. Build practical portfolio projects.\n"
        "3. Track your learning and interview progress."
    )
