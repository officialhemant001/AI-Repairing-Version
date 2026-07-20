import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import Button from '../components/UI/Button';
import ErrorMessage from '../components/UI/ErrorMessage';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { addToast } = useAppContext();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      addToast('Password reset link sent to your email!', 'success');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative overflow-hidden">
      {/* Animated background highlights */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Back Link */}
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Log In
        </Link>

        {/* Card */}
        <div className="glass-panel bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {!submitted ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Forgot Password</h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>

              {error && <ErrorMessage message={error} />}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="block w-full pl-11 pr-4 py-3 border border-slate-600 rounded-2xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-3.5 shadow-blue-500/10 font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                  {!isLoading && <Send className="w-4 h-4 ml-2" />}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                If an account exists for <span className="text-slate-200 font-semibold">{email}</span>, we have sent instructions on how to reset your password.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full py-3.5"
              >
                Return to Login
              </Button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
