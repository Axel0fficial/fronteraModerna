const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Register (optionally accepts a role)
router.post('/register', async (req, res) => {
  const {
    username,
    password,
    email,
    role,
    age,
    birthday,
    nationalId,
    nationalIdNumber,         // ← add this
    passportNumber,
    passportExpiry,
    drivingLicenseNumber,     // ← and this
    drivingLicenseExpiry,     // ← and this
    parentFirstName,
    parentLastName,
    parentNationalId
  } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const assignedRole = role || 'visitorUser';

  if (age < 18 && (!parentFirstName || !parentLastName || !parentNationalId)) {
    return res.status(400).json({ error: 'Under-18 users must provide guardian name & ID.' });
  }
  try {
    const user = await User.create({
      username,
      passwordHash,
      email,
      role: assignedRole,
      age,
      birthday,
      nationalId,
      nationalIdNumber,
      passportNumber,
      passportExpiry,
      drivingLicenseNumber,
      drivingLicenseExpiry,
      parentFirstName,
      parentLastName,
      parentNationalId
    });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: 'Invalid password' });
  const token = jwt.sign(
    { id: user.id, role: user.role, age: user.age },
    process.env.JWT_SECRET
  );
  res.json({ token });
});

module.exports = router;