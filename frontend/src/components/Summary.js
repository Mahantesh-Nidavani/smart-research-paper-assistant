import React, { useState } from 'react';
import axios from 'axios';

function Summary({ paperData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!paperData) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/summarize', {
        text: paperData.extracted_text
      });
      setResult(res.data.summary);
      localStorage.setItem('summary', res.data.summary);
    } catch (e) {
      alert('Failed to generate summary');
    }
    setLoading(false);
  };

  if (!paperData) return (
    <div className="empty">
      <p>📤 Upload a paper first</p>
    </div>
  );

  return (
    <div>
      <div className="card">
        <h3>📝 Summary Generation</h3>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Summary'}
        </button>
        {loading && <div className="loading"><div className="spinner"></div>Analyzing with AI...</div>}
        {result && (
          <div style={{ marginTop: '16px' }}>
            <p className="result-text">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Summary;