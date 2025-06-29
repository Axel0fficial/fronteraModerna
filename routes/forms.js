const express = require('express');
const multer = require('multer');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const Form = require('../models/Form');
const User = require('../models/User');
const Bundle = require('../models/Bundle');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },      // max 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  }
});

// Upload PDF (visitorUser)
router.post(
  '/upload',
  authenticateToken,
  authorizeRoles('visitorUser'),
  upload.fields([
    { name: 'pdf', maxCount: 7 },
    { name: 'certificate', maxCount: 1 }
  ]),
  async (req, res) => {
    // Create a new bundle for this submission
    const bundle = await Bundle.create({ submittedById: req.user.id });
    const bundleId = bundle.id;

    // Retrieve user for age check
    const user = await User.findByPk(req.user.id);
    if (user.age < 18 && !req.files['certificate']) {
      return res.status(400).json({ error: 'Certificate required for users under 18.' });
    }

    const pdfFiles = req.files['pdf'];
    const certFile = req.files['certificate']?.[0];

    const created = [];
    for (const file of pdfFiles) {
      const f = await Form.create({
        pdfUrl: file.path,
        guardianCertificateUrl: certFile?.path,
        submittedById: req.user.id,
        bundleId
      });
      created.push(f);
    }
    res.json(created);
  }
);

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
