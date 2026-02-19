const express = require('express');
const router = express.Router();
const {
    getStudents,
    getAnalytics,
    getHostelApplications,
    approveRejectHostel,
    getAllPayments
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/students').get(protect, adminOnly, getStudents);
router.route('/analytics').get(protect, adminOnly, getAnalytics);
router.route('/hostel-applications').get(protect, adminOnly, getHostelApplications);
router.route('/hostel-applications/:studentId').put(protect, adminOnly, approveRejectHostel);
router.route('/payments').get(protect, adminOnly, getAllPayments);

module.exports = router;

