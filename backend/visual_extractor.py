import fitz
from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def extract_and_caption(pdf_path):
    doc = fitz.open(pdf_path)
    results = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        images = page.get_images(full=True)

        for img_index, img in enumerate(images):
            # Try to get context text from same page
            page_text = page.get_text()[:1000]

            try:
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "user",
                            "content": f"""Based on this research paper page text, there is a figure or image on page {page_num+1}.
Analyze the context and generate:
1. A likely figure type (Graph/Table/Chart/Diagram)
2. A short caption (1 sentence)
3. A brief analysis (2 sentences)

Return only JSON:
{{"type": "...", "caption": "...", "analysis": "..."}}

Page text:
{page_text}"""
                        }
                    ]
                )
                result = response.choices[0].message.content
                clean = result.replace("```json", "").replace("```", "").strip()
                import json
                parsed = json.loads(clean)
                parsed["page"] = page_num + 1
                parsed["image"] = f"page{page_num+1}_img{img_index+1}"
                results.append(parsed)
            except:
                results.append({
                    "page": page_num + 1,
                    "image": f"page{page_num+1}_img{img_index+1}",
                    "type": "Figure",
                    "caption": "Figure extracted from paper",
                    "analysis": "Unable to analyze this figure."
                })

    doc.close()
    return results