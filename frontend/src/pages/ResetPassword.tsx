import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import Button from '../components/UI/Button';
import ErrorMessage from '../components/UI/ErrorMessage';
import { authService } from '../services/authService';
import { useAppContext } from '../context/AppContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useAppContext();
  
  const token = searchParams.get('token') || '';
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. A token is required to reset your password.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Cannot reset password without a valid reset token.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      addToast('Password reset successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative overflow-hidden">
      {/* Background decorations */}
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
          
          {!success ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Reset Password</h2>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                  Enter your new password below. Make sure it is secure.
                </p>
              </div>

              {error && <ErrorMessage message={error} />}

              {!token ? (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 text-sm">
                  <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span>The reset link is missing its authorization token. Please request a new link.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        id="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="block w-full pl-11 pr-4 py-3 border border-slate-600 rounded-2xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <KeyRound className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="block w-full pl-11 pr-4 py-3 border border-slate-600 rounded-2xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-3.5 shadow-blue-500/10 font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting Password...' : 'Save New Password'}
                  </Button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Password Updated</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Your password has been successfully updated. You can now use your new password to log in.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full py-3.5"
              >
                Go to Login
              </Button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
