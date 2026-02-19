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
    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('No files uploaded');
    }

    const userId = req.user._id;
    const results = [];
    let anyMapped = false;

    // Save a single user message listing all uploaded files
    const fileNames = req.files.map(f => f.originalname).join(', ');
    await ChatMessage.create({
        userId,
        sender: 'student',
        message: `Uploaded ${req.files.length} document(s): ${fileNames}`,
        attachment: `/uploads/${req.files[0].filename}` // show first file as attachment
    });

    const profile = await StudentProfile.findOne({ userId });

    for (const file of req.files) {
        const filePath = `/uploads/${file.filename}`;
        const absolutePath = path.join(__dirname, '..', filePath);

        try {
            // Read file for Gemini
            const fileData = fs.readFileSync(absolutePath);
            const imagePart = {
                inlineData: {
                    data: fileData.toString('base64'),
                    mimeType: file.mimetype,
                },
            };

            // Call Gemini Vision
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
            const text = response.text();

            let classification;
            try {
                const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
                classification = JSON.parse(jsonString);
            } catch (e) {
                console.error("Gemini JSON Parse Error:", text);
                classification = { document_type: "Other", confidence: 0 };
            }

            const { document_type, confidence } = classification;
            let status = 'failed';

            // Map to profile if confidence is high
            if (confidence >= 70 && document_type !== 'Other' && profile) {
                const existingIndex = profile.documents.findIndex(
                    d => d.type === document_type && ['pending', 'uploaded'].includes(d.status)
                );

                if (existingIndex !== -1) {
                    // Delete old file
                    const oldFilePath = path.join(__dirname, '..', profile.documents[existingIndex].fileUrl);
                    if (fs.existsSync(oldFilePath)) {
                        try { fs.unlinkSync(oldFilePath); } catch (e) { }
                    }
                    profile.documents[existingIndex].fileUrl = filePath;
                    profile.documents[existingIndex].originalName = file.originalname;
                    profile.documents[existingIndex].status = 'uploaded';
                } else {
                    profile.documents.push({
                        type: document_type,
                        fileUrl: filePath,
                        originalName: file.originalname,
                        status: 'uploaded'
                    });
                }
                status = 'mapped';
                anyMapped = true;
            }

            results.push({
                fileName: file.originalname,
                document_type,
                confidence,
                status,
                fileUrl: filePath
            });

        } catch (error) {
            console.error(`Gemini Error for ${file.originalname}:`, error.message);
            results.push({
                fileName: file.originalname,
                document_type: 'Error',
                confidence: 0,
                status: 'error',
                error: error.message
            });
        }
    }

    // Save profile once after all documents are processed
    if (profile && anyMapped) {
        await profile.save();
    }

    // Build summary bot message
    let botMessage = `📋 **Classification Results (${results.length} document${results.length > 1 ? 's' : ''}):**\n\n`;
    results.forEach((r, i) => {
        if (r.status === 'mapped') {
            botMessage += `✅ **${r.fileName}** → ${r.document_type} (${r.confidence}% confidence) — Uploaded!\n`;
        } else if (r.status === 'error') {
            botMessage += `❌ **${r.fileName}** → Error processing this file.\n`;
        } else {
            botMessage += `⚠️ **${r.fileName}** → ${r.document_type} (${r.confidence}%) — Low confidence, please upload manually.\n`;
        }
    });

    await ChatMessage.create({
        userId,
        sender: 'aria',
        message: botMessage
    });

    res.json({
        message: botMessage,
        results,
        mapped: anyMapped
    });
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

    let botResponse = "I'm not sure about that. Try asking about **fees**, **documents**, **hostel**, **timetable**, **subjects**, or **progress**.";
    const lowerInput = message.toLowerCase();

    // Fetch profile once for all queries
    const profile = await StudentProfile.findOne({ userId });

    if (lowerInput.includes('fee') || lowerInput.includes('payment') || lowerInput.includes('balance') || lowerInput.includes('money')) {
        if (!profile || !profile.fee) {
            botResponse = "⚠️ Your fee details haven't been set up yet. Please contact the admin.";
        } else {
            const total = profile.fee.amount || 0;
            const status = profile.fee.status;

            if (status === 'paid') {
                botResponse = `✅ **Fee Status: PAID**\n\n`;
                botResponse += `💰 Total Amount: ₹${total.toLocaleString()}\n`;
                botResponse += `🧾 Transaction ID: ${profile.fee.transactionId || 'N/A'}\n`;
                botResponse += `\nYour tuition fees are fully paid! No action needed.`;
            } else {
                botResponse = `⏳ **Fee Status: PENDING**\n\n`;
                botResponse += `💰 Total Amount: ₹${total.toLocaleString()}\n`;
                botResponse += `❌ Amount Due: ₹${total.toLocaleString()}\n`;
                botResponse += `\nPlease pay your fees through the **Fees** module on the dashboard.`;
            }
        }

    } else if (lowerInput.includes('document') || lowerInput.includes('upload') || lowerInput.includes('pending') || lowerInput.includes('reject')) {
        if (!profile || !profile.documents || profile.documents.length === 0) {
            botResponse = "📂 No documents found in your profile yet.\n\nYou can upload documents using the 📎 button below or through the **Documents** module.";
        } else {
            const docs = profile.documents;
            const approved = docs.filter(d => d.status === 'approved');
            const rejected = docs.filter(d => d.status === 'rejected');
            const uploaded = docs.filter(d => d.status === 'uploaded');
            const submitted = docs.filter(d => d.status === 'submitted');
            const pending = docs.filter(d => d.status === 'pending');

            // All expected document types
            const allExpected = [
                "10th Marksheet", "12th Marksheet", "Diploma Marksheet",
                "Aadhaar Card", "PAN Card", "Transfer Certificate",
                "Caste Certificate", "Income Certificate", "Migration Certificate",
                "Passport Photo", "Signature"
            ];
            const uploadedTypes = docs.map(d => d.type);
            const notUploaded = allExpected.filter(t => !uploadedTypes.includes(t));

            botResponse = `📋 **Document Status Overview** (${docs.length} uploaded)\n\n`;

            if (approved.length > 0) {
                botResponse += `✅ **Approved (${approved.length}):**\n`;
                approved.forEach(d => { botResponse += `   • ${d.type}\n`; });
                botResponse += `\n`;
            }

            if (submitted.length > 0) {
                botResponse += `📤 **Submitted - Awaiting Review (${submitted.length}):**\n`;
                submitted.forEach(d => { botResponse += `   • ${d.type}\n`; });
                botResponse += `\n`;
            }

            if (uploaded.length > 0) {
                botResponse += `📁 **Uploaded - Not Yet Submitted (${uploaded.length}):**\n`;
                uploaded.forEach(d => { botResponse += `   • ${d.type}\n`; });
                botResponse += `\n`;
            }

            if (pending.length > 0) {
                botResponse += `⏳ **Pending (${pending.length}):**\n`;
                pending.forEach(d => { botResponse += `   • ${d.type}\n`; });
                botResponse += `\n`;
            }

            if (rejected.length > 0) {
                botResponse += `❌ **Rejected (${rejected.length}):**\n`;
                rejected.forEach(d => {
                    botResponse += `   • ${d.type}`;
                    if (d.rejectionReason) {
                        botResponse += ` — Reason: "${d.rejectionReason}"`;
                    }
                    botResponse += `\n`;
                });
                botResponse += `\n`;
            }

            if (notUploaded.length > 0) {
                botResponse += `🔴 **Not Yet Uploaded (${notUploaded.length}):**\n`;
                notUploaded.forEach(t => { botResponse += `   • ${t}\n`; });
                botResponse += `\nUse the 📎 button to upload these documents.`;
            }

            if (notUploaded.length === 0 && rejected.length === 0 && pending.length === 0 && uploaded.length === 0) {
                botResponse += `\n🎉 All documents are submitted or approved! Great job!`;
            }
        }

    } else if (lowerInput.includes('hostel') || lowerInput.includes('room') || lowerInput.includes('accommodation')) {
        if (!profile || !profile.hostel) {
            botResponse = "🏠 You haven't applied for hostel yet. Apply through the **Hostel** module on the dashboard.";
        } else {
            const h = profile.hostel;
            const statusMap = {
                'not_applied': '🔴 Not Applied',
                'pending': '⏳ Pending Approval',
                'approved': '✅ Approved',
                'rejected': '❌ Rejected'
            };

            botResponse = `🏠 **Hostel Application Status**\n\n`;
            botResponse += `📌 Status: ${statusMap[h.status] || h.status}\n`;

            if (h.gender) botResponse += `👤 Gender Preference: ${h.gender}\n`;
            if (h.roomType) botResponse += `🛏️ Room Type: ${h.roomType.charAt(0).toUpperCase() + h.roomType.slice(1)}\n`;

            if (h.status === 'rejected' && h.rejectionReason) {
                botResponse += `\n❌ Rejection Reason: "${h.rejectionReason}"\n`;
                botResponse += `\nYou can re-apply through the Hostel module.`;
            } else if (h.status === 'not_applied') {
                botResponse += `\nApply now in the **Hostel** module on your dashboard!`;
            } else if (h.status === 'approved') {
                botResponse += `\n🎉 Congratulations! Your room has been allocated.`;
            } else if (h.status === 'pending') {
                botResponse += `\nYour application is being reviewed. Please wait for approval.`;
            }
        }

    } else if (lowerInput.includes('progress') || lowerInput.includes('status') || lowerInput.includes('overview')) {
        if (!profile) {
            botResponse = "⚠️ Profile not found. Please contact admin.";
        } else {
            const progress = profile.progressPercentage || 0;
            const feeStatus = profile.fee?.status === 'paid' ? '✅ Paid' : '❌ Pending';
            const docCount = profile.documents?.length || 0;
            const approvedDocs = profile.documents?.filter(d => d.status === 'approved').length || 0;
            const hostelStatus = profile.hostel?.status || 'not_applied';
            const hostelMap = { 'not_applied': '🔴 Not Applied', 'pending': '⏳ Pending', 'approved': '✅ Approved', 'rejected': '❌ Rejected' };
            const lms = profile.lmsActivated ? '✅ Activated' : '❌ Not Activated';

            botResponse = `📊 **Your Registration Progress: ${progress}%**\n\n`;
            botResponse += `📄 Documents: ${approvedDocs}/${docCount} approved\n`;
            botResponse += `💰 Fees: ${feeStatus}\n`;
            botResponse += `🏠 Hostel: ${hostelMap[hostelStatus] || hostelStatus}\n`;
            botResponse += `📚 LMS: ${lms}\n`;

            if (progress >= 100) {
                botResponse += `\n🎉 Registration complete! You're all set.`;
            } else {
                botResponse += `\nKeep going! Complete all steps to reach 100%.`;
            }
        }

    } else if (lowerInput.includes('subject') || lowerInput.includes('course') || lowerInput.includes('study')) {
        if (profile && profile.registeredSubjects && profile.registeredSubjects.length > 0) {
            botResponse = `📚 You have ${profile.registeredSubjects.length} registered subject(s). Check the **LMS** module for your full subject list and timetable.`;
        } else {
            botResponse = "📚 You haven't registered for any subjects yet. Check the **Course Registration** section in the dashboard.";
        }

    } else if (lowerInput.includes('timetable') || lowerInput.includes('schedule') || lowerInput.includes('class')) {
        botResponse = "📅 Your timetable is available in the **LMS** module under the **Timetable** tab. Make sure your fee is paid and subjects are registered to see it.";

    } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
        botResponse = "👋 Hello! I'm **ARIA**, your smart assistant.\n\nI can help you with:\n• 📄 **Documents** — status, uploads, rejections\n• 💰 **Fees** — payment status, balance\n• 🏠 **Hostel** — application status\n• 📊 **Progress** — overall registration progress\n• 📚 **Subjects** — registered courses\n• 📅 **Timetable** — class schedule\n\nWhat would you like to know?";

    } else if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
        botResponse = "🤖 I can help you with:\n\n• Type **\"documents\"** to see upload status & rejections\n• Type **\"fees\"** to check payment status\n• Type **\"hostel\"** to see hostel application status\n• Type **\"progress\"** for your overall registration overview\n• Type **\"subjects\"** to check registered courses\n• Use the 📎 button to upload documents for auto-classification!\n\nTry it now!";
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
