from groq import Groq
from dotenv import load_dotenv
import os
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def paraphrase_text(text, style="academic"):
    styles = {
        "academic": "Rewrite this text in a formal academic style while preserving the exact meaning. Make it original and plagiarism-free.",
        "simple": "Rewrite this text in simple, clear language while preserving the exact meaning.",
        "creative": "Rewrite this text creatively while preserving the exact meaning and making it original.",
    }
    prompt = styles.get(style, styles["academic"])
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": f"{prompt}\n\nText:\n{text}\n\nProvide only the rewritten text, no explanation."}]
    )
    return response.choices[0].message.content


def paraphrase_full_paper(text, style="academic"):
    # Split into paragraphs
    paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 50]
    paraphrased_parts = []

    for para in paragraphs:
        # Split large paragraphs into chunks of 800 chars
        if len(para) > 800:
            chunks = [para[i:i+800] for i in range(0, len(para), 800)]
        else:
            chunks = [para]

        for chunk in chunks:
            try:
                result = paraphrase_text(chunk, style)
                paraphrased_parts.append(result)
            except:
                paraphrased_parts.append(chunk)  # Keep original if fails

    return '\n\n'.join(paraphrased_parts)