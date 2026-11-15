import React, { useState, useEffect } from 'react';
import axios from 'axios';

function History({ setPaperData, setActivePage }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:5000/history');
      setPapers(res.data);
    } catch (e) {
      alert('Failed to load history');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPapers(); }, []);

  const deletePaper = async (id) => {
    if (!window.confirm('Delete this paper and all its analysis?')) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/paper/${id}`);
      fetchPapers();
    } catch (e) {
      alert('Failed to delete paper');
    }
  };

const loadPaper = async (paper) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/paper/${paper.id}`);
      setPaperData({
        filename: res.data.filename,
        paper_id: res.data.id,
        total_chars: res.data.total_chars,
        extracted_text: res.data.full_text,  // ← full text now
      });
      localStorage.setItem('paper_id', res.data.id);
      setActivePage('summary');
    } catch (e) {
      alert('Failed to load paper');
    }
  };

  const downloadReport = (id) => {
    window.open(`http://127.0.0.1:5000/report/download/${id}`, '_blank');
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3>📋 Uploaded Papers</h3>
          <button className="btn btn-secondary" onClick={fetchPapers}>🔄 Refresh</button>
        </div>

        {loading && <div className="loading"><div className="spinner"></div>Loading...</div>}

        {!loading && papers.length === 0 && (
          <div className="empty"><p>No papers uploaded yet.</p></div>
        )}

        {papers.map(paper => (
          <div key={paper.id} style={{
            border: '1px solid #e0e0e0', borderRadius: '8px',
            padding: '14px', marginBottom: '10px', background: '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: '#000000'  }}>📄 {paper.filename}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  {paper.total_chars?.toLocaleString()} chars • Uploaded: {paper.uploaded_at}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => loadPaper(paper)}>
                📂 Load Paper
              </button>
              <button className="btn btn-secondary" onClick={() => downloadReport(paper.id)}>
                ⬇️ Download Report
              </button>
              <button
                onClick={() => deletePaper(paper.id)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                  fontWeight: 500, cursor: 'pointer', border: '1px solid #ffcccc',
                  background: '#fff5f5', color: '#e24b4a'
                }}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;