const express = require('express');
const path    = require('path');
const sequelize = require('./config/database');
const dotenv    = require('dotenv');

const authRoutes   = require('./routes/auth');
const formRoutes   = require('./routes/forms');
const supportRoutes= require('./routes/support');
const userRoutes   = require('./routes/users');
const bundlesRoutes = require('./routes/bundles');

dotenv.config();
const app = express();
app.use(express.json());

// API routes
app.use('/api/auth',    authRoutes);
app.use('/api/forms',   formRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/bundles', bundlesRoutes);

// Serve static frontend
app.use(
  express.static(path.join(__dirname, 'public'), {
    index: 'login.html'
  })
);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/templates', express.static(path.join(__dirname,'public', 'templates')));

/*
<a href="/templates/underage_consent.pdf" target="_blank" download>
  Download guardian consent form
</a>
*/ 

// HTML5 history mode fallback
app.get('*', (req, res) => {
  // For any unknown GET, serve login.html (or your main app shell)
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// Sync DB and start
sequelize
  .sync({ force: true })  // or alter: true / empty
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch(err => console.error('DB sync failed:', err));