import React, { useState } from 'react';
import axios from 'axios';

function Report({ paperData }) {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    if (!paperData) return;
    setLoading(true);
    try {

      // Only include data that actually exists
      const summary = localStorage.getItem('summary') || '';
      const keywordsRaw = localStorage.getItem('keywords');
      const domainsRaw = localStorage.getItem('domains');
      const gapsRaw = localStorage.getItem('gaps');
      const litreview = localStorage.getItem('litreview') || '';
      const rewritten = localStorage.getItem('rewritten') || '';
      const plagiarism_score = localStorage.getItem('plagiarism_score');
      const plagiarism_results = localStorage.getItem('plagiarism_results');
      const full_paraphrased = localStorage.getItem('full_paraphrased') || '';

      const res = await axios.post('http://127.0.0.1:5000/report', {
        filename: paperData.filename,
        paper_id: paperData.paper_id || localStorage.getItem('paper_id'),

        // Only send if user actually ran that analysis
        summary: summary || null,
        keywords: keywordsRaw ? JSON.parse(keywordsRaw) : null,
        domains: domainsRaw ? JSON.parse(domainsRaw) : null,
        gaps: gapsRaw ? JSON.parse(gapsRaw) : null,
        literature_review: litreview || null,
        rewritten: rewritten || null,
        plagiarism_score: plagiarism_score ? parseFloat(plagiarism_score) : null,
        plagiarism_results: plagiarism_results ? JSON.parse(plagiarism_results) : null,
        full_paraphrased: full_paraphrased || null,

      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${paperData.filename}_report.pdf`;
      a.click();

    } catch (e) {
      alert('Failed to generate report');
    }
    setLoading(false);
  };

  if (!paperData) return <div className="empty"><p>📤 Upload a paper first</p></div>;

  return (
    <div>
      <div className="card">
        <h3>⬇️ Download PDF Report</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
          Run all analyses first, then download the complete PDF report.
        </p>
        <div className="metric" style={{ marginBottom: '16px' }}>
          <div className="metric-label">Paper loaded</div>
          <div style={{ fontSize: '13px', fontWeight: 500, marginTop: '4px' }}>{paperData.filename}</div>
        </div>
        <button className="btn btn-primary" onClick={download} disabled={loading}>
          {loading ? 'Generating...' : '⬇️ Download PDF Report'}
        </button>
      </div>
    </div>
  );
}

export default Report;