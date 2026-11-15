import React, { useState } from 'react';
import axios from 'axios';

function Rewriter() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const rewrite = async () => {
    if (!input.trim()) { alert('Enter text to rewrite'); return; }
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/rewrite', { text: input });
      setResult(res.data.rewritten);
      localStorage.setItem('rewritten', res.data.rewritten); // ← only save, never load
    } catch (e) {
      alert('Failed to rewrite content');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card">
        <h3>✏️ Content Rewriter</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
          Paste any section from the paper to rewrite it.
        </p>
        <textarea
          className="textarea"
          rows={6}
          placeholder="Paste text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div style={{ marginTop: '12px' }}>
          <button className="btn btn-primary" onClick={rewrite} disabled={loading}>
            {loading ? 'Rewriting...' : 'Rewrite Text'}
          </button>
        </div>
        {loading && <div className="loading"><div className="spinner"></div>Rewriting...</div>}
        {result && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>REWRITTEN VERSION</p>
            <p className="result-text">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Rewriter;