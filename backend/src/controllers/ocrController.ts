import { Request, Response } from 'express';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

export const processReceipt = async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.warn("GOOGLE_API_KEY not found. Falling back to mock data.");
      return res.json({
        success: true,
        data: {
          merchant: 'Organic Market (Mock)',
          amount: 84.50,
          date: new Date().toISOString(),
          category: 'Food',
          confidence: 0.95
        }
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze this receipt image and extract the following details in JSON format:
      - merchant (string)
      - amount (number)
      - date (ISO string if possible)
      - category (string, choice of: Shop, Food, Travel, Bills, Others)
      
      Return ONLY the JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from potential markdown backticks
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const extractedData = JSON.parse(cleanJson);

    res.json({
      success: true,
      data: {
        ...extractedData,
        confidence: 0.99
      }
    });
  } catch (error: any) {
    console.error("Gemini OCR Error:", error);
    res.status(500).json({ error: "Failed to process receipt with AI. " + error.message });
  }
};
