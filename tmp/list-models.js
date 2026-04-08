const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const listModels = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // We use the REST-like check or the SDK version
        // Actually, the SDK has a listModels method in newer versions
        // Let's try to fetch them via the API directly if SDK doesn't expose it cleanly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log('Available Models:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error listing models:', error);
    }
};

listModels();
