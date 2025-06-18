
// routes/support.js
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');

const router = express.Router();

// Create ticket (all users)
router.post('/', authenticateToken, async (req, res) => {
  const ticket = await SupportTicket.create({
    message: req.body.message,
    userId: req.user.id
  });
  res.json(ticket);
});

// List tickets
router.get('/', authenticateToken, async (req, res) => {
  const { role, id } = req.user;
  let tickets;
  if (role === 'supportUser' || role === 'admin') {
    tickets = await SupportTicket.findAll({ include: ['user'] });
  } else {
    tickets = await SupportTicket.findAll({ where: { userId: id } });
  }
  res.json(tickets);
});

module.exports = router;
