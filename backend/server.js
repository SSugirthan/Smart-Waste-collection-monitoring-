require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const binRoutes = require('./routes/bins');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connection successful'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/bins', binRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('Smart Waste Collection Monitoring API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
