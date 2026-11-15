import React, { useState } from 'react';
import axios from 'axios';

function LitReview({ paperData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!paperData) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/literature-review', {
        text: paperData.extracted_text
      });
      setResult(res.data.literature_review);
      localStorage.setItem('litreview', res.data.literature_review);
    } catch (e) {
      alert('Failed to generate literature review');
    }
    setLoading(false);
  };

  if (!paperData) return <div className="empty"><p>📤 Upload a paper first</p></div>;

  return (
    <div>
      <div className="card">
        <h3>📚 Literature Review Generator</h3>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Literature Review'}
        </button>
        {loading && <div className="loading"><div className="spinner"></div>Generating review...</div>}
        {result && (
          <div style={{ marginTop: '16px' }}>
            <p className="result-text">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LitReview;