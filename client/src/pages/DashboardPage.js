import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/DashboardPage.css';

function DashboardPage() {
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const receiptsData = await api.getReceipts();
      setReceipts(receiptsData.data || []);
      
      // Calculate stats
      const total = receiptsData.data.reduce((sum, r) => sum + r.total, 0);
      const avgReceipt = receiptsData.data.length > 0 ? total / receiptsData.data.length : 0;
      
      setStats({
        totalReceipts: receiptsData.data.length,
        totalSpent: total,
        avgReceiptAmount: avgReceipt,
        scansRemaining: 5 - receiptsData.data.length
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Your Dashboard 📊</h1>
          <p>Track your spending and discover insights</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🧾</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.totalReceipts || 0}</div>
              <div className="stat-label">Receipts Scanned</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-content">
              <div className="stat-value">${(stats?.totalSpent || 0).toFixed(2)}</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">${(stats?.avgReceiptAmount || 0).toFixed(2)}</div>
              <div className="stat-label">Avg per Receipt</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-value">{stats?.scansRemaining || 5}</div>
              <div className="stat-label">Scans Remaining</div>
            </div>
          </div>
        </div>
        
        {receipts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📱</div>
            <h2>No receipts yet</h2>
            <p>Start by scanning your first receipt to see insights here</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/scan'}
            >
              Scan Your First Receipt
            </button>
          </div>
        ) : (
          <>
            <div className="section">
              <h2>Recent Receipts</h2>
              <div className="receipts-list">
                {receipts.map((receipt, index) => (
                  <div key={receipt.id || index} className="receipt-card">
                    <div className="receipt-header">
                      <div className="receipt-store">{receipt.storeName}</div>
                      <div className="receipt-date">{receipt.date}</div>
                    </div>
                    <div className="receipt-body">
                      <div className="receipt-items">
                        {receipt.itemCount} items
                      </div>
                      <div className="receipt-total">
                        ${receipt.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="quick-actions">
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/scan'}
              >
                📱 Scan Another Receipt
              </button>
              <button 
                className="btn-secondary"
                onClick={() => window.location.href = '/insights'}
              >
                📊 View Insights
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
