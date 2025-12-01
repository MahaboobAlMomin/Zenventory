import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ZenBot.css';

function ZenBot() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am ZenBot 🤖. Ask me about products, prices, quantities, or loyalty coins!' }
  ]);
  const [input, setInput] = useState('');
  const [products, setProducts] = useState([]);

  // Load products on mount
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  // Add message to chat
  const addMessage = (from, text) => {
    setMessages(prev => [...prev, { from, text }]);
  };

  // Handle predefined button clicks
  const handleButtonClick = async (type) => {
    if (type === 'products') {
      if (products.length === 0) {
        addMessage('bot', 'Sorry, no products available right now.');
      } else {
        const productNames = products.map(p => p.name).join(', ');
        addMessage('bot', `We have these products: ${productNames}`);
      }
    }
    else if (type === 'loyalty') {
      addMessage('bot', 'Loyalty coins are awarded on repeat purchases. Provide your name and contact in billing to earn coins!');
    }
    else if (type === 'help') {
      addMessage('bot', 'You can ask me about product prices, quantities, or loyalty coins. Try typing "price of iPhone" or click the buttons!');
    }
  };

  // Handle user free text input
  const handleUserQuery = async () => {
    if (!input.trim()) return;

    addMessage('user', input);

    const lower = input.toLowerCase();

    // Check for price queries: "price of <product>"
    if (lower.includes('price')) {
      const found = products.find(p => lower.includes(p.name.toLowerCase()));
      if (found) {
        addMessage('bot', `The price of ${found.name} is Rs. ${found.price.toFixed(2)}.`);
      } else {
        addMessage('bot', `Sorry, I couldn't find that product.`);
      }
    }
    // Check for quantity queries: "quantity of <product>"
    else if (lower.includes('quantity')) {
      const found = products.find(p => lower.includes(p.name.toLowerCase()));
      if (found) {
        addMessage('bot', `We have ${found.quantity} units of ${found.name} available.`);
      } else {
        addMessage('bot', `Sorry, I couldn't find that product.`);
      }
    }
    else if (lower.includes('loyalty') || lower.includes('coin')) {
      addMessage('bot', 'Loyalty coins are given on repeat purchases. Use the billing section and enter your details to earn coins!');
    }
    else {
      addMessage('bot', `Sorry, I didn't understand that. Please ask about product price, quantity or loyalty coins.`);
    }

    setInput('');
  };

  return (
    <div className="zenbot-container">
      <div className="zenbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.from}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="zenbot-buttons">
        <button onClick={() => handleButtonClick('products')}>Products</button>
        <button onClick={() => handleButtonClick('loyalty')}>Loyalty Coins</button>
        <button onClick={() => handleButtonClick('help')}>Help</button>
      </div>
      <div className="zenbot-input">
        <input
          type="text"
          placeholder="Ask me something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleUserQuery(); }}
        />
        <button onClick={handleUserQuery}>Send</button>
      </div>
    </div>
  );
}

export default ZenBot;
