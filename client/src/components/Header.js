import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🧾</span>
          <span className="logo-text">ReceiptAI</span>
        </Link>
        
        <nav className="nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/scan" className="nav-link">Scan Receipt</Link>
          <Link to="/insights" className="nav-link">Insights</Link>
        </nav>
        
        <div className="header-actions">
          <button className="btn-upgrade">Upgrade to Pro 👑</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
