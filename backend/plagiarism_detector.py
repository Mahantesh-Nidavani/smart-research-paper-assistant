from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
import numpy as np

nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)

model = None

def get_model():
    global model
    if model is None:
        model = SentenceTransformer('all-MiniLM-L6-v2')
    return model

def split_sentences(text):
    sentences = nltk.sent_tokenize(text)
    return [s.strip() for s in sentences if len(s.strip()) > 30]

def check_plagiarism(source_text, reference_texts):
    m = get_model()
    source_sentences = split_sentences(source_text)
    if not source_sentences:
        return {"plagiarism_score": 0, "results": []}

    source_embeddings = m.encode(source_sentences)
    all_results = []
    plagiarised_count = 0

    for sent, sent_emb in zip(source_sentences, source_embeddings):
        best_score = 0
        best_match = ""

        for ref_text in reference_texts:
            ref_sentences = split_sentences(ref_text)
            if not ref_sentences:
                continue
            ref_embeddings = m.encode(ref_sentences)
            scores = cosine_similarity([sent_emb], ref_embeddings)[0]
            max_idx = np.argmax(scores)
            if scores[max_idx] > best_score:
                best_score = float(scores[max_idx])
                best_match = ref_sentences[max_idx]

        is_plagiarised = best_score > 0.75
        if is_plagiarised:
            plagiarised_count += 1

        all_results.append({
            "sentence": sent,
            "similarity": round(best_score * 100, 2),
            "is_plagiarised": is_plagiarised,
            "matched_text": best_match if is_plagiarised else ""
        })

    plagiarism_score = round((plagiarised_count / len(source_sentences)) * 100, 2)

    return {
        "plagiarism_score": plagiarism_score,
        "originality_score": round(100 - plagiarism_score, 2),
        "total_sentences": len(source_sentences),
        "plagiarised_sentences": plagiarised_count,
        "results": all_results
    }