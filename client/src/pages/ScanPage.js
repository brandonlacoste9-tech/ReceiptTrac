import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import '../styles/ScanPage.css';

function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setScanning(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await api.scanReceipt(file);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan receipt');
    } finally {
      setScanning(false);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });
  
  return (
    <div className="scan-page">
      <div className="scan-container">
        <h1>Scan Receipt 📱</h1>
        <p className="subtitle">Upload a photo of your receipt to extract and analyze the data</p>
        
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${scanning ? 'scanning' : ''}`}>
          <input {...getInputProps()} />
          {scanning ? (
            <div className="scanning-indicator">
              <div className="spinner"></div>
              <p>Scanning receipt... This may take a few seconds</p>
            </div>
          ) : (
            <>
              <div className="dropzone-icon">📸</div>
              <p className="dropzone-text">
                {isDragActive ? 'Drop your receipt here...' : 'Drag & drop a receipt image, or click to browse'}
              </p>
              <p className="dropzone-hint">Supports JPG, PNG, GIF</p>
            </>
          )}
        </div>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        
        {result && (
          <div className="result-container">
            <div className="result-header">
              <h2>✅ Receipt Scanned Successfully!</h2>
            </div>
            
            <div className="result-card">
              <div className="result-section">
                <h3>Receipt Details</h3>
                <div className="detail-row">
                  <span className="label">Store:</span>
                  <span className="value">{result.storeName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">{result.date}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Items:</span>
                  <span className="value">{result.itemCount}</span>
                </div>
              </div>
              
              <div className="result-section">
                <h3>Items Purchased</h3>
                <div className="items-list">
                  {result.items && result.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span className="item-name">{item.name}</span>
                      <span className="item-category">{item.category}</span>
                      <span className="item-price">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="result-section totals">
                <div className="total-row">
                  <span className="label">Subtotal:</span>
                  <span className="value">${result.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="total-row">
                  <span className="label">Tax:</span>
                  <span className="value">${result.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="total-row grand">
                  <span className="label">Total:</span>
                  <span className="value">${result.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
              
              <div className="result-actions">
                <button className="btn-primary" onClick={() => window.location.href = '/insights'}>
                  View Insights →
                </button>
                <button className="btn-secondary" onClick={() => setResult(null)}>
                  Scan Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanPage;
