import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, User, LogOut, Home, LayoutDashboard, History, MessageSquare, Menu, X, Moon, Sun } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { APP_NAME } from '../../utils/constants';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on route change
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Moving NavLink outside is tricky because it depends on location.pathname for isActive, 
  // but we can pass `isActive` as a prop or just compute it inside.
  // Instead, to fix "Cannot create components during render", we just return the JSX directly
  // or define it as a separate component outside and pass `currentPath`.
  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-100 group-hover:text-blue-400 transition-colors">
              {APP_NAME}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm ${isActive("/") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><Home className="w-4 h-4" /><span className="hidden lg:block">Home</span></Link>
            <Link to="/scan" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm ${isActive("/scan") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><Camera className="w-4 h-4" /><span className="hidden lg:block">Scan</span></Link>
            <Link to="/chat" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm ${isActive("/chat") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><MessageSquare className="w-4 h-4" /><span className="hidden lg:block">AI Chat</span></Link>

            <div className="w-px h-6 bg-slate-700/50 mx-2"></div> {/* Divider */}

            {user ? (
              <>
                <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm ${isActive("/dashboard") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><LayoutDashboard className="w-4 h-4" /><span className="hidden lg:block">Dashboard</span></Link>
                <Link to="/history" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm ${isActive("/history") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><History className="w-4 h-4" /><span className="hidden lg:block">History</span></Link>
                <Link to="/profile" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium text-sm ${isActive("/profile") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><User className="w-4 h-4" /><span className="hidden lg:block">Profile</span></Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:block">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95">
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="ml-2 p-2 rounded-full text-slate-400 hover:bg-slate-800 transition-colors" title="Toggle theme">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={toggleTheme} className="text-slate-400">
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="p-2 -mr-2 text-slate-300 hover:text-white transition-colors"
             >
               {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-slate-900 border-b border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-6 flex flex-col gap-2">
            <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><Home className="w-5 h-5" />Home</Link>
            <Link to="/scan" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/scan") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><Camera className="w-5 h-5" />Scan & Diagnose</Link>
            <Link to="/chat" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/chat") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><MessageSquare className="w-5 h-5" />AI Chat Assistant</Link>
            
            <div className="h-px bg-slate-800 my-4 mx-2"></div>
            
            {user ? (
              <>
                <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/dashboard") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><LayoutDashboard className="w-5 h-5" />Dashboard</Link>
                <Link to="/history" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/history") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><History className="w-5 h-5" />Repair History</Link>
                <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive("/profile") ? "text-blue-500 bg-blue-500/10 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}><User className="w-5 h-5" />Profile Settings</Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Link to="/login" className="text-center font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl transition-colors">
                  Log in to your account
                </Link>
                <Link to="/register" className="text-center font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl shadow-md transition-all active:scale-95">
                  Create an account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
