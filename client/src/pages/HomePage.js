import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Stop wondering where your money went.
            <span className="gradient-text"> Your receipts tell the truth.</span>
          </h1>
          
          <p className="hero-subtitle">
            The Anti-Gaslighting Money App that reveals inflation, tracks subscriptions, 
            and shows you exactly where every dollar goes.
          </p>
          
          <div className="hero-actions">
            <Link to="/scan" className="btn-primary">
              📱 Scan Your First Receipt
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              View Demo
            </Link>
          </div>
          
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">47%</div>
              <div className="stat-label">Avg. price increase since 2021</div>
            </div>
            <div className="stat">
              <div className="stat-value">$156</div>
              <div className="stat-label">Avg. monthly hidden costs</div>
            </div>
            <div className="stat">
              <div className="stat-value">3.2</div>
              <div className="stat-label">Forgotten subscriptions per user</div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="features">
        <h2 className="section-title">How It Works 🎯</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Snap → Scan → Story</h3>
            <p>Photo any receipt. AI extracts every line item instantly with OCR technology.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Inflation Tracker</h3>
            <p>"This grocery run cost you $23 more than it would have in 2022" - Know the real cost.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚠️</div>
            <h3>Price Gouging Alerts</h3>
            <p>Flags items priced above regional averages. Stop overpaying.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💀</div>
            <h3>Subscription Grave Digger</h3>
            <p>Surfaces forgotten recurring charges. Cancel what you don't use.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎭</div>
            <h3>Your Money Personality</h3>
            <p>Weekly shareable report card. See your spending habits visualized.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <h3>Shareable Insights</h3>
            <p>"I'm paying 47% more for eggs than 2021" - Create viral content from your data.</p>
          </div>
        </div>
      </section>
      
      <section className="pricing">
        <h2 className="section-title">Simple Pricing 💰</h2>
        
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="price">$0<span>/month</span></div>
            <ul className="features-list">
              <li>✅ 5 receipt scans per month</li>
              <li>✅ Basic inflation insights</li>
              <li>✅ Price alerts</li>
              <li>✅ Money personality report</li>
            </ul>
            <Link to="/scan" className="btn-outline">Get Started Free</Link>
          </div>
          
          <div className="pricing-card featured">
            <div className="badge">Most Popular</div>
            <h3>Pro</h3>
            <div className="price">$4.99<span>/month</span></div>
            <ul className="features-list">
              <li>✅ Unlimited receipt scans</li>
              <li>✅ Advanced analytics & trends</li>
              <li>✅ Subscription tracking</li>
              <li>✅ Export data & reports</li>
              <li>✅ Priority support</li>
              <li>✅ Quebec localization</li>
            </ul>
            <button className="btn-primary">Upgrade to Pro</button>
          </div>
        </div>
      </section>
      
      <section className="cta">
        <h2>Ready to see where your money really goes?</h2>
        <p>Join thousands of people taking control of their finances</p>
        <Link to="/scan" className="btn-primary">
          Start Scanning Now →
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
