const express = require('express');
const multer = require('multer');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const Form = require('../models/Form');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload PDF (visitorUser)
router.post('/upload', authenticateToken, authorizeRoles('visitorUser'), upload.single('pdf'), async (req, res) => {
  const form = await Form.create({
    pdfUrl: req.file.path,
    submittedById: req.user.id
  });
  res.json(form);
});

// List Forms
router.get('/', authenticateToken, async (req, res) => {
  const { role, id } = req.user;
  let forms;
  if (role === 'moderator' || role === 'admin') {
    forms = await Form.findAll({ include: ['submittedBy', 'moderator'] });
  } else {
    forms = await Form.findAll({ where: { submittedById: id } });
  }
  res.json(forms);
});

// Update status (moderator/admin)
router.patch('/:id/status', authenticateToken, authorizeRoles('moderator', 'admin'), async (req, res) => {
  const { status } = req.body;
  const form = await Form.findByPk(req.params.id);
  if (!form) return res.sendStatus(404);
  form.status = status;
  form.moderatorId = req.user.id;
  await form.save();
  res.json(form);
});

module.exports = router;
