import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const VoiceInput = ({ onTranscript, language = 'en', placeholder = 'Click microphone to speak...' }) => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Language mapping for speech recognition (defined inside useEffect)
    const languageMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      mr: 'mr-IN'
    };
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      console.log('✅ Speech Recognition is supported');
      const recognition = new SpeechRecognition();
      
      // Get the appropriate language code
      const currentLang = language || i18n.language || 'en';
      const speechLang = languageMap[currentLang] || 'en-IN';
      
      console.log('🌐 Setting speech language to:', speechLang);
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        
        console.log('🎤 Speech result:', transcriptResult, 'isFinal:', event.results[current].isFinal);
        setTranscript(transcriptResult);
        
        // If it's a final result, send it to parent immediately
        if (event.results[current].isFinal) {
          console.log('✅ Final transcript:', transcriptResult);
          if (onTranscript && transcriptResult.trim()) {
            setTimeout(() => {
              onTranscript(transcriptResult);
              setTranscript('');
              setIsListening(false);
            }, 100);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript('');
        
        // Show user-friendly error messages
        if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          alert('Microphone access denied. Please enable it in browser settings.');
        } else if (event.error === 'network') {
          alert('Network error. Please check your connection.');
        }
      };

      recognition.onend = () => {
        console.log('🛑 Voice recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('⚠️ Speech recognition not supported in this browser');
      console.log('Browser:', navigator.userAgent);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [language, i18n.language, onTranscript]); // Removed languageMap from dependencies

  const toggleListening = () => {
    if (!isSupported) {
      alert('⚠️ Speech recognition is not supported in your browser.\n\nPlease use:\n• Chrome (recommended)\n• Edge\n• Safari\n\nFirefox does not support Web Speech API.');
      return;
    }

    if (isListening) {
      console.log('⏹️ Stopping recognition...');
      // If there's transcript, send it before stopping
      if (transcript && transcript.trim()) {
        console.log('📤 Sending current transcript:', transcript);
        onTranscript(transcript);
      }
      recognitionRef.current?.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      console.log('▶️ Starting recognition...');
      try {
        setTranscript('');
        recognitionRef.current?.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
        
        // Try to reset and start again
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (e) {
            alert('Could not start voice recognition. Please try again.');
          }
        }, 100);
      }
    }
  };

  // Always show the button to inform users
  return (
    <div className="relative">
      {/* Microphone Button */}
      <motion.button
        type="button"
        onClick={toggleListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`relative p-3 rounded-full transition-all duration-300 ${
          !isSupported
            ? 'bg-gray-400 text-white cursor-not-allowed opacity-50'
            : isListening
            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50'
            : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/50'
        }`}
        aria-label={isListening ? 'Stop and submit' : 'Start recording'}
        title={!isSupported ? 'Voice input not supported in this browser' : isListening ? 'Click to stop and submit' : 'Click to speak'}
      >
        {/* Pulsing animation when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-red-400"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-red-400"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Microphone Icon */}
        <svg
          className="w-5 h-5 relative z-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isListening ? (
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          )}
        </svg>
      </motion.button>

      {/* Transcript Preview */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 right-0 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-xl max-w-xs text-sm z-50"
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="flex gap-1"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="w-1 h-1 bg-red-400 rounded-full" />
                <div className="w-1 h-1 bg-red-400 rounded-full" />
                <div className="w-1 h-1 bg-red-400 rounded-full" />
              </motion.div>
              <span className="text-red-400 font-medium">Listening...</span>
            </div>
            <p className="mt-1 text-gray-300">{transcript}</p>
            <p className="mt-1 text-xs text-gray-400">Click mic again to send</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
