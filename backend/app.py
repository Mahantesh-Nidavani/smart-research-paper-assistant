from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from database import db, Paper, AnalysisResult, VisualInsight, Report
from pdf_extractor import extract_text
from summarizer import get_summary
from keyword_extractor import get_keywords
from gap_detector import get_research_gaps
from lit_review import get_literature_review
from rewriter import rewrite_content
from similarity import get_similarity
from visual_extractor import extract_and_caption
from report_generator import generate_report
from datetime import datetime
from plagiarism_detector import check_plagiarism
from paraphraser import paraphrase_text
from semantic_plagiarism import check_plagiarism_online
import os
import json

progress_store = {}

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///research.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return jsonify({'message': 'Research Assistant API running!'})

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(path)
    text = extract_text(path)

    # Save to database
    paper = Paper(filename=file.filename, filepath=path, total_chars=len(text))
    db.session.add(paper)
    db.session.commit()

    return jsonify({
        'message': 'File uploaded successfully',
        'filename': file.filename,
        'extracted_text': text[:500],
        'full_text': text,
        'total_chars': len(text),
        'paper_id': paper.id
    })

@app.route('/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    text = data.get('text', '')
    paper_id = data.get('paper_id')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    summary = get_summary(text)

    # Save to database
    if paper_id:
        result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if result:
            result.summary = summary
        else:
            result = AnalysisResult(paper_id=paper_id, summary=summary)
            db.session.add(result)
        db.session.commit()

    return jsonify({'summary': summary})

@app.route('/keywords', methods=['POST'])
def keywords():
    data = request.get_json()
    text = data.get('text', '')
    paper_id = data.get('paper_id')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    kws = get_keywords(text)

    # Save to database
    if paper_id:
        result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if result:
            result.keywords = json.dumps(kws)
        else:
            result = AnalysisResult(paper_id=paper_id, keywords=json.dumps(kws))
            db.session.add(result)
        db.session.commit()

    return jsonify({'keywords': kws})

@app.route('/gaps', methods=['POST'])
def gaps():
    data = request.get_json()
    text = data.get('text', '')
    paper_id = data.get('paper_id')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    result_data = get_research_gaps(text)

    # Save to database
    if paper_id:
        result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if result:
            result.research_gaps = json.dumps(result_data)
        else:
            result = AnalysisResult(paper_id=paper_id, research_gaps=json.dumps(result_data))
            db.session.add(result)
        db.session.commit()

    return jsonify(result_data)

@app.route('/literature-review', methods=['POST'])
def literature_review():
    data = request.get_json()
    text = data.get('text', '')
    paper_id = data.get('paper_id')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    review = get_literature_review(text)

    # Save to database
    if paper_id:
        result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if result:
            result.literature_review = review
        else:
            result = AnalysisResult(paper_id=paper_id, literature_review=review)
            db.session.add(result)
        db.session.commit()

    return jsonify({'literature_review': review})

@app.route('/rewrite', methods=['POST'])
def rewrite():
    data = request.get_json()
    text = data.get('text', '')
    paper_id = data.get('paper_id')
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    result = rewrite_content(text)

    # Save to database
    if paper_id:
        db_result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if db_result:
            db_result.rewritten_content = result
        else:
            db_result = AnalysisResult(paper_id=paper_id, rewritten_content=result)
            db.session.add(db_result)
        db.session.commit()

    return jsonify({'rewritten': result})

@app.route('/similarity', methods=['POST'])
def similarity():
    data = request.get_json()
    text1 = data.get('text1', '')
    text2 = data.get('text2', '')
    paper_id = data.get('paper_id')
    if not text1 or not text2:
        return jsonify({'error': 'Both texts required'}), 400
    result = get_similarity(text1, text2)

    # Save to database
    if paper_id:
        db_result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if db_result:
            db_result.similarity_score = result['similarity_score']
        else:
            db_result = AnalysisResult(paper_id=paper_id, similarity_score=result['similarity_score'])
            db.session.add(db_result)
        db.session.commit()

    return jsonify(result)

@app.route('/visuals', methods=['POST'])
def visuals():
    data = request.get_json()
    filename = data.get('filename', '')
    paper_id = data.get('paper_id')
    if not filename:
        return jsonify({'error': 'No filename provided'}), 400
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    results = extract_and_caption(pdf_path)

    # Save to database
    if paper_id:
        for v in results:
            vi = VisualInsight(
                paper_id=paper_id,
                image_name=v.get('image'),
                caption=v.get('caption'),
                figure_type=v.get('type'),
                page_number=v.get('page')
            )
            db.session.add(vi)
        db.session.commit()

    return jsonify({'visuals': results})

@app.route('/report', methods=['POST'])
def report():
    data = request.get_json()
    paper_id = data.get('paper_id')
    output_path = generate_report(data)

    # Save report to database
    if paper_id:
        existing = Report.query.filter_by(paper_id=paper_id).first()
        if existing:
            existing.report_path = output_path
            existing.generated_at = datetime.utcnow()
        else:
            new_report = Report(paper_id=paper_id, report_path=output_path)
            db.session.add(new_report)
        db.session.commit()

    return send_file(output_path, as_attachment=True, download_name='research_report.pdf')

@app.route('/history', methods=['GET'])
def history():
    papers = Paper.query.order_by(Paper.uploaded_at.desc()).all()
    return jsonify([{
        'id': p.id,
        'filename': p.filename,
        'total_chars': p.total_chars,
        'uploaded_at': p.uploaded_at.strftime('%Y-%m-%d %H:%M')
    } for p in papers])

# Delete paper
@app.route('/paper/<int:paper_id>', methods=['DELETE'])
def delete_paper(paper_id):
    paper = Paper.query.get(paper_id)
    if not paper:
        return jsonify({'error': 'Paper not found'}), 404
    # Delete file from disk
    if os.path.exists(paper.filepath):
        os.remove(paper.filepath)
    db.session.delete(paper)
    db.session.commit()
    return jsonify({'message': 'Paper deleted successfully'})

# Get single paper details
@app.route('/paper/<int:paper_id>', methods=['GET'])
def get_paper(paper_id):
    paper = Paper.query.get(paper_id)
    if not paper:
        return jsonify({'error': 'Paper not found'}), 404
    
    # Re-extract text from PDF
    text = ''
    if os.path.exists(paper.filepath):
        text = extract_text(paper.filepath)
    
    result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
    return jsonify({
        'id': paper.id,
        'filename': paper.filename,
        'total_chars': paper.total_chars,
        'uploaded_at': paper.uploaded_at.strftime('%Y-%m-%d %H:%M'),
        'extracted_text': text[:500],
        'full_text': text,
        'paper_id': paper.id,
        'has_summary': bool(result and result.summary),
        'has_keywords': bool(result and result.keywords),
        'has_gaps': bool(result and result.research_gaps),
        'has_review': bool(result and result.literature_review),
    })
# Download saved report
@app.route('/report/download/<int:paper_id>', methods=['GET'])
def download_report(paper_id):
    paper = Paper.query.get(paper_id)
    if not paper:
        return jsonify({'error': 'Paper not found'}), 404

    # Check if report already exists
    report = Report.query.filter_by(paper_id=paper_id).first()
    if report and os.path.exists(report.report_path):
        return send_file(report.report_path, as_attachment=True, download_name='research_report.pdf')

    # Generate report from saved analysis
    result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
    visuals = VisualInsight.query.filter_by(paper_id=paper_id).all()

    data = {
        'filename': paper.filename,
        'paper_id': paper_id,
        'summary': result.summary if result else '',
        'keywords': json.loads(result.keywords).get('keywords', []) if result and result.keywords else [],
        'domains': json.loads(result.keywords).get('domains', []) if result and result.keywords else [],
        'gaps': json.loads(result.research_gaps).get('gaps', []) if result and result.research_gaps else [],
        'literature_review': result.literature_review if result else '',
        'rewritten': result.rewritten_content if result else '',
    }

    output_path = generate_report(data)

    # Save report to database
    if report:
        report.report_path = output_path
        report.generated_at = datetime.utcnow()
    else:
        new_report = Report(paper_id=paper_id, report_path=output_path)
        db.session.add(new_report)
    db.session.commit()

    return send_file(output_path, as_attachment=True, download_name='research_report.pdf')

@app.route('/plagiarism', methods=['POST'])
def plagiarism():
    data = request.get_json()
    source_text = data.get('text', '')
    paper_id = data.get('paper_id')

    if not source_text:
        return jsonify({'error': 'No text provided'}), 400

    all_papers = Paper.query.all()
    reference_texts = []

    for paper in all_papers:
        if paper_id and paper.id == int(paper_id):
            continue
        if os.path.exists(paper.filepath):
            ref_text = extract_text(paper.filepath)
            if ref_text:
                reference_texts.append(ref_text)

    if not reference_texts:
        return jsonify({
            'plagiarism_score': 0,
            'originality_score': 100,
            'total_sentences': 0,
            'plagiarised_sentences': 0,
            'results': [],
            'message': 'No reference papers found. Upload more papers to compare against.'
        })

    result = check_plagiarism(source_text, reference_texts)

    # Save to database
    if paper_id:
        db_result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if db_result:
            db_result.plagiarism_score = result['plagiarism_score']
            db_result.plagiarism_report = json.dumps(result['results'])
        else:
            db_result = AnalysisResult(
                paper_id=paper_id,
                plagiarism_score=result['plagiarism_score'],
                plagiarism_report=json.dumps(result['results'])
            )
            db.session.add(db_result)
        db.session.commit()

    return jsonify(result)

@app.route('/paraphrase', methods=['POST'])
def paraphrase():
    data = request.get_json()
    text = data.get('text', '')
    style = data.get('style', 'academic')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    result = paraphrase_text(text, style)
    return jsonify({'paraphrased': result})

@app.route('/paraphrase-full', methods=['POST'])
def paraphrase_full():
    data = request.get_json()
    text = data.get('text', '')
    style = data.get('style', 'academic')
    paper_id = data.get('paper_id')

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Split into paragraphs
    paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 50]
    total = len(paragraphs)
    paraphrased_parts = []

    for i, para in enumerate(paragraphs):
        if len(para) > 800:
            chunks = [para[j:j+800] for j in range(0, len(para), 800)]
        else:
            chunks = [para]

        para_result = []
        for chunk in chunks:
            try:
                result = paraphrase_text(chunk, style)
                para_result.append(result)
            except:
                para_result.append(chunk)

        paraphrased_parts.append(' '.join(para_result))

    full_result = '\n\n'.join(paraphrased_parts)

    # Save to database
    if paper_id:
        db_result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if db_result:
            db_result.rewritten_content = full_result
        else:
            db_result = AnalysisResult(paper_id=paper_id, rewritten_content=full_result)
            db.session.add(db_result)
        db.session.commit()

    return jsonify({
        'paraphrased': full_result,
        'total_paragraphs': total
    })

