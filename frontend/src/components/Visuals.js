import React, { useState } from 'react';
import axios from 'axios';

function Visuals({ paperData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!paperData) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/visuals', {
        filename: paperData.filename
      });
      setResult(res.data.visuals);
    } catch (e) {
      alert('Failed to extract visuals');
    }
    setLoading(false);
  };

  if (!paperData) return <div className="empty"><p>📤 Upload a paper first</p></div>;

  return (
    <div>
      <div className="card">
        <h3>🖼️ Visual Insight Extraction</h3>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Extracting...' : 'Extract Visual Insights'}
        </button>
        {loading && <div className="loading"><div className="spinner"></div>Analyzing figures...</div>}
        {result && (
          <div style={{ marginTop: '16px' }}>
            {result.length === 0 && <p style={{ fontSize: '13px', color: '#666' }}>No figures found in this paper.</p>}
            {result.map((v, i) => (
              <div key={i} className="gap-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="badge badge-blue">{v.type}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>Page {v.page}</span>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>{v.caption}</p>
                <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.6 }}>{v.analysis}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Visuals;