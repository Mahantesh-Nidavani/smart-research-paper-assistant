from groq import Groq
from dotenv import load_dotenv
import os
import json
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_research_gaps(text):
    text = text[:4000]
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""Analyze this research paper and identify research gaps.
Return only JSON, no explanation:
{{
  "gaps": [
    {{"limitation": "existing limitation in the paper", "gap": "suggested research gap to address it"}},
    {{"limitation": "another limitation", "gap": "another gap"}}
  ],
  "future_work": "brief future work suggestion"
}}

Paper:
{text}"""
            }
        ]
    )
    result = response.choices[0].message.content
    clean = result.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)