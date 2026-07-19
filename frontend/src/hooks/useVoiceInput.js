import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported] = useState(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [error, setError] = useState(() => {
    return (window.SpeechRecognition || window.webkitSpeechRecognition) 
      ? null 
      : "Your browser doesn't support speech recognition. Please type your issue instead.";
  });
  
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // We mostly care about final transcript, but interim gives good feedback
        setTranscript(prev => prev + finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''));
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access.');
        } else if (event.error !== 'no-speech') {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        // Automatically restart if we're supposed to be listening (handles short timeouts)
        if (isListeningRef.current) {
          try {
             recognition.start();
          } catch (error) {
             console.warn('Speech recognition restart failed:', error);
             setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        // Prevent auto-restart on unmount
        recognitionRef.current.onend = null; 
        recognitionRef.current.stop();
      }
    };
  }, []); // Run once on mount

  // Event-driven start/stop instead of effect-driven (React 19 best practice)

  const toggleListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError("Your browser doesn't support speech recognition.");
      return;
    }
    setError(null);
    
    setIsListening(prev => {
      const nextState = !prev;
      try {
        if (nextState) {
          recognitionRef.current.start();
        } else {
          recognitionRef.current.stop();
        }
      } catch (error) {
        console.warn('Speech recognition toggle failed:', error);
        return false;
      }
      return nextState;
    });
  }, [isSupported]);
  
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);
  
  const setTranscriptValue = useCallback((val) => {
    setTranscript(val);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    toggleListening,
    resetTranscript,
    setTranscriptValue,
  };
};
