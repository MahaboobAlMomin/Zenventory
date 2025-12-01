import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ZenBot from './ZenBot';  // make sure ZenBot is default export
import './LandingPage.css';

function LandingPage() {
  const [showChatbot, setShowChatbot] = useState(false);
  const [theme, setTheme] = useState('light');
  const [welcomeText, setWelcomeText] = useState('');
  const fullWelcome = "Welcome to Zenventory — Your smart inventory & billing assistant!";

  // Animate welcome text typing effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setWelcomeText(fullWelcome.slice(0, index));
      index++;
      if (index > fullWelcome.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Toggle chatbot visibility
  const toggleChatbot = () => {
    setShowChatbot(prev => !prev);
  };

  // Keyboard accessible toggle for chatbot button
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleChatbot();
    }
  };

  // Toggle theme between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="landing-container">
      <header>
        <h1 className="welcome-message">{welcomeText}</h1>
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          aria-label="Toggle Light/Dark Theme"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </header>

      <section className="button-group">
        <Link to="/products">
          <button className="btn-tooltip" aria-label="Go to Products section">
            Products
            <span className="tooltip">View & Manage Products</span>
          </button>
        </Link>

        <Link to="/billing">
          <button className="btn-tooltip" aria-label="Go to Billing section">
            Billing
            <span className="tooltip">Create & Manage Bills</span>
          </button>
        </Link>
      </section>

      <section className="features-panel">
        <h2>Why Zenventory?</h2>
        <ul>
          <li>📦 Real-time product & stock management</li>
          <li>🧾 Automated billing with smart discounts</li>
          <li>🤖 Interactive chatbot for quick help</li>
          <li>💰 Loyalty coins & customer rewards</li>
        </ul>
      </section>

      {/* Chatbot Icon Button */}
      <button 
        className={`chatbot-icon-btn ${showChatbot ? 'active' : ''}`} 
        onClick={toggleChatbot}
        onKeyDown={handleKeyDown}
        aria-expanded={showChatbot}
        aria-label={showChatbot ? 'Close chatbot' : 'Open chatbot'}
        title="Chat with ZenBot"
      >
        💬
      </button>

      {/* Chatbot Component with fade-in */}
      {showChatbot && (
        <div className="chatbot-wrapper fade-in">
          <ZenBot />
        </div>
      )}
    </div>
  );
}

export default LandingPage;
