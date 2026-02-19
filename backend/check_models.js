const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-latest',
        'gemini-pro',
        'gemini-1.0-pro',
        'gemini-2.0-flash-exp',
        'gemini-3-flash-preview',
        'gemini-1.5-pro'
    ];

    for (const modelName of models) {
        try {
            console.log(`Testing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you there?");
            console.log(`✅ ${modelName} is WORKING!`);
            // If one works, we can stop or keep going to see all options. Let's keep going.
        } catch (error) {
            console.log(`❌ ${modelName} failed: ${error.message.split('\n')[0]}`);
        }
    }
}

listModels();
