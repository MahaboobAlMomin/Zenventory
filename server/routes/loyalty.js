const express = require('express');
const router = express.Router();
const Loyalty = require('../models/Loyalty');

router.post('/check', async (req, res) => {
  const { name, contact } = req.body;
  try {
    const existing = await Loyalty.findOne({ name, contact });
    if (existing) {
      // Returning customer
      existing.coins += 10; // Add extra coins for repeat purchase
      await existing.save();
      return res.json({ exists: true, coins: existing.coins });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { name, contact } = req.body;
  try {
    const existing = await Loyalty.findOne({ name, contact });
    if (existing) {
      return res.json({ coins: existing.coins });
    }
    const newLoyalty = new Loyalty({ name, contact, coins: 10 }); // Start with 10 coins
    await newLoyalty.save();
    return res.json({ coins: 10 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
