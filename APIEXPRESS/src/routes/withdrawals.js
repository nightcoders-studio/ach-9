const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const withdrawalController = require('../controllers/withdrawalController');

router.use(authMiddleware);

router.post('/', requireRole('buter'), withdrawalController.createWithdrawal);
router.get('/', withdrawalController.getWithdrawals);
router.put('/:id/process', requireRole('admin'), withdrawalController.processWithdrawal);

module.exports = router;