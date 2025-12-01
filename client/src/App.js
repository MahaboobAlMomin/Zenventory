// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from '../src/components/LandingPage';
import Product from '../src/components/Product';
import Billing from '../src/components/Billing';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/products" element={<Product />} />
      <Route path="/billing" element={<Billing />} />
    </Routes>
  </Router>
);

export default App;
