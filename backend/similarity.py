from sklearn.metrics.pairwise import cosine_similarity

model = None

def get_model():
    global model
    if model is None:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
    return model

def get_similarity(text1, text2):
    m = get_model()
    embeddings = m.encode([text1, text2])
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    similarity = round(float(score) * 100, 2)
    originality = round(100 - similarity, 2)
    return {
        "similarity_score": similarity,
        "originality_score": originality
    }