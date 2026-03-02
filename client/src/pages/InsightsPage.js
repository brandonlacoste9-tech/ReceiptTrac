import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/InsightsPage.css';

function InsightsPage() {
  const [inflation, setInflation] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [priceAlerts, setPriceAlerts] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadInsights();
  }, []);
  
  const loadInsights = async () => {
    try {
      const [inflationData, personalityData, alertsData, subsData] = await Promise.all([
        api.getInflationInsights(),
        api.getMoneyPersonality(),
        api.getPriceAlerts(),
        api.getSubscriptions()
      ]);
      
      setInflation(inflationData.data);
      setPersonality(personalityData.data);
      setPriceAlerts(alertsData.data);
      setSubscriptions(subsData.data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const sharePersonality = () => {
    if (personality?.shareableCard) {
      const text = `${personality.shareableCard.title}\n${personality.shareableCard.stats.join('\n')}\n${personality.shareableCard.hashtags}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'My Money Personality',
          text: text
        });
      } else {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard! Share it on social media.');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="insights-page">
        <div className="loading">Loading your insights...</div>
      </div>
    );
  }
  
  return (
    <div className="insights-page">
      <div className="insights-container">
        <h1>Your Financial Insights 🔥</h1>
        <p className="subtitle">Discover the truth about your spending</p>
        
        {/* Money Personality */}
        {personality && (
          <div className="insight-card personality-card">
            <div className="card-header">
              <h2>Your Money Personality {personality.emoji}</h2>
            </div>
            <div className="card-body">
              <div className="personality-title">{personality.personality}</div>
              <p className="personality-description">{personality.description}</p>
              
              {personality.weeklyStats && (
                <div className="stats-grid">
                  <div className="stat">
                    <div className="stat-value">${personality.weeklyStats.totalSpent}</div>
                    <div className="stat-label">Total Spent</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{personality.weeklyStats.receiptsScanned}</div>
                    <div className="stat-label">Receipts</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">${personality.weeklyStats.avgReceiptAmount}</div>
                    <div className="stat-label">Avg Receipt</div>
                  </div>
                  <div className="stat">
                    <div className="stat-value">{personality.weeklyStats.topCategory}</div>
                    <div className="stat-label">Top Category</div>
                  </div>
                </div>
              )}
              
              <button className="btn-share" onClick={sharePersonality}>
                📱 Share Your Personality
              </button>
            </div>
          </div>
        )}
        
        {/* Inflation Tracker */}
        {inflation && (
          <div className="insight-card inflation-card">
            <div className="card-header">
              <h2>📈 Inflation Impact</h2>
            </div>
            <div className="card-body">
              <div className="impact-banner">
                <div className="impact-value">${inflation.totalInflationImpact}</div>
                <div className="impact-label">more than 2022 prices</div>
              </div>
              
              <p className="insight-message">{inflation.message}</p>
              
              {inflation.topInflatedItems && inflation.topInflatedItems.length > 0 && (
                <div className="inflated-items">
                  <h3>Most Inflated Items</h3>
                  {inflation.topInflatedItems.map((item, index) => (
                    <div key={index} className="inflated-item">
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-comparison">
                          2022: ${item.price2022} → Now: ${item.currentPrice}
                        </div>
                      </div>
                      <div className="item-increase">
                        +{item.increasePercent}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {inflation.shareableMessage && (
                <div className="shareable-message">
                  <p>{inflation.shareableMessage}</p>
                  <button className="btn-share" onClick={() => {
                    if (navigator.share) {
                      navigator.share({ text: inflation.shareableMessage });
                    } else {
                      navigator.clipboard.writeText(inflation.shareableMessage);
                      alert('Copied to clipboard!');
                    }
                  }}>
                    📱 Share This
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Price Alerts */}
        {priceAlerts && priceAlerts.alerts && priceAlerts.alerts.length > 0 && (
          <div className="insight-card alerts-card">
            <div className="card-header">
              <h2>⚠️ Price Gouging Alerts</h2>
            </div>
            <div className="card-body">
              <p className="insight-message">{priceAlerts.message}</p>
              
              <div className="alerts-list">
                {priceAlerts.alerts.map((alert, index) => (
                  <div key={index} className={`alert-item ${alert.severity}`}>
                    <div className="alert-info">
                      <div className="alert-item-name">{alert.item}</div>
                      <div className="alert-store">{alert.store} • {alert.date}</div>
                    </div>
                    <div className="alert-prices">
                      <div className="alert-paid">Paid: ${alert.paidPrice}</div>
                      <div className="alert-avg">Avg: ${alert.regionalAverage}</div>
                      <div className="alert-overpay">+${alert.overchargeAmount} ({alert.overchargePercent}%)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Subscriptions */}
        {subscriptions && subscriptions.subscriptions && subscriptions.subscriptions.length > 0 && (
          <div className="insight-card subscriptions-card">
            <div className="card-header">
              <h2>💀 Recurring Charges Detected</h2>
            </div>
            <div className="card-body">
              <p className="insight-message">{subscriptions.message}</p>
              
              <div className="total-monthly">
                <span>Total Monthly Spend:</span>
                <span className="amount">${subscriptions.totalMonthlySpend}</span>
              </div>
              
              <div className="subscriptions-list">
                {subscriptions.subscriptions.map((sub, index) => (
                  <div key={index} className="subscription-item">
                    <div className="sub-info">
                      <div className="sub-merchant">{sub.merchant}</div>
                      <div className="sub-details">
                        {sub.frequency} charges • Last: {sub.lastCharged}
                      </div>
                    </div>
                    <div className="sub-amount">
                      ${sub.averageAmount}/mo
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!inflation?.topInflatedItems?.length && !priceAlerts?.alerts?.length && !subscriptions?.subscriptions?.length && (
          <div className="empty-insights">
            <div className="empty-icon">📊</div>
            <h2>Not enough data yet</h2>
            <p>Scan more receipts to unlock powerful insights about your spending</p>
            <button 
              className="btn-primary"
              onClick={() => window.location.href = '/scan'}
            >
              Scan More Receipts
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InsightsPage;
