const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const fs = require('fs');
const path = require('path');
const Loyalty = require('../models/Loyalty');

router.post('/', async (req, res) => {
    try {
        const { customerName, phone, products } = req.body;
        let total = 0;
        let discount = 0;

        products.forEach(p => total += p.price * p.quantity);

        if (total >= 1000) discount += 10;
        const loyalty = await Loyalty.findOne({ customerName, phone });
        if (loyalty) discount += loyalty.discount || 5;

        const discountAmount = (discount / 100) * total;
        const finalAmount = total - discountAmount;

        const bill = new Bill({
            customerName,
            phone,
            products,
            total,
            discount,
            finalAmount
        });

        const savedBill = await bill.save();

        const content = `
Customer: ${customerName}
Phone: ${phone}
Products:
${products.map(p => ` - ${p.name} x${p.quantity} = ₹${p.price * p.quantity}`).join('\n')}
Total: ₹${total}
Discount: ${discount}%
Final Amount: ₹${finalAmount}
Date: ${new Date().toLocaleString()}
        `;
        const billsDir = path.join(__dirname, '../bills');
        if (!fs.existsSync(billsDir)) fs.mkdirSync(billsDir);
        fs.writeFileSync(path.join(billsDir, `bill_${Date.now()}.txt`), content);

        res.status(201).json(savedBill);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;