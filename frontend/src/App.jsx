import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/UI/Navbar';
import ProtectedRoute from './components/UI/ProtectedRoute';
import Toast from './components/UI/Toast';

import Home from './pages/Home';
import Scan from './pages/Scan';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
// Imports for new pages we will create shortly
import Chat from './pages/Chat';
import History from './pages/History';
import ScanDetail from './pages/ScanDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import './index.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans transition-colors duration-300">
          <Navbar />
          <main className="pb-16 sm:pb-0"> {/* Padding for mobile bottom nav if we added one, otherwise safe padding */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/chat" element={<Chat />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/scan/:id" 
                element={
                  <ProtectedRoute>
                    <ScanDetail />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          
          {/* Global UI Overlays */}
          <Toast />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;