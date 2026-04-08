const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const analyzePackaging = async (imagePath, medicineData) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ]
  }); 

  const prompt = `
    You are a pharmaceutical packaging expert. Analyze this medicine packaging image.
    Known authentic features for ${medicineData.name}:
    - Color: ${medicineData.physicalFeatures?.color || 'Unknown'}
    - Shape: ${medicineData.physicalFeatures?.shape || 'Unknown'}
    - Hologram expected: ${medicineData.packagingFeatures?.hologramPresent ? 'Yes' : 'No'}
    - Barcode expected: ${medicineData.packagingFeatures?.barcodePresent ? 'Yes' : 'No'}
    
    Compare the image with these features. Look for:
    1. Font inconsistencies (fake labels often use wrong fonts).
    2. Color mismatches.
    3. Missing security features (holograms, seals).
    4. Spelling errors.
    5. Overall packaging quality.

    Return a JSON object with:
    {
      "isSuspicious": boolean,
      "confidenceScore": number (0-100),
      "findings": [string],
      "recommendation": string
    }
  `;

  const imageBuffer = fs.readFileSync(imagePath);
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    }
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    
    // Check for safety reason blockage
    if (response.promptFeedback?.blockReason) {
      console.warn(`Gemini Request Blocked: ${response.promptFeedback.blockReason}`);
      return { 
        isSuspicious: true, 
        findings: [`Analysis could not be completed by AI: ${response.promptFeedback.blockReason}`],
        recommendation: "Please consult a healthcare professional as the AI safety filters blocked this image."
      };
    }

    const text = response.text();
    
    // Extract JSON from text (sometimes Gemini wraps it in code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Failed to parse AI response' };
  } catch (error) {
    if (error.message?.includes('fetch failed')) {
      console.error('Gemini API Error: Network/Connectivity issue. Check your internet connection.');
    } else {
      console.error('Gemini API Error:', error);
    }
    throw new Error(error.message || 'AI Analysis failed');
  }
};

module.exports = { analyzePackaging };
