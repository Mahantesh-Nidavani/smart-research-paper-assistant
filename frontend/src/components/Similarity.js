import React, { useState } from 'react';
import axios from 'axios';

function Similarity() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (!text1.trim() || !text2.trim()) { alert('Enter both texts'); return; }
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/similarity', {
        text1, text2
      });
      setResult(res.data);
    } catch (e) {
      alert('Failed to analyze similarity');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card">
        <h3>📊 Similarity Analysis</h3>
        <div className="grid2">
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '6px' }}>ORIGINAL TEXT</p>
            <textarea className="textarea" rows={5} placeholder="Paste original text..." value={text1} onChange={(e) => setText1(e.target.value)} />
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '6px' }}>REWRITTEN TEXT</p>
            <textarea className="textarea" rows={5} placeholder="Paste rewritten text..." value={text2} onChange={(e) => setText2(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button className="btn btn-primary" onClick={analyze} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Similarity'}
          </button>
        </div>
        {loading && <div className="loading"><div className="spinner"></div>Comparing texts...</div>}
        {result && (
          <div style={{ marginTop: '16px' }} className="grid2">
            <div className="metric">
              <div className="metric-label">Similarity Score</div>
              <div className="metric-value">{result.similarity_score}%</div>
              <div className="score-bar">
                <div className="score-fill score-low" style={{ width: `${result.similarity_score}%` }}></div>
              </div>
            </div>
            <div className="metric">
              <div className="metric-label">Originality Score</div>
              <div className="metric-value">{result.originality_score}%</div>
              <div className="score-bar">
                <div className="score-fill score-high" style={{ width: `${result.originality_score}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Similarity;