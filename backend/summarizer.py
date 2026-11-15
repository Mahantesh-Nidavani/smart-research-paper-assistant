from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_summary(text):
    text = text[:4000]
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"Summarize this research paper in 2 parts:\n1. Abstract Summary (2-3 sentences)\n2. Detailed Summary (5-6 sentences)\n\nPaper:\n{text}"
            }
        ]
    )
    return response.choices[0].message.content