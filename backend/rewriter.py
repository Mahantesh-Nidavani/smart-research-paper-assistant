from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def rewrite_content(text):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""Rewrite the following text to improve clarity and originality while preserving the exact meaning. Use academic writing style. Do not add or remove information.

Original text:
{text}

Provide only the rewritten text, no explanation."""
            }
        ]
    )
    return response.choices[0].message.content