import requests
import nltk
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import time

nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)

model = None

def get_model():
    global model
    if model is None:
        model = SentenceTransformer('all-MiniLM-L6-v2')
    return model

def split_sentences(text, max_sentences=20):
    sentences = nltk.sent_tokenize(text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 40]
    # Take sentences from different parts of the paper
    if len(sentences) > max_sentences:
        step = len(sentences) // max_sentences
        sentences = sentences[::step][:max_sentences]
    return sentences

def search_semantic_scholar(query, limit=3):
    try:
        url = "https://api.semanticscholar.org/graph/v1/paper/search"
        params = {
            "query": query[:200],
            "limit": limit,
            "fields": "title,authors,year,abstract,url,externalIds"
        }
        headers = {"User-Agent": "ResearchAssistant/1.0"}
        res = requests.get(url, params=params, headers=headers, timeout=10)
        if res.status_code == 200:
            data = res.json()
            return data.get("data", [])
    except:
        pass
    return []

def check_plagiarism_online(source_text):
    m = get_model()
    sentences = split_sentences(source_text, max_sentences=15)

    if not sentences:
        return {
            "plagiarism_score": 0,
            "originality_score": 100,
            "total_sentences": 0,
            "plagiarised_sentences": 0,
            "results": []
        }

    results = []
    plagiarised_count = 0

    for i, sentence in enumerate(sentences):
        # Search Semantic Scholar
        papers = search_semantic_scholar(sentence)
        time.sleep(0.5)  # Rate limit — 2 requests per second

        best_score = 0
        best_paper = None
        best_matched_text = ""

        for paper in papers:
            abstract = paper.get("abstract") or ""
            if not abstract:
                continue

            # Compare sentence with abstract using Sentence-BERT
            emb1 = m.encode([sentence])
            emb2 = m.encode([abstract[:1000]])
            score = float(cosine_similarity(emb1, emb2)[0][0])

            if score > best_score:
                best_score = score
                best_paper = paper
                best_matched_text = abstract[:300]

        is_plagiarised = best_score > 0.70

        if is_plagiarised:
            plagiarised_count += 1

        result = {
            "sentence": sentence,
            "similarity": round(best_score * 100, 2),
            "is_plagiarised": is_plagiarised,
            "matched_text": best_matched_text if is_plagiarised else "",
        }

        if is_plagiarised and best_paper:
            authors = best_paper.get("authors", [])
            author_names = ", ".join([a.get("name", "") for a in authors[:3]])
            result["source_paper"] = {
                "title": best_paper.get("title", "Unknown"),
                "authors": author_names,
                "year": best_paper.get("year", ""),
                "url": f"https://www.semanticscholar.org/paper/{best_paper.get('paperId', '')}",
            }

        results.append(result)

    plagiarism_score = round((plagiarised_count / len(sentences)) * 100, 2)

    return {
        "plagiarism_score": plagiarism_score,
        "originality_score": round(100 - plagiarism_score, 2),
        "total_sentences": len(sentences),
        "plagiarised_sentences": plagiarised_count,
        "results": results
    }