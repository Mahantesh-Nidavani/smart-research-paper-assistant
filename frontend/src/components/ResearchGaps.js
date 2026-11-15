import React, { useState } from 'react';
import axios from 'axios';

function ResearchGaps({ paperData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!paperData) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/gaps', {
        text: paperData.extracted_text
      });
      setResult(res.data);
      localStorage.setItem('gaps', JSON.stringify(res.data.gaps || []));
    } catch (e) {
      alert('Failed to detect gaps');
    }
    setLoading(false);
  };

  if (!paperData) return <div className="empty"><p>📤 Upload a paper first</p></div>;

  return (
    <div>
      <div className="card">
        <h3>🔍 Research Gap Detection</h3>
        <button className="btn btn-primary" onClick={generate} disabled={loading}>
          {loading ? 'Detecting...' : 'Detect Research Gaps'}
        </button>
        {loading && <div className="loading"><div className="spinner"></div>Analyzing gaps...</div>}
        {result && (
          <div style={{ marginTop: '16px' }}>
            {result.gaps && result.gaps.map((g, i) => (
              <div key={i} className="gap-card">
                <div className="gap-label">Existing Limitation</div>
                <p style={{ fontSize: '13px', marginBottom: '10px' }}>{g.limitation}</p>
                <div className="gap-label" style={{ color: '#0c447c' }}>Suggested Research Gap</div>
                <p style={{ fontSize: '13px', color: '#0c447c' }}>{g.gap}</p>
              </div>
            ))}
            {result.future_work && (
              <div style={{ marginTop: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '6px' }}>FUTURE WORK</p>
                <p style={{ fontSize: '13px' }}>{result.future_work}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResearchGaps;