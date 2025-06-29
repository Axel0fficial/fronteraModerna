// routes/bundles.js
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const Bundle = require('../models/Bundle');
const Form   = require('../models/Form');

const router = express.Router();

// Create a new bundle
router.post(
  '/',
  authenticateToken,
  async (req, res) => {
    const bundle = await Bundle.create({ submittedById: req.user.id });
    res.status(201).json(bundle);
  }
);

// List bundles (admin/moderator)
router.get(
  '/',
  authenticateToken,
  authorizeRoles('moderator','admin'),
  async (req, res) => {
    const bundles = await Bundle.findAll({
      include: [
        { model: Form },
        { association: 'submittedBy', attributes: ['id','username'] },
      ],
      order: [['submittedAt','DESC']],
    });
    res.json(bundles);
  }
);

// Get a single bundle’s details
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('moderator','admin'),
  async (req, res) => {
    const bundle = await Bundle.findByPk(req.params.id, {
      include: [
        { model: Form },
        { association: 'submittedBy', attributes: ['username'] },
      ],
      attributes: ['id','status','submittedAt','rejectionReason']
    });
    if (!bundle) return res.sendStatus(404);
    res.json(bundle);
  }
);

// Approve/reject a bundle
 router.patch(
   '/:id/status',
   authenticateToken,
   authorizeRoles('moderator','admin'),
   async (req, res) => {
     const { status, reason } = req.body;
     const bundle = await Bundle.findByPk(req.params.id);
     if (!bundle) return res.sendStatus(404);
     bundle.status = status;
     bundle.moderatorId = req.user.id;
     // if rejected, store the reason
     if (status === 'rejected') {
       bundle.rejectionReason = reason || null;
     } else {
       bundle.rejectionReason = null;
     }
     await bundle.save();
     res.json(bundle);
   }
 );
module.exports = router;
