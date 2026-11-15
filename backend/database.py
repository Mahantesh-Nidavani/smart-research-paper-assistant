from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Paper(db.Model):
    __tablename__ = 'papers'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    total_chars = db.Column(db.Integer)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    results = db.relationship('AnalysisResult', backref='paper', lazy=True, cascade='all, delete-orphan')
    visuals = db.relationship('VisualInsight', backref='paper', lazy=True, cascade='all, delete-orphan')
    reports = db.relationship('Report', backref='paper', lazy=True, cascade='all, delete-orphan')

class AnalysisResult(db.Model):
    __tablename__ = 'analysis_results'
    id = db.Column(db.Integer, primary_key=True)
    paper_id = db.Column(db.Integer, db.ForeignKey('papers.id'), nullable=False)
    summary = db.Column(db.Text)
    keywords = db.Column(db.Text)
    research_gaps = db.Column(db.Text)
    literature_review = db.Column(db.Text)
    rewritten_content = db.Column(db.Text)
    similarity_score = db.Column(db.Float)
    plagiarism_score = db.Column(db.Float)        # ← new
    plagiarism_report = db.Column(db.Text)         # ← new
    full_paraphrased = db.Column(db.Text)          # ← new
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    
class VisualInsight(db.Model):
    __tablename__ = 'visual_insights'
    id = db.Column(db.Integer, primary_key=True)
    paper_id = db.Column(db.Integer, db.ForeignKey('papers.id'), nullable=False)
    image_name = db.Column(db.String(255))
    caption = db.Column(db.Text)
    figure_type = db.Column(db.String(100))
    page_number = db.Column(db.Integer)

class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.Integer, primary_key=True)
    paper_id = db.Column(db.Integer, db.ForeignKey('papers.id'), nullable=False)
    report_path = db.Column(db.String(255))
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)