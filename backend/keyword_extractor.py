from groq import Groq
from dotenv import load_dotenv
import os
import json
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_keywords(text):
    text = text[:4000]
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"Extract top 10 keywords and 3 research domains from this paper. Return only JSON like this: {{\"keywords\": [...], \"domains\": [...]}}\n\nPaper:\n{text}"
            }
        ]
    )
    result = response.choices[0].message.content
    clean = result.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)