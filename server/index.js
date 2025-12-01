require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const productRoutes = require('./routes/products');
const seedRoutes = require('./routes/seed'); // ✅ Import seed route
const billingRoutes = require('./routes/billing');
const loyaltyRoutes = require('./routes/loyalty');


const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB using Atlas URI
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/seed', seedRoutes); // ✅ Mount seed route
app.use('/api', billingRoutes);
app.use('/api/loyalty', loyaltyRoutes);
// Root health check
app.get('/', (req, res) => {
  res.send('🔄 Server is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
