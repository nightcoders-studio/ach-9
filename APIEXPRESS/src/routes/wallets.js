const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const walletController = require('../controllers/walletController');

router.use(authMiddleware);

router.get('/me', requireRole('buter'), walletController.getMyWallet);
router.get('/me/transactions', walletController.getTransactions);

module.exports = router;