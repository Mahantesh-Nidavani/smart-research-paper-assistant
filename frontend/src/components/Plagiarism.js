import React, { useState } from 'react';
import axios from 'axios';

function Plagiarism({ paperData }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [paraphraseText, setParaphraseText] = useState('');
  const [paraphraseResult, setParaphraseResult] = useState('');
  const [paraphraseLoading, setParaphraseLoading] = useState(false);
  const [style, setStyle] = useState('academic');
  const [activeTab, setActiveTab] = useState('detect');

  const detect = async () => {
    if (!paperData) return;
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:5000/plagiarism', {
        text: paperData.full_text || paperData.extracted_text,
        paper_id: paperData.paper_id
      });
      setResult(res.data);
      localStorage.setItem('plagiarism_score', res.data.plagiarism_score);
        localStorage.setItem('plagiarism_results', JSON.stringify(res.data.results || []));
    } catch (e) {
      alert('Failed to detect plagiarism');
    }
    setLoading(false);
  };

const [progress, setProgress] = useState({ done: 0, total: 0, status: '' });

const paraphraseFull = async () => {
  if (!paperData) return;
  setParaphraseLoading(true);
  setProgress({ done: 0, total: 0, status: 'running' });

  try {
    // Start background processing
    const res = await axios.post('http://127.0.0.1:5000/paraphrase-full-progress', {
      text: paperData.full_text || paperData.extracted_text,
      style,
      paper_id: paperData.paper_id
    });

    const { session_id, total } = res.data;
    setProgress({ done: 0, total, status: 'running' });
    setParaphraseLoading(false);

    // Poll for progress every 3 seconds
    const interval = setInterval(async () => {
      try {
        const prog = await axios.get(`http://127.0.0.1:5000/paraphrase-progress/${session_id}`);
        setProgress(prog.data);

        if (prog.data.status === 'done') {
          clearInterval(interval);
          localStorage.setItem('full_paraphrased', prog.data.result);
          alert('✅ Full paper paraphrased successfully! You can now download the report.');
        }
      } catch (e) {
        clearInterval(interval);
      }
    }, 3000);

  } catch (e) {
    alert('Failed to start paraphrasing');
    setParaphraseLoading(false);
  }
};

const detectOnline = async () => {
  if (!paperData) return;
  setLoading(true);
  try {
    const res = await axios.post('http://127.0.0.1:5000/plagiarism-online', {
      text: paperData.full_text || paperData.extracted_text,
      paper_id: paperData.paper_id
    });
    setResult(res.data);
    localStorage.setItem('plagiarism_score', res.data.plagiarism_score);
    localStorage.setItem('plagiarism_results', JSON.stringify(res.data.results || []));
  } catch (e) {
    alert('Failed to detect plagiarism online');
  }
  setLoading(false);
};

