from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.colors import HexColor
import os

def generate_report(data, output_path="static/report.pdf"):
    os.makedirs("static", exist_ok=True)
    doc = SimpleDocTemplate(output_path, pagesize=A4,
                            rightMargin=2*cm, leftMargin=2*cm,
                            topMargin=2*cm, bottomMargin=2*cm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', fontSize=18, fontName='Helvetica-Bold',
                                  textColor=HexColor('#1a1a1a'), spaceAfter=12)
    heading_style = ParagraphStyle('Heading', fontSize=13, fontName='Helvetica-Bold',
                                    textColor=HexColor('#2E75B6'), spaceAfter=8, spaceBefore=16)
    body_style = ParagraphStyle('Body', fontSize=11, fontName='Helvetica',
                                 leading=16, spaceAfter=8)
    red_style = ParagraphStyle('Red', fontSize=11, fontName='Helvetica',
                                leading=16, spaceAfter=8, textColor=HexColor('#e24b4a'))
    green_style = ParagraphStyle('Green', fontSize=11, fontName='Helvetica',
                                  leading=16, spaceAfter=8, textColor=HexColor('#1d9e75'))

    story = []

    # Title
    story.append(Paragraph("Smart Research Paper Assistant", title_style))
    story.append(Paragraph("Analysis Report", title_style))
    story.append(Spacer(1, 0.3*cm))

    if data.get('filename'):
        story.append(Paragraph(f"Paper: {data['filename']}", body_style))
    story.append(HRFlowable(width="100%", thickness=1, color=HexColor('#e0e0e0')))
    story.append(Spacer(1, 0.3*cm))

        # Summary
    if data.get('summary') and data['summary'].strip():
        story.append(Paragraph("Summary", heading_style))
        story.append(Paragraph(data['summary'].replace('\n', '<br/>'), body_style))

    # Keywords
    if data.get('keywords') and len(data['keywords']) > 0:
        story.append(Paragraph("Keywords", heading_style))
        story.append(Paragraph(', '.join(data['keywords']), body_style))

    # Domains
    if data.get('domains') and len(data['domains']) > 0:
        story.append(Paragraph("Research Domains", heading_style))
        story.append(Paragraph(', '.join(data['domains']), body_style))

    # Research Gaps
    if data.get('gaps') and len(data['gaps']) > 0:
        story.append(Paragraph("Research Gaps", heading_style))
        for g in data['gaps']:
            story.append(Paragraph(f"<b>Limitation:</b> {g.get('limitation', '')}", body_style))
            story.append(Paragraph(f"<b>Gap:</b> {g.get('gap', '')}", body_style))
            story.append(Spacer(1, 0.2*cm))

    # Literature Review
    if data.get('literature_review') and data['literature_review'].strip():
        story.append(Paragraph("Literature Review", heading_style))
        story.append(Paragraph(data['literature_review'].replace('\n', '<br/>'), body_style))

    # Rewritten Content
    if data.get('rewritten') and data['rewritten'].strip():
        story.append(Paragraph("Rewritten Content", heading_style))
        story.append(Paragraph(data['rewritten'].replace('\n', '<br/>'), body_style))

    # Plagiarism Report
    if data.get('plagiarism_score') is not None:
        story.append(Paragraph("Plagiarism Detection Report", heading_style))
        score = data['plagiarism_score']
        originality = round(100 - score, 2)
        story.append(Paragraph(f"<b>Plagiarism Score:</b> {score}%", red_style if score > 40 else body_style))
        story.append(Paragraph(f"<b>Originality Score:</b> {originality}%", green_style))
        if data.get('plagiarism_results') and len(data['plagiarism_results']) > 0:
            story.append(Spacer(1, 0.2*cm))
            story.append(Paragraph("<b>Plagiarised Sentences:</b>", body_style))
            for r in data['plagiarism_results']:
                if r.get('is_plagiarised'):
                    story.append(Paragraph(
                        f"• {r['sentence']} <font color='red'>[{r['similarity']}% match]</font>",
                        body_style
                    ))

    # Full Paraphrased Paper
    if data.get('full_paraphrased') and data['full_paraphrased'].strip():
        story.append(Paragraph("Full Paraphrased Paper", heading_style))
        story.append(Paragraph(data['full_paraphrased'].replace('\n', '<br/>'), body_style))
        
    doc.build(story)
    return output_path