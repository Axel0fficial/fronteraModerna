const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// List users (admin only), optional filter by role
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { role } = req.query;
  const where = role ? { role } : {};
  const users = await User.findAll({ where, attributes: { exclude: ['passwordHash'] } });
  res.json(users);
});

// Get single user (admin only)
router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ['passwordHash'] } });
  if (!user) return res.sendStatus(404);
  res.json(user);
});

// Update user (admin only)
router.patch('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.sendStatus(404);
  const { username, email, role, age, birthday, nationalId, passportNumber, passportExpiry } = req.body;
  if (req.body.password) {
    user.passwordHash = await bcrypt.hash(req.body.password, 10);
  }
  Object.assign(user, { username, email, role, age, birthday, nationalId, passportNumber, passportExpiry });
  await user.save();
  const { id, username: u, email: e, role: r, age: a, birthday: b, nationalId: n, passportNumber: p, passportExpiry: x } = user;
  res.json({ id, username: u, email: e, role: r, age: a, birthday: b, nationalId: n, passportNumber: p, passportExpiry: x });
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const result = await User.destroy({ where: { id: req.params.id } });
  if (!result) return res.sendStatus(404);
  res.sendStatus(204);
});

module.exports = router;