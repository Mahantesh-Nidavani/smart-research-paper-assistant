import React, { useState } from 'react';
import axios from 'axios';

function Upload({ setPaperData }) {
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(null);

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://127.0.0.1:5000/upload', formData);
      setPaperData(res.data);
      localStorage.clear();
      localStorage.setItem('paper_id', res.data.paper_id);
      setUploaded(res.data);
      localStorage.setItem('paper_id', res.data.paper_id);
    } catch (e) {
      alert('Upload failed. Make sure Flask server is running.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div
        className="upload-zone"
        onClick={() => document.getElementById('fileInput').click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📄</div>
        <h3>Upload Research Paper</h3>
        <p>Click to browse or drag & drop a PDF file</p>
        <input
          id="fileInput" type="file" accept=".pdf" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div> Uploading and extracting text...
        </div>
      )}

      {uploaded && (
        <div className="card">
          <h3>✅ Paper Loaded</h3>
          <p style={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong>File:</strong> {uploaded.filename}
          </p>
          <p style={{ fontSize: '13px', marginBottom: '16px' }}>
            <strong>Characters extracted:</strong> {uploaded.total_chars}
          </p>
          <p style={{ fontSize: '13px', color: '#666' }}>
            Now use the sidebar to analyze the paper.
          </p>
        </div>
      )}
    </div>
  );
}

export default Upload;