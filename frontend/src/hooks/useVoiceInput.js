import { useState, useRef, useCallback } from 'react';

const BrowserSpeechRecognition =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

/**
 * Wraps the browser's Web Speech API for voice-to-text feedback input.
 * Falls back gracefully (isSupported: false) on browsers without support
 * (e.g. Firefox) so the UI can hide/disable the mic button instead of crashing.
 */
export const useVoiceInput = (lang = 'en-US') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const isSupported = !!BrowserSpeechRecognition;

  const start = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser. Try Chrome or Edge.');
      return;
    }
    setError(null);
    setTranscript('');

    const recognition = new BrowserSpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(' ');
      setTranscript(text);
    };

    recognition.onerror = (event) => setError(event.error);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isSupported, lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, transcript, error, start, stop, setTranscript };
};
