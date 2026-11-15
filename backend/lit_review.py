from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_literature_review(text):
    text = text[:5000]
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""Generate a structured literature review section from this research paper. 
Include:
- Introduction paragraph
- Key works and contributions mentioned
- Comparison of approaches
- Transition to the current work

Write a professional literature review of about 300 words.

Paper:
{text}"""
            }
        ]
    )
    return response.choices[0].message.content