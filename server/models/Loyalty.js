const mongoose = require('mongoose');

const LoyaltySchema = new mongoose.Schema({
  name: String,
  contact: String,
  coins: { type: Number, default: 0 },
});

module.exports = mongoose.model('Loyalty', LoyaltySchema);
