const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admin)
const getStudents = asyncHandler(async (req, res) => {
    const students = await StudentProfile.find({})
        .populate('userId', 'name email branch year role')
        .sort({ createdAt: -1 });
    res.json(students);
});

// @desc    Get analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = asyncHandler(async (req, res) => {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const students = await StudentProfile.find({});

    const completedOnboarding = students.filter(s => s.progressPercentage === 100).length;
    const pendingDocuments = students.reduce((acc, curr) => {
        const pending = curr.documents.filter(d => d.status === 'pending').length;
        return acc + pending;
    }, 0);
    const feePendingCount = students.filter(s => s.fee.status === 'pending').length;

    res.json({
        totalStudents,
        completedOnboarding,
        pendingDocuments,
        feePendingCount
    });
});

// @desc    Get all hostel applications (pending, approved, rejected)
// @route   GET /api/admin/hostel-applications
// @access  Private (Admin)
const getHostelApplications = asyncHandler(async (req, res) => {
    const profiles = await StudentProfile.find({
        'hostel.status': { $ne: 'not_applied' }
    }).populate('userId', 'name email branch year');

    const applications = profiles.map(profile => ({
        studentId: profile.userId._id,
        name: profile.userId.name,
        email: profile.userId.email,
        branch: profile.userId.branch,
        year: profile.userId.year,
        hostel: profile.hostel
    }));

    res.json(applications);
});

// @desc    Approve or reject a hostel application
// @route   PUT /api/admin/hostel-applications/:studentId
// @access  Private (Admin)
const approveRejectHostel = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Status must be approved or rejected');
    }

    const profile = await StudentProfile.findOne({ userId: studentId });

    if (!profile) {
        res.status(404);
        throw new Error('Student profile not found');
    }

    profile.hostel.status = status;
    if (status === 'rejected') {
        profile.hostel.rejectionReason = rejectionReason || 'Application rejected by admin';
    } else {
        profile.hostel.rejectionReason = undefined;
    }

    await profile.save();
    res.json({ message: `Hostel application ${status}`, hostel: profile.hostel });
});

module.exports = {
    getStudents,
    getAnalytics,
    getHostelApplications,
    approveRejectHostel
};

