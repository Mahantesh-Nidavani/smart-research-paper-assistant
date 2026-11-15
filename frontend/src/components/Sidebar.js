import React from 'react';

const pages = [
  { id: 'upload', label: 'Upload Paper', icon: '📤' },
  { id: 'history', label: 'Uploaded Papers', icon: '📋' },
  { id: 'summary', label: 'Summary', icon: '📝' },
  { id: 'keywords', label: 'Keywords', icon: '🏷️' },
  { id: 'gaps', label: 'Research Gaps', icon: '🔍' },
  { id: 'litreview', label: 'Literature Review', icon: '📚' },
  { id: 'rewriter', label: 'Content Rewriter', icon: '✏️' },
  { id: 'similarity', label: 'Similarity', icon: '📊' },
  { id: 'visuals', label: 'Visual Insights', icon: '🖼️' },
  { id: 'report', label: 'Download Report', icon: '⬇️' },
  { id: 'plagiarism', label: 'Plagiarism Check', icon: '🔎' },
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <div style={{
      width: '240px', flexShrink: 0,
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRight: '1px solid #334155',
      display: 'flex', flexDirection: 'column',
      boxShadow: '4px 0 24px rgba(0,0,0,0.3)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid #334155',
        background: 'linear-gradient(135deg, #1e293b, #162032)'
      }}>
        <div style={{
          fontSize: '22px', fontWeight: 800,
          background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>SRPA</div>
        <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', letterSpacing: '0.05em' }}>
          Smart Research Assistant
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '10px', color: '#475569', fontWeight: 700, letterSpacing: '0.1em', padding: '0 8px', marginBottom: '8px' }}>
          NAVIGATION
        </div>
        {pages.map(page => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              width: '100%', padding: '10px 12px',
              border: activePage === page.id ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
              borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
              marginBottom: '4px', textAlign: 'left',
              background: activePage === page.id
                ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(129,140,248,0.1))'
                : 'transparent',
              color: activePage === page.id ? '#38bdf8' : '#94a3b8',
              fontWeight: activePage === page.id ? 600 : 400,
              transition: 'all 0.2s',
              boxShadow: activePage === page.id ? '0 2px 8px rgba(56,189,248,0.1)' : 'none'
            }}
            onMouseEnter={e => {
              if (activePage !== page.id) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#e2e8f0';
              }
            }}
            onMouseLeave={e => {
              if (activePage !== page.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{page.icon}</span>
            <span>{page.label}</span>
            {activePage === page.id && (
              <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }}></span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #334155',
        fontSize: '11px', color: '#475569', textAlign: 'center'
      }}>
        Built with Flask + React + Groq
      </div>
    </div>
  );
}

export default Sidebar;