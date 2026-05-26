import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Bot, User, Loader2, Sparkles, Mic, FileText } from 'lucide-react';
import { scanService } from '../services/scanService';
import { useAppContext } from '../context/AppContext';
import { useVoiceInput } from '../hooks/useVoiceInput';
import ErrorMessage from '../components/UI/ErrorMessage';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, addToast } = useAppContext();
  
  // Extract context passed from Scan Result (if any)
  const scanId = location.state?.scanId || null;
  const applianceCategory = location.state?.applianceCategory || 'general';

  const [messages, setMessages] = useState(() => {
    if (!location.state?.initialPrompt) {
      return [{
        role: 'model',
        content: "Hello! I'm your AI Repair Assistant. How can I help you fix your appliance today?",
        id: 'welcome-msg'
      }];
    }
    return [];
  });
  const [inputValue, setInputValue] = useState(() => location.state?.initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isListening, transcript, toggleListening, error: voiceError, isSupported, setTranscriptValue, resetTranscript } = useVoiceInput();

  const [prevTranscript, setPrevTranscript] = useState(transcript);
  
  // Sync voice transcript to input value using direct render logic (React 19 best practice)
  if (isListening && transcript !== prevTranscript) {
    setPrevTranscript(transcript);
    setInputValue(transcript);
  }
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    if (isListening) toggleListening();

    const userMsg = { role: 'user', content: inputValue.trim(), id: Date.now().toString() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInputValue('');
    resetTranscript();
    setTranscriptValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Filter out IDs and just send role/content to backend
      const apiMessages = newMessages.filter(m => m.id !== 'welcome-msg').map(m => ({
        role: m.role,
        content: m.content
      }));

      const data = await scanService.sendChatMessage(apiMessages, scanId, applianceCategory);
      
      setMessages(prev => [...prev, {
        role: 'model',
        content: data.reply,
        id: (Date.now() + 1).toString()
      }]);
      
      if (!user && newMessages.length === 3) {
         addToast('Sign in to save this conversation history!', 'info');
      }

    } catch (err) {
      setError(err.message || "Failed to send message.");
      // Remove the optimistic user message on failure so they can try again
      setMessages(prev => prev.slice(0, -1));
      setInputValue(userMsg.content);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestionClick = (text) => {
    setInputValue(text);
    inputRef.current?.focus();
  };

  const SUGGESTIONS = [
    "Is it safe to fix this myself?",
    "What tools do I need?",
    "How much will this cost to repair?",
    "Where is the reset button usually located?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-900 relative">
      
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-400" />
              AI Repair Assistant
            </h1>
            {scanId && (
              <p className="text-xs text-slate-400">Context linked to your last scan</p>
            )}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {(error || voiceError) && (
        <div className="absolute top-16 left-0 right-0 z-20 px-4 mt-2">
           <ErrorMessage message={error || voiceError} />
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                  : 'bg-blue-500 text-white shadow-blue-500/30'
              }`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-blue-500 text-white shadow-blue-500/30 shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="px-5 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-slate-400 text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="shrink-0 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/50 p-4 pb-6 sm:pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        
        {/* Suggestions */}
        {messages.length <= 1 && !inputValue && (
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(s)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
                {s}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
          <div className="relative flex-1 flex items-end bg-slate-900 border border-slate-600 rounded-2xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden">
            {isSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 transition-colors shrink-0 ${isListening ? 'text-red-400 animate-pulse bg-red-500/10' : 'text-slate-400 hover:text-white'}`}
                title="Voice Input"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
            {!isSupported && (
               <div className="p-3 text-slate-500 shrink-0"><FileText className="w-5 h-5" /></div>
            )}
            
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                 setInputValue(e.target.value);
                 if (isListening) toggleListening(); // stop listening if they type manually
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={isListening ? "Listening..." : "Ask follow-up questions..."}
              className="w-full max-h-32 min-h-[52px] py-3.5 px-2 bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none"
              rows={1}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3.5 h-[52px] w-[52px] rounded-2xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shrink-0 shadow-lg shadow-blue-500/30 active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </footer>
    </div>
  );
};

export default Chat;
