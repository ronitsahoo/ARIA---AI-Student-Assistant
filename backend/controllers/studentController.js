const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const fs = require('fs');
const path = require('path');

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student)
const getProfile = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ userId: req.user._id }).populate('userId', 'name email branch year');
    if (profile) {
        res.json(profile);
    } else {
        res.status(404);
        throw new Error('Profile not found');
    }
});

// @desc    Upload document
// @route   POST /api/student/upload-document
// @access  Private (Student)
const uploadDocument = asyncHandler(async (req, res) => {
    const { type } = req.body;

    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (profile) {
        // If a doc of the same type already exists (and is uploaded/pending), replace it
        const existingIndex = profile.documents.findIndex(
            d => d.type === type && ['pending', 'uploaded'].includes(d.status)
        );

        if (existingIndex !== -1) {
            // Delete old file from disk
            const oldFilePath = path.join(__dirname, '..', profile.documents[existingIndex].fileUrl);
            if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
            // Remove old doc
            profile.documents.splice(existingIndex, 1);
        }

        const newDoc = {
            fileUrl: `/uploads/${req.file.filename}`,
            originalName: req.file.originalname,
            type,
            status: 'uploaded'
        };

        profile.documents.push(newDoc);
        await profile.save();

        res.status(201).json(profile);
    } else {
        res.status(404);
        throw new Error('Profile not found');
    }
});

// @desc    Delete a document
// @route   DELETE /api/student/document/:docId
// @access  Private (Student)
const deleteDocument = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
        res.status(404);
        throw new Error('Profile not found');
    }

    const doc = profile.documents.id(req.params.docId);
    if (!doc) {
        res.status(404);
        throw new Error('Document not found');
    }

    // Only allow deleting docs that are uploaded (not submitted/approved/rejected)
    if (doc.status === 'submitted' || doc.status === 'approved') {
        res.status(400);
        throw new Error('Cannot delete a submitted or approved document');
    }

    // Remove file from disk
    const filePath = path.join(__dirname, '..', doc.fileUrl);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    // Remove doc from array
    profile.documents.pull({ _id: req.params.docId });
    await profile.save();

    res.json(profile);
});

// @desc    Submit all uploaded documents (makes them visible to staff)
// @route   POST /api/student/submit-documents
// @access  Private (Student)
const submitDocuments = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (!profile) {
        res.status(404);
        throw new Error('Profile not found');
    }

    let submitted = 0;
    profile.documents.forEach(doc => {
        if (doc.status === 'uploaded') {
            doc.status = 'submitted';
            submitted++;
        }
    });

    if (submitted === 0) {
        res.status(400);
        throw new Error('No uploaded documents to submit');
    }

    await profile.save();
    res.json(profile);
});

const applyHostel = asyncHandler(async (req, res) => {
    const { gender, roomType } = req.body;

    if (!gender || !roomType) {
        res.status(400);
        throw new Error('Gender and room type are required');
    }

    const validRoomTypes = ['single', 'double', 'triple'];
    const validGenders = ['Male', 'Female'];

    if (!validGenders.includes(gender) || !validRoomTypes.includes(roomType)) {
        res.status(400);
        throw new Error('Invalid gender or room type');
    }

    const profile = await StudentProfile.findOne({ userId: req.user._id });

    if (profile) {
        const currentStatus = profile.hostel.status;
        if (currentStatus === 'pending' || currentStatus === 'approved') {
            res.status(400);
            throw new Error('You already have an active hostel application');
        }

        profile.hostel.gender = gender;
        profile.hostel.roomType = roomType;
        profile.hostel.status = 'pending';
        profile.hostel.rejectionReason = undefined;

        await profile.save();
        res.json(profile);
    } else {
        res.status(404);
        throw new Error('Profile not found');
    }
});

const activateLMS = asyncHandler(async (req, res) => {
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (profile) {
        profile.lmsActivated = true;
        await profile.save();
        res.json(profile);
    } else {
        res.status(404);
        throw new Error('Profile not found');
    }
});

module.exports = {
    getProfile,
    uploadDocument,
    deleteDocument,
    submitDocuments,
    applyHostel,
    activateLMS
};
