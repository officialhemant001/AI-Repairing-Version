import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Camera, User, LogOut, Home, LayoutDashboard } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { APP_NAME } from '../../utils/constants';

const Navbar = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg bg-slate-900/80 border-b border-slate-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors hidden sm:block">
              {APP_NAME}
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link 
              to="/" 
              className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${isActive('/') ? 'text-blue-400 bg-blue-400/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
              title="Home"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:block text-sm font-medium">Home</span>
            </Link>

            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${isActive('/dashboard') ? 'text-blue-400 bg-blue-400/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                  title="Dashboard"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">Dashboard</span>
                </Link>
                <Link 
                  to="/profile" 
                  className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${isActive('/profile') ? 'text-blue-400 bg-blue-400/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">Profile</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg flex items-center gap-2 text-slate-300 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link 
                  to="/login" 
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
