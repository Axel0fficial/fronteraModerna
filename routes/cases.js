// routes/cases.js
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const Bundle  = require('../models/Bundle');

const router = express.Router();

// Case 3: raw‐data submit
router.post(
  '/3/submit',
  authenticateToken,
  authorizeRoles('visitorUser'),
  async (req, res) => {
    const { nationalId, vehiclePlate, chassisId } = req.body;
    // validate
    if (!nationalId || !vehiclePlate || !chassisId) {
      return res.status(400).json({ error: 'All three fields are required.' });
    }
    // create bundle with rawData
    const bundle = await Bundle.create({
      submittedById: req.user.id,
      rawData: { nationalId, vehiclePlate, chassisId }
    });
    res.status(201).json(bundle);
  }
);

module.exports = router;