const paraphrase = async () => {
  if (!paraphraseText.trim()) { alert('Enter text to paraphrase'); return; }
  setParaphraseLoading(true);
  try {
    const res = await axios.post('http://127.0.0.1:5000/paraphrase', {
      text: paraphraseText,
      style
    });
    setParaphraseResult(res.data.paraphrased);
  } catch (e) {
    alert('Failed to paraphrase');
  }
  setParaphraseLoading(false);
};

  const getColor = (score) => {
    if (score >= 75) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
  };

  const getLabel = (score) => {
    if (score >= 75) return 'High Plagiarism';
    if (score >= 40) return 'Moderate Plagiarism';
    return 'Low Plagiarism';
  };

  if (!paperData) return <div className="empty"><p>📤 Upload a paper first</p></div>;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['detect', 'paraphrase'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px', borderRadius: '8px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', border: 'none',
              background: activeTab === tab ? 'linear-gradient(135deg, #38bdf8, #818cf8)' : '#1e293b',
              color: activeTab === tab ? '#0f172a' : '#94a3b8',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'detect' ? '🔍 Plagiarism Detection' : '✏️ Paraphrase Tool'}
          </button>
        ))}
      </div>

      {/* Detection Tab */}
      {activeTab === 'detect' && (
        <div className="card">
          <h3>🔍 Plagiarism Detection</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            Compares your paper against all other uploaded papers in the database.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={detect} disabled={loading}>
            {loading ? 'Detecting...' : '🗄️ Check vs Uploaded Papers'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={detectOnline}
            disabled={loading}
            style={{ border: '1px solid #38bdf8', color: '#38bdf8' }}
          >
            {loading ? 'Detecting...' : '🌐 Check vs Published Papers'}
          </button>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
          🌐 Online check compares against 200M+ published papers. Takes 1-2 minutes.
        </p>
          {loading && <div className="loading"><div className="spinner"></div>Analyzing sentences...</div>}

          {result && (
            <div style={{ marginTop: '20px' }}>
              {/* Score cards */}
              <div className="grid2" style={{ marginBottom: '16px' }}>
                <div className="metric">
                  <div className="metric-label">Plagiarism Score</div>
                  <div className="metric-value" style={{ color: getColor(result.plagiarism_score) }}>
                    {result.plagiarism_score}%
                  </div>
                  <div style={{ fontSize: '12px', color: getColor(result.plagiarism_score), marginTop: '4px', fontWeight: 600 }}>
                    {getLabel(result.plagiarism_score)}
                  </div>
                  <div className="score-bar">
                    <div style={{ height: '100%', borderRadius: '4px', width: `${result.plagiarism_score}%`, background: getColor(result.plagiarism_score), transition: 'width 0.6s ease' }}></div>
                  </div>
                </div>
                <div className="metric">
                  <div className="metric-label">Originality Score</div>
                  <div className="metric-value" style={{ color: '#10b981' }}>
                    {result.originality_score}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>Original Content</div>
                  <div className="score-bar">
                    <div className="score-fill score-high" style={{ width: `${result.originality_score}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Total Sentences', val: result.total_sentences, color: '#38bdf8' },
                  { label: 'Plagiarised', val: result.plagiarised_sentences, color: '#ef4444' },
                  { label: 'Original', val: result.total_sentences - result.plagiarised_sentences, color: '#10b981' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#0f172a', border: `1px solid ${s.color}`, borderRadius: '8px', padding: '10px 16px', textAlign: 'center', minWidth: '100px' }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Message if no references */}
              {result.message && (
                <div style={{ background: '#1e293b', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#f59e0b', marginBottom: '12px' }}>
                  ⚠️ {result.message}
                </div>
              )}

              {/* Sentence results */}
              {result.results && result.results.length > 0 && (
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sentence Analysis</p>
                  {result.results.map((r, i) => (
                    <div key={i} style={{
                      background: '#0f172a', border: `1px solid ${r.is_plagiarised ? '#ef4444' : '#334155'}`,
                      borderRadius: '8px', padding: '12px', marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <p style={{ fontSize: '13px', color: r.is_plagiarised ? '#fca5a5' : '#e2e8f0', flex: 1, marginRight: '12px', lineHeight: 1.6 }}>{r.sentence}</p>
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, flexShrink: 0,
                          background: r.is_plagiarised ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                          color: r.is_plagiarised ? '#ef4444' : '#10b981'
                        }}>
                          {r.similarity}%
                        </span>
                      </div>
                      {r.is_plagiarised && r.matched_text && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '6px', padding: '8px', marginTop: '6px' }}>
                          <p style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700, marginBottom: '4px' }}>MATCHED:</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, fontStyle: 'italic' }}>{r.matched_text}</p>
                        </div>
                      )}

                      {r.is_plagiarised && r.source_paper && (
                      <div style={{ background: 'rgba(56,189,248,0.1)', borderRadius: '6px', padding: '8px', marginTop: '6px' }}>
                        <p style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>SOURCE PAPER:</p>
                        <p style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>{r.source_paper.title}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {r.source_paper.authors} {r.source_paper.year && `(${r.source_paper.year})`}
                        </p>
                        <a href={r.source_paper.url} target="_blank" rel="noreferrer"
                          style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', display: 'inline-block' }}>
                          🔗 View on Semantic Scholar
                        </a>
                      </div>
                    )}

                      {r.is_plagiarised && (
                        <button
                          onClick={() => { setParaphraseText(r.sentence); setActiveTab('paraphrase'); }}
                          style={{ marginTop: '8px', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1px solid #38bdf8', background: 'transparent', color: '#38bdf8' }}
                        >
                          ✏️ Paraphrase this
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Paraphrase Tab */}
      {activeTab === 'paraphrase' && (
  <div className="card">
    <h3>✏️ Paraphrase Tool</h3>
    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
      Rewrite plagiarised sections or the full paper to make it original.
    </p>

    {/* Style selector */}
    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Paraphrase Style</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['academic', 'simple', 'creative'].map(s => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', border: '1px solid',
              borderColor: style === s ? '#38bdf8' : '#334155',
              background: style === s ? 'rgba(56,189,248,0.15)' : 'transparent',
              color: style === s ? '#38bdf8' : '#64748b',
              textTransform: 'capitalize'
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>

    {/* Section paraphrase */}
    <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Section Paraphrase</p>
    <div className="grid2" style={{ marginBottom: '12px' }}>
      <div>
        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>ORIGINAL TEXT</p>
        <textarea
          className="textarea" rows={6}
          placeholder="Paste plagiarised text here..."
          value={paraphraseText}
          onChange={(e) => setParaphraseText(e.target.value)}
        />
      </div>
      <div>
        <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>PARAPHRASED VERSION</p>
        <textarea
          className="textarea" rows={6}
          placeholder="Paraphrased text will appear here..."
          value={paraphraseResult}
          readOnly
          style={{ background: '#0a1628' }}
        />
      </div>
    </div>

    <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
      <button className="btn btn-primary" onClick={paraphrase} disabled={paraphraseLoading}>
        {paraphraseLoading ? 'Paraphrasing...' : '✏️ Paraphrase Section'}
      </button>
      {paraphraseResult && (
        <button className="btn btn-secondary" onClick={() => navigator.clipboard.writeText(paraphraseResult)}>
          📋 Copy
        </button>
      )}
    </div>

    {/* Divider */}
    <div style={{ height: '1px', background: '#334155', margin: '16px 0' }}></div>

    {/* Full paper paraphrase */}
    <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Full Paper Paraphrase</p>
    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
      Paraphrase the entire uploaded paper. Takes 2-5 minutes depending on paper size.
    </p>

    {/* Progress bar */}
    {progress.total > 0 && (
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600 }}>
            {progress.status === 'done' ? '✅ Complete!' : `Processing paragraph ${progress.done} of ${progress.total}...`}
          </span>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {Math.round((progress.done / progress.total) * 100)}%
          </span>
        </div>
        <div style={{ height: '10px', background: '#1e293b', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '5px',
            background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
            width: `${Math.round((progress.done / progress.total) * 100)}%`,
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
    )}

    <button
      className="btn btn-primary"
      onClick={paraphraseFull}
      disabled={paraphraseLoading || (progress.total > 0 && progress.status !== 'done')}
    >
      {paraphraseLoading ? 'Starting...' : progress.status === 'done' ? '✅ Done! Click to redo' : '📄 Paraphrase Full Paper'}
    </button>

    {paraphraseLoading && <div className="loading"><div className="spinner"></div>Starting paraphrase...</div>}
  </div>
)}
    </div>
  );
}

export default Plagiarism;