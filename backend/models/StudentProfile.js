const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileUrl: { type: String, required: true },
    originalName: { type: String }, // original filename for display
    status: {
        type: String,
        enum: ['pending', 'uploaded', 'submitted', 'approved', 'rejected'],
        default: 'uploaded'
    },
    rejectionReason: { type: String },
    type: { type: String, required: true } // e.g., '10th Marksheet', 'Aadhar'
}, { timestamps: true });

const feeSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    transactionId: { type: String }, // Razorpay Payment ID
    orderId: { type: String }, // Razorpay Order ID
    signature: { type: String }
}, { timestamps: true });

const hostelSchema = new mongoose.Schema({
    gender: { type: String, enum: ['Male', 'Female'] },
    roomType: { type: String, enum: ['single', 'double', 'triple'] },
    status: {
        type: String,
        enum: ['not_applied', 'pending', 'approved', 'rejected'],
        default: 'not_applied'
    },
    rejectionReason: { type: String }
});

const studentProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    documents: [documentSchema],
    fee: feeSchema,
    hostel: hostelSchema,
    lmsActivated: {
        type: Boolean,
        default: false
    },
    registeredSubjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    progressPercentage: {
        type: Number,
        default: 0
    },
    notifications: [{
        message: String,
        date: { type: Date, default: Date.now },
        read: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

// Calculate progress percentage middleware
studentProfileSchema.pre('save', function (next) {
    let totalPoints = 0;
    let earnedPoints = 0;

    // Documents (40%)
    if (this.documents && this.documents.length > 0) {
        const approvedDocs = this.documents.filter(doc => doc.status === 'approved').length;
        if (approvedDocs > 0) {
            earnedPoints += (approvedDocs / this.documents.length) * 40;
        }
        totalPoints += 40;
    }

    // Fee (30%)
    if (this.fee && this.fee.status === 'paid') earnedPoints += 30;
    totalPoints += 30;

    // Hostel (15%) - Optional, assuming applied counts
    if (this.hostel && this.hostel.status !== 'not_applied') earnedPoints += 15;
    totalPoints += 15;

    // LMS (15%)
    if (this.lmsActivated) earnedPoints += 15;
    totalPoints += 15;

    this.progressPercentage = totalPoints === 0 ? 0 : Math.round((earnedPoints / 100) * 100);
    next();
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
