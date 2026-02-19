const asyncHandler = require('express-async-handler');
const ChatMessage = require('../models/ChatMessage');
const StudentProfile = require('../models/StudentProfile');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Upload document via Chatbot
// @route   POST /api/chat/upload
// @access  Private (Student)
const uploadChatDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const userId = req.user._id;
    const filePath = `/uploads/${req.file.filename}`;
    const absolutePath = path.join(__dirname, '..', filePath);

    // 1. Save User Message
    await ChatMessage.create({
        userId,
        sender: 'student',
        message: req.file.originalname,
        attachment: filePath
    });

    try {
        // 2. Read file for Gemini
        const fileData = fs.readFileSync(absolutePath);
        const imagePart = {
            inlineData: {
                data: fileData.toString('base64'),
                mimeType: req.file.mimetype,
            },
        };

        // 3. Call Gemini Vision with Fallback
        const modelsToTry = ["gemini-3-flash-preview"];
        let text = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying Gemini model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const prompt = `You are an AI Academic Document Classification System.

Analyze the uploaded document and determine its document type.

Do NOT extract detailed data.
Do NOT summarize.
Only classify.

Possible types:
- 10th Marksheet
- 12th Marksheet
- Diploma Marksheet
- Aadhaar Card
- PAN Card
- Transfer Certificate
- Caste Certificate
- Income Certificate
- Migration Certificate
- Passport Photo
- Signature
- Other

Return strictly valid JSON:

{
  "document_type": "string",
  "confidence": number (0-100)
}`;

                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                text = response.text();

                if (text) break; // Success
            } catch (error) {
                console.warn(`Model ${modelName} failed:`, error.message);
                lastError = error;
                // Continue to next model
            }
        }

        if (!text) {
            throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
        }

        // Process the text result
        let classification;
        try {
            // Clean markdown code blocks if present
            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            classification = JSON.parse(jsonString);
        } catch (e) {
            console.error("Gemini JSON Parse Error:", text);
            classification = { document_type: "Other", confidence: 0 };
        }

        const { document_type, confidence } = classification;
        let botMessage = "";
        let mapped = false;

        // 4. Logic based on confidence
        if (confidence >= 70 && document_type !== 'Other') {
            const profile = await StudentProfile.findOne({ userId });

            if (profile) {
                // Check if doc exists
                const existingIndex = profile.documents.findIndex(
                    d => d.type === document_type && ['pending', 'uploaded'].includes(d.status)
                );

                if (existingIndex !== -1) {
                    // Update existing
                    // Delete old file from disk
                    const oldFilePath = path.join(__dirname, '..', profile.documents[existingIndex].fileUrl);
                    if (fs.existsSync(oldFilePath)) {
                        try { fs.unlinkSync(oldFilePath); } catch (e) { }
                    }
                    profile.documents[existingIndex].fileUrl = filePath;
                    profile.documents[existingIndex].originalName = req.file.originalname;
                    profile.documents[existingIndex].status = 'uploaded';
                } else {
                    // Add new
                    profile.documents.push({
                        type: document_type,
                        fileUrl: filePath,
                        originalName: req.file.originalname,
                        status: 'uploaded'
                    });
                }
                await profile.save();
                mapped = true;
                botMessage = `📄 Document detected as **${document_type}** (${confidence}% confidence). Uploaded successfully.`;
            } else {
                botMessage = "⚠️ Profile not found. Cannot link document.";
            }
        } else {
            botMessage = `⚠️ We are not confident about this document (Detected: ${document_type}, Confidence: ${confidence}%). Please upload again or confirm document type manually in the Documents module.`;
        }

        // 5. Save Bot Response
        await ChatMessage.create({
            userId,
            sender: 'aria',
            message: botMessage
        });

        res.json({
            message: botMessage,
            classification,
            fileUrl: filePath,
            mapped
        });

    } catch (error) {
        console.error("Gemini Error:", error);

        // Error Response
        const errorMsg = "Sorry, I encountered an error processing your document.";
        await ChatMessage.create({
            userId,
            sender: 'aria',
            message: errorMsg
        });

        res.status(500).json({ message: errorMsg, error: error.message });
    }
});

// @desc    Get chat history
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = asyncHandler(async (req, res) => {
    const messages = await ChatMessage.find({ userId: req.user._id }).sort({ createdAt: 1 });
    res.json(messages);
});

const sendChatText = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
        res.status(400);
        throw new Error('Message is required');
    }

    // Save User Message
    await ChatMessage.create({
        userId,
        sender: 'student',
        message
    });

    // Simple AI Logic (Rule-based for now, can be Gemini text later)
    let botResponse = "I'm not sure about that. Try asking about 'fee', 'documents', 'hostel', 'timetable', or 'subjects'.";
    const lowerInput = message.toLowerCase();

    // Use a subset of the previous frontend logic, but simpler or more robust
    if (lowerInput.includes('fee') || lowerInput.includes('payment')) {
        const profile = await StudentProfile.findOne({ userId });
        const total = profile?.fee?.amount || 50000; // Using amount from schema
        const paid = profile?.fee?.status === 'paid' ? total : 0;
        const remaining = total - paid;
        if (remaining <= 0) {
            botResponse = `Great news! Your tuition fees are fully paid. (Total: ₹${total.toLocaleString()})`;
        } else {
            botResponse = `You have paid ₹${paid.toLocaleString()}. The remaining balance is ₹${remaining.toLocaleString()}.`;
        }
    } else if (lowerInput.includes('document')) {
        const profile = await StudentProfile.findOne({ userId });
        const pendingDocs = profile?.documents?.filter(d => d.status !== 'approved' && d.status !== 'submitted').map(d => d.type).join(', ');
        if (pendingDocs) {
            botResponse = `You still need to upload/submit: ${pendingDocs}.`;
        } else {
            botResponse = `All your documents are submitted or approved!`;
        }
    } else if (lowerInput.includes('hostel')) {
        const profile = await StudentProfile.findOne({ userId });
        const status = profile?.hostel?.status || 'not_applied';
        botResponse = status === 'approved' ? 'Your hostel room is allocated!' : 'You can apply for hostel in the Dashboard.';
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        botResponse = "Hello! How can I help you complete your registration today?";
    }

    // Save Bot Response
    const botMsg = await ChatMessage.create({
        userId,
        sender: 'aria',
        message: botResponse
    });

    res.json(botMsg);
});


module.exports = { uploadChatDocument, getChatHistory, sendChatText };
