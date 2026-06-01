const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(authMiddleware);
router.use(requireRole('admin'));

router.get('/stats', adminController.getStats);

module.exports = router;