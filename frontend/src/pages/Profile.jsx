import React, { useState } from 'react';
import { User, Mail, Shield, Save, CheckCircle2 } from 'lucide-react';
import Button from '../components/UI/Button';
import { useAppContext } from '../context/AppContext';

const Profile = () => {
  const { user, setUser } = useAppContext();
  
  // Local state for editing
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    
    // Update context user (in a real app, this would be an API call)
    const updatedUser = { ...user, name, email };
    setUser(updatedUser);
    localStorage.setItem('ai_repair_user', JSON.stringify(updatedUser));
    
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <User className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-slate-400">Manage your account preferences</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {saved && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-700/50 my-6" />

          {/* Read-only info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Account Security
            </h3>
            <p className="text-sm text-slate-400">
              Password and security settings are managed via your authentication provider.
            </p>
            <Button variant="outline" type="button" disabled={!isEditing} className="px-4 py-2 text-sm">
              Change Password
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    setName(user?.name || '');
                    setEmail(user?.email || '');
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" icon={Save}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
