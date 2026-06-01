const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.use(authMiddleware);

router.post('/', requireRole('customer'), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/waiting', taskController.getWaitingTasks);
router.get('/:id', taskController.getTaskById);
router.post('/:id/accept', requireRole('buter'), taskController.acceptTask);
router.put('/:id/start', requireRole('buter'), taskController.startTask);
router.put('/:id/complete', requireRole('buter'), taskController.completeTask);
router.put('/:id/cancel', taskController.cancelTask);
router.post('/:id/review', requireRole('customer'), taskController.submitReview);
router.post('/:id/tracking', requireRole('buter'), taskController.addTrackingPoint);
router.get('/:id/tracking', taskController.getTrackingHistory);

module.exports = router;