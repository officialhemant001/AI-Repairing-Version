import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Cpu, Plus, Sparkles, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import ErrorMessage from '../components/UI/ErrorMessage';
import { useAppContext } from '../context/AppContext';
import { scanService } from '../services/scanService';
import { ChatMessage, ChatSession } from '../types/chat';

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, addToast } = useAppContext();
  
  // Passed state from result page
  const routeState = location.state as { scanId?: number; applianceCategory?: string; initialPrompt?: string } | null;
  const initialScanId = routeState?.scanId || null;
  const initialCategory = routeState?.applianceCategory || '';
  const initialPrompt = routeState?.initialPrompt || '';

  // Core Chat State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // RAG / Scan link state
  const [linkedScanId, setLinkedScanId] = useState<number | null>(initialScanId);
  const [linkedCategory, setLinkedCategory] = useState<string>(initialCategory);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions on component mount
  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;
      try {
        const data = await scanService.getChatSessions();
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
          // Open latest session
          setActiveSessionId(data[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load chat sessions:', err);
      }
    };

    loadSessions();
  }, [user]);

  // Load messages when active session changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeSessionId || !user) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await scanService.getChatSessionDetail(activeSessionId);
        setMessages(data.messages);
        if (data.scan) {
          setLinkedScanId(data.scan);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load messages.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [activeSessionId, user]);

  // Handle guest initial state or direct prompts
  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      setInputValue(initialPrompt);
    }
  }, [initialPrompt]);

  const handleCreateSession = () => {
    setMessages([]);
    setActiveSessionId(null);
    setLinkedScanId(null);
    setLinkedCategory('');
    setInputValue('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    setInputValue('');

    const newMsg: ChatMessage = { role: 'user', content: userText };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);

    setIsLoading(true);
    setError(null);

    try {
      const response = await scanService.sendChatMessage(
        updatedMessages.map(m => ({ role: m.role, content: m.content })),
        linkedScanId,
        activeSessionId,
        linkedCategory
      );

      const assistantMsg: ChatMessage = { role: 'assistant', content: response.reply };
      setMessages([...updatedMessages, assistantMsg]);

      // If a new session was created dynamically by the backend, refresh session list
      if (response.session_id && response.session_id !== activeSessionId) {
        setActiveSessionId(response.session_id);
        if (user) {
          const updatedSessions = await scanService.getChatSessions();
          setSessions(updatedSessions);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] max-w-7xl mx-auto border-t border-slate-700/30">
      
      {/* Sessions Sidebar — Only show for authenticated users */}
      {user && (
        <aside className="w-64 border-r border-slate-700/50 bg-slate-900/40 p-4 hidden md:flex flex-col gap-4">
          <button 
            onClick={handleCreateSession}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer border-0"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Recent Chats</h3>
            {sessions.map((sess) => (
              <button
                key={sess.id}
                onClick={() => setActiveSessionId(sess.id)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-2 group cursor-pointer border-0 ${
                  activeSessionId === sess.id 
                    ? 'bg-slate-800 text-white border border-slate-700' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                <span className="truncate text-sm font-semibold">{sess.title}</span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col bg-slate-900/20">
        
        {/* Chat Header */}
        <header className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/20">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-300 transition-colors md:hidden bg-transparent border-0 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-blue-500" />
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">AI Repair Expert</h2>
                {linkedCategory && (
                  <p className="text-xs text-slate-400 capitalize">Linked: {linkedCategory.replace('_', ' ')}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Message Panel */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Welcome prompt if empty */}
          {messages.length === 0 && (
            <div className="text-center py-20 max-w-md mx-auto space-y-6 animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/30 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">How can I help you fix it?</h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed font-medium">
                  Ask step-by-step repair guides, part suggestions, voltage safety rules, or troubleshooting steps for your electronics.
                </p>
              </div>
            </div>
          )}

          {/* Messages list */}
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div 
                  key={index}
                  className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300`}
                >
                  <div className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm leading-relaxed font-medium ${
                    isAssistant 
                      ? 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none' 
                      : 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-300 border border-slate-700/50 rounded-3xl rounded-tl-none px-5 py-3 text-sm flex items-center gap-3">
                  <div className="flex space-x-1.5 items-center h-4">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></span>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></span>
                  </div>
                  <span>Expert is typing...</span>
                </div>
              </div>
            )}

            {error && <ErrorMessage message={error} />}
            <div ref={messagesEndRef} />
          </div>

        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/10">
          <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question about your device..."
              className="flex-1 px-4 py-3 border border-slate-600 rounded-2xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </main>

    </div>
  );
};

export default Chat;
