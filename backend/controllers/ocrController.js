const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs/promises');
const geminiService = require('../services/geminiService');

let worker = null;

// Initialize OCR worker (Tesseract Fallback)
const initWorker = async () => {
  if (!worker) {
    console.log('🔧 Initializing Tesseract worker...');
    worker = createWorker();
    console.log('✅ Tesseract worker ready');
  }
  return worker;
};

// Preprocess image to improve Tesseract OCR
const preprocessImage = async (inputPath) => {
  try {
    const outputPath = inputPath.replace(/\.(jpg|jpeg|png|webp)$/i, '_ocr.png');

    await sharp(inputPath)
      .resize({ width: 1800, withoutEnlargement: true })
      .grayscale()
      .sharpen()
      .linear(1.2, 0)
      .toFile(outputPath);

    return outputPath;
  } catch (err) {
    console.error('⚠️ Sharp preprocessing failed:', err.message);
    return inputPath;
  }
};

// Extract text using Tesseract (Fallback)
const extractTextFromImage = async (imagePath) => {
  const processedPath = await preprocessImage(imagePath);
  const ocrWorker = await initWorker();

  try {
    const { data: { text } } = await ocrWorker.recognize(processedPath, {
      lang: 'eng',
      tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789₹.,- ',
      tessedit_pageseg_mode: 6,
    });

    return text.trim();
  } finally {
    if (processedPath !== imagePath) {
      await fs.unlink(processedPath).catch(() => {});
    }
  }
};

// Parse receipt text (Rule-based Fallback)
const parseReceiptDataMock = (text) => {
  const lower = text.toLowerCase();
  const amountRegexes = [
    /total\s*[:\-]?\s*₹?\s*([\d.,]+)/i,
    /amount\s*[:\-]?\s*₹?\s*([\d.,]+)/i,
    /₹\s*([\d.,]+)/,
  ];

  let amount = null;
  for (const regex of amountRegexes) {
    const match = text.match(regex);
    if (match) {
      amount = parseFloat(match[1].replace(/,/g, ''));
      break;
    }
  }

  const categories = {
    Food: ['hotel', 'restaurant', 'cafe', 'food', 'pizza', 'burger'],
    Transport: ['uber', 'ola', 'fuel', 'petrol', 'diesel', 'metro'],
    Shopping: ['store', 'mall', 'shop', 'mart'],
    Bills: ['electricity', 'water', 'wifi', 'mobile'],
    Health: ['pharmacy', 'hospital', 'clinic'],
  };

  let category = 'Other';
  for (const [key, words] of Object.entries(categories)) {
    if (words.some((w) => lower.includes(w))) {
      category = key;
      break;
    }
  }

  const lines = text.split('\n').filter((l) => l.trim().length > 3);
  let merchant = lines[0]
    ? lines[0].replace(/[^a-zA-Z0-9 ]/g, '')
        .trim()
    : 'Unknown Merchant';

  return {
    merchant,
    amount,
    category,
    title: merchant
  };
};

// Controller to process receipt upload
const processReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    console.log('📸 Processing Receipt:', req.file.filename);
    
    let resultData = null;
    let method = 'ai';

    // 1. Try Gemini AI first
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const buffer = await fs.readFile(req.file.path);
        const geminiResult = await geminiService.parseReceipt(buffer, req.file.mimetype);
        
        resultData = {
          ...geminiResult,
          title: geminiResult.merchant || 'New Expense',
          rawText: 'AI Parsed'
        };
      } catch (err) {
        console.error('⚠️ Gemini OCR failed, falling back to Tesseract:', err.message);
      }
    }

    // 2. Fallback to Tesseract + Heuristics
    if (!resultData) {
      method = 'tesseract';
      const text = await extractTextFromImage(req.file.path);
      const parsed = parseReceiptDataMock(text);
      
      resultData = {
        ...parsed,
        rawText: text,
        confidence: 70,
        items: []
      };
    }

    // Cleanup uploaded file
    await fs.unlink(req.file.path).catch(() => {});

    res.json({
      success: true,
      data: {
        ...resultData,
        method,
        date: resultData.date || new Date().toISOString().split('T')[0],
      },
    });
  } catch (err) {
    console.error('❌ OCR ERROR:', err);
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ success: false, error: err.message || 'OCR processing failed' });
  }
};

module.exports = { processReceipt };
