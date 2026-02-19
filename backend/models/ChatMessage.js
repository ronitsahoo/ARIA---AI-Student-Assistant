const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: String, enum: ['student', 'aria'], required: true },
    message: { type: String, required: true },
    attachment: { type: String }, // Path to the uploaded file
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
