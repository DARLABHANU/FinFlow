"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processReceipt = void 0;
// Mock OCR processing logic
const processReceipt = async (req, res) => {
    try {
        // In a real app, use Tesseract.js or Cloud Vision API
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: 'No image data provided' });
        }
        // Simulate AI delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        res.json({
            success: true,
            data: {
                merchant: 'Organic Market',
                amount: 84.50,
                date: new Date().toISOString(),
                category: 'Food',
                confidence: 0.98
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.processReceipt = processReceipt;
