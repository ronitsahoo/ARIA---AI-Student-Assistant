const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    year: {
        type: String,
        enum: ['1', '2', '3', '4'],
        required: true
    },
    branch: {
        type: String,
        enum: ['Common', 'CSE', 'ECE', 'MECH', 'CIVIL'],
        required: true
    }
}, {
    timestamps: true
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
