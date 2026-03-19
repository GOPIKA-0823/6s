const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agaram-agency', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact-messages', require('./routes/contactMessages'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/payments', require('./routes/payments'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});