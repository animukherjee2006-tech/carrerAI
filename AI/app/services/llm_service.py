
from openai import OpenAI  # type: ignore
from flask import current_app


def generate_response(prompt):

    api_key = current_app.config.get("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured")

    try:
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
            timeout=30.0,
            max_retries=2
        )

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_completion_tokens=1000
        )

        return response.choices[0].message.content

    except Exception:
        current_app.logger.exception("Groq API error")
        raise
