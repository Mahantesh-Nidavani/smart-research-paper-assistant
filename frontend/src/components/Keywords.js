import React, { useState } from 'react';
import axios from 'axios';

function Keywords({ paperData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!paperData) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/keywords', {
        text: paperData.extracted_text
      });
      setResult(res.data.keywords);
      localStorage.setItem('keywords', JSON.stringify(res.data.keywords.keywords || []));
      localStorage.setItem('domains', JSON.stringify(res.data.keywords.domains || []));
    } catch (e) {
      alert('Failed to extract keywords');
    }
    setLoading(false);
  };

  if (!paperData) return <div className="empty"><p>📤 Upload a paper first</p></div>;

  return (
    <div>
      <div className="card">
        <h3>🏷️ Keyword Extraction</h3>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Extracting...' : 'Extract Keywords'}
        </button>
        {loading && <div className="loading"><div className="spinner"></div>Extracting keywords...</div>}
        {result && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>KEYWORDS</p>
            <div style={{ marginBottom: '16px' }}>
              {result.keywords && result.keywords.map((kw, i) => (
                <span key={i} className="badge badge-blue">{kw}</span>
              ))}
            </div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>RESEARCH DOMAINS</p>
            <div>
              {result.domains && result.domains.map((d, i) => (
                <span key={i} className="badge badge-green">{d}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Keywords;