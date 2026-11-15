import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Upload from './components/Upload';
import Summary from './components/Summary';
import Keywords from './components/Keywords';
import ResearchGaps from './components/ResearchGaps';
import LitReview from './components/LitReview';
import Rewriter from './components/Rewriter';
import Similarity from './components/Similarity';
import Visuals from './components/Visuals';
import Report from './components/Report';
import History from './components/History';
import Plagiarism from './components/Plagiarism';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('upload');
  const [paperData, setPaperData] = useState(null);

  const renderPage = () => {
    switch (activePage) {
      case 'upload': return <Upload setPaperData={setPaperData} />;
      case 'history': return <History setPaperData={setPaperData} setActivePage={setActivePage} />;
      case 'summary': return <Summary paperData={paperData} />;
      case 'keywords': return <Keywords paperData={paperData} />;
      case 'gaps': return <ResearchGaps paperData={paperData} />;
      case 'litreview': return <LitReview paperData={paperData} />;
      case 'rewriter': return <Rewriter />;
      case 'similarity': return <Similarity />;
      case 'plagiarism': return <Plagiarism paperData={paperData} />;
      case 'visuals': return <Visuals paperData={paperData} />;
      case 'report': return <Report paperData={paperData} />;
      default: return <Upload setPaperData={setPaperData} />;
    }
  };

  return (
    <div className="app">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="main">
        <div className="topbar">
          <h2>Smart Research Paper Assistant</h2>
          <span>{paperData ? `📄 ${paperData.filename}` : 'No paper loaded'}</span>
        </div>
        <div className="content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;