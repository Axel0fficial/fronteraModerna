// routes/users.js
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// List all users (admin only)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    const users = await User.findAll({
      attributes: ['id','username','email','role','age','birthday','nationalIdNumber','passportNumber','passportExpiry','drivingLicenseNumber','drivingLicenseExpiry']
    });
    res.json(users);
  }
);

// Get single user (self or admin)
router.get(
  '/:id',
  authenticateToken,
  async (req, res) => {
    const requestedId = parseInt(req.params.id, 10);
    // allow if user is requesting their own profile or is an admin
    if (req.user.id !== requestedId && req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const user = await User.findByPk(requestedId, {
      attributes: ['id','username','email','role','age','birthday','nationalIdNumber','passportNumber','passportExpiry','drivingLicenseNumber','drivingLicenseExpiry','parentFirstName','parentLastName','parentNationalId']
    });
    if (!user) return res.sendStatus(404);
    res.json(user);
  }
);

// Update user (self or admin)
router.patch(
  '/:id',
  authenticateToken,
  async (req, res) => {
    const requestedId = parseInt(req.params.id, 10);
    if (req.user.id !== requestedId && req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    const user = await User.findByPk(requestedId);
    if (!user) return res.sendStatus(404);

    // Only allow these fields to be updated
    const updatable = [
      'username','email','role','age','birthday',
      'nationalIdNumber','passportNumber','passportExpiry',
      'drivingLicenseNumber','drivingLicenseExpiry',
      'parentFirstName','parentLastName','parentNationalId'
    ];
    updatable.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    // allow password change if provided
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      user.passwordHash = bcrypt.hashSync(req.body.password, 10);
    }

    await user.save();
    res.json({ message: 'User updated' });
  }
);

// Delete user (admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  async (req, res) => {
    const requestedId = parseInt(req.params.id, 10);
    const user = await User.findByPk(requestedId);
    if (!user) return res.sendStatus(404);
    await user.destroy();
    res.sendStatus(204);
  }
);

module.exports = router;
