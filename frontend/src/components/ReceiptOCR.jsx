import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from '../api/axios';

const ReceiptOCR = ({ onReceiptProcessed }) => {
  const { i18n } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    setError('');
    setSelectedFile(file);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('receipt', selectedFile);
      formData.append('lang', i18n.language);

      // POST to OCR route
      const response = await axios.post('/ocr/scan', formData);

      if (response.data.success) {
        setResult(response.data.data);

        if (onReceiptProcessed) {
          onReceiptProcessed({
            title: response.data.data.title,
            amount: response.data.data.amount,
            category: response.data.data.category,
            description: response.data.data.merchant || '',
            date: response.data.data.date,
            tags: ['receipt', 'ocr']
          });
        }
      }
    } catch (err) {
      console.error('OCR upload error:', err);
      setError(err.response?.data?.error || 'Failed to process receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!preview && (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={{ scale: 1.01 }}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500 bg-white/50 dark:bg-gray-800/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="space-y-3">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                Upload Receipt or Bill
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Supported formats: JPEG, PNG, WebP (Max 5MB)
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preview & Upload */}
      {preview && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <img src={preview} alt="Receipt preview" className="w-full h-auto max-h-96 object-contain rounded-lg" />
            {!loading && !result && (
              <button
                onClick={handleReset}
                className="absolute top-6 right-6 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {!result && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? 'Processing Receipt...' : 'Scan Receipt'}
            </button>
          )}
        </motion.div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* OCR Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
              Receipt Scanned Successfully
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Amount</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">₹{result.amount || '0'}</div>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Category</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{result.category}</div>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Merchant</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{result.merchant || result.title}</div>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-100">{result.confidence}%</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Scan Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceiptOCR;
