const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const disputeController = require('../controllers/disputeController');

router.use(authMiddleware);

router.post('/', disputeController.createDispute);
router.get('/', disputeController.getDisputes);
router.get('/:id', disputeController.getDisputeById);
router.put('/:id/chat', disputeController.addChatMessage);
router.put('/:id/resolve', requireRole('admin'), disputeController.resolveDispute);
router.put('/:id/status', requireRole('admin'), disputeController.updateDisputeStatus);

module.exports = router;