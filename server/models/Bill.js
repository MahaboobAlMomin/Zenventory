const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  customerName: String,
  contact: String,
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  discount: Number,
  netPay: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
