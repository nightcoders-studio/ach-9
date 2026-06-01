const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/auth');
const buterController = require('../controllers/buterController');

router.use(authMiddleware);

router.post('/register', requireRole('buter'), buterController.registerButer);
router.put('/:id/approve', requireRole('admin'), buterController.approveButer);
router.get('/', buterController.getButers);

module.exports = router;