const express = require('express');
const path    = require('path');
const sequelize = require('./config/database');
const dotenv    = require('dotenv');
const authRoutes   = require('./routes/auth');
const formRoutes   = require('./routes/forms');
const supportRoutes= require('./routes/support');
const userRoutes   = require('./routes/users');

dotenv.config();
const app = express();
app.use(express.json());

// API routes
app.use('/api/auth',    authRoutes);
app.use('/api/forms',   formRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/users',   userRoutes);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// HTML5 history mode fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Sync DB and start
sequelize
  .sync({ force: true })
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`🚀 Server (re)created schema and is running on http://localhost:${port}`));
  });