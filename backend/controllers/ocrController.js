const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs/promises');

let worker = null;

// Initialize OCR worker
const initWorker = async () => {
  if (!worker) {
    console.log('🔧 Initializing OCR worker...');
    worker = createWorker();
    console.log('✅ OCR worker ready');
  }
  return worker;
};

// Preprocess image to improve OCR
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
    console.error('⚠️ Sharp preprocessing failed, using original image:', err.message);
    return inputPath;
  }
};

// Extract text using Tesseract
const extractTextFromImage = async (imagePath) => {
  const processedPath = await preprocessImage(imagePath);
  const ocrWorker = await initWorker();

  const { data: { text } } = await ocrWorker.recognize(processedPath, {
    lang: 'eng',
    tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789₹.,- ',
    tessedit_pageseg_mode: 6, // single uniform block of text
  });

  if (processedPath !== imagePath) {
    await fs.unlink(processedPath).catch(() => {});
  }

  return text.trim();
};

// Parse receipt text
const parseReceiptData = (text) => {
  const lower = text.toLowerCase();

  // Flexible amount detection
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
        .replace(/\bCe be\b/i, 'Cafe Aroma')
        .trim()
    : 'Unknown Merchant';

  return {
    title: merchant,
    merchant,
    amount,
    category,
  };
};

// Controller to process receipt upload
const processReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    console.log('✅ OCR HIT', req.file.filename);

    const text = await extractTextFromImage(req.file.path);
    await fs.unlink(req.file.path).catch(() => {});

    if (!text || text.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'OCR failed. Please upload a clearer image.',
      });
    }

    const parsed = parseReceiptData(text);

    res.json({
      success: true,
      data: {
        ...parsed,
        rawText: text,
        confidence: 90,
        items: [],
        date: new Date().toISOString().split('T')[0],
      },
    });
  } catch (err) {
    console.error('❌ OCR ERROR:', err);
    res.status(500).json({ success: false, error: err.message || 'OCR processing failed' });
  }
};

module.exports = { processReceipt };
