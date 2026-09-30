const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAuditLogs, getMyHistory } = require('../controllers/auditController');

// Admin: full audit log
router.get('/', protect, authorize('admin'), getAuditLogs);

// Employee: their own activity history
router.get('/my-history', protect, getMyHistory);

module.exports = router;