@app.route('/paraphrase-progress/<session_id>', methods=['GET'])
def paraphrase_progress(session_id):
    progress = progress_store.get(session_id, {'done': 0, 'total': 0})
    return jsonify(progress)

@app.route('/plagiarism-online', methods=['POST'])
def plagiarism_online():
    data = request.get_json()
    source_text = data.get('text', '')
    paper_id = data.get('paper_id')

    if not source_text:
        return jsonify({'error': 'No text provided'}), 400

    result = check_plagiarism_online(source_text)

    # Save to database
    if paper_id:
        db_result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
        if db_result:
            db_result.plagiarism_score = result['plagiarism_score']
            db_result.plagiarism_report = json.dumps(result['results'])
        else:
            db_result = AnalysisResult(
                paper_id=paper_id,
                plagiarism_score=result['plagiarism_score'],
                plagiarism_report=json.dumps(result['results'])
            )
            db.session.add(db_result)
        db.session.commit()

    return jsonify(result)

@app.route('/paraphrase-full-progress', methods=['POST'])
def paraphrase_full_progress():
    import threading
    import uuid

    data = request.get_json()
    text = data.get('text', '')
    style = data.get('style', 'academic')
    paper_id = data.get('paper_id')
    session_id = str(uuid.uuid4())

    paragraphs = [p.strip() for p in text.split('\n\n') if len(p.strip()) > 50]
    total = len(paragraphs)
    progress_store[session_id] = {'done': 0, 'total': total, 'status': 'running', 'result': ''}

    def process():
        paraphrased_parts = []
        for i, para in enumerate(paragraphs):
            if len(para) > 800:
                chunks = [para[j:j+800] for j in range(0, len(para), 800)]
            else:
                chunks = [para]

            para_result = []
            for chunk in chunks:
                try:
                    result = paraphrase_text(chunk, style)
                    para_result.append(result)
                except:
                    para_result.append(chunk)

            paraphrased_parts.append(' '.join(para_result))
            progress_store[session_id]['done'] = i + 1

        full_result = '\n\n'.join(paraphrased_parts)
        progress_store[session_id]['status'] = 'done'
        progress_store[session_id]['result'] = full_result

        if paper_id:
            with app.app_context():
                db_result = AnalysisResult.query.filter_by(paper_id=paper_id).first()
                if db_result:
                    db_result.rewritten_content = full_result
                else:
                    db_result = AnalysisResult(paper_id=paper_id, rewritten_content=full_result)
                    db.session.add(db_result)
                db.session.commit()

    thread = threading.Thread(target=process)
    thread.daemon = True
    thread.start()

    return jsonify({'session_id': session_id, 'total': total})


if __name__ == '__main__':
    app.run(debug=True)