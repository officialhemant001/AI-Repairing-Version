import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, CheckCircle2, History as HistoryIcon, Camera } from 'lucide-react';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import ErrorMessage from '../components/UI/ErrorMessage';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import { scanService } from '../services/scanService';

const Profile = () => {
  const { user, setUser, addToast } = useAppContext();
  
  // Local state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stats
  const [totalScans, setTotalScans] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch fresh profile data
        const profileData = await authService.getProfile();
        setName(profileData.name || '');
        setEmail(profileData.email || '');
        
        // Fetch scan count implicitly through history length for now
        const historyData = await scanService.getHistory();
        setTotalScans(historyData.results?.length || historyData.length || 0);
        
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setError("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Send patch request. We split name back into first/last in backend, 
      // but if the profile endpoint doesn't accept 'name', we manually split it here
      const nameParts = name.trim().split(' ');
      const updateData = {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' ')
      };
      
      const updatedProfile = await authService.updateProfile(updateData);
      
      // Update local storage and context
      const updatedUser = { ...user, name: updatedProfile.name };
      setUser(updatedUser);
      localStorage.setItem('ai_repair_user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
      
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !name) {
    return <div className="py-20"><Loader message="Loading profile..." /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-slate-400">Manage your account preferences</p>
        </div>
      </div>
      
      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Stats overview */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 shadow-xl">
             <div className="w-20 h-20 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-slate-300">
                {name ? name.charAt(0).toUpperCase() : 'U'}
             </div>
             <h2 className="text-xl font-bold text-center text-white truncate">{name}</h2>
             <p className="text-sm text-center text-slate-400 truncate mb-6">{email}</p>
             
             <div className="border-t border-slate-700/50 pt-4 flex justify-between items-center">
               <div className="flex items-center gap-2 text-slate-300">
                 <Camera className="w-4 h-4 text-blue-400" /> Total Scans
               </div>
               <span className="font-bold text-white">{totalScans}</span>
             </div>
           </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2 bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <form onSubmit={handleSave} className="space-y-6 relative z-10">
            <h3 className="text-lg font-bold text-white mb-2">Personal Information</h3>
            <div className="space-y-4">
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
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Email Address (Cannot be changed)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    disabled={true}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 transition-all opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-700/50 my-6" />

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Account Security
              </h3>
              <p className="text-sm text-slate-400">
                Password and security settings are managed via your authentication provider.
              </p>
              <Button variant="outline" type="button" disabled={true} className="px-4 py-2 text-sm">
                Change Password (Coming Soon)
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
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" icon={Save} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
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
    </div>
  );
};

export default Profile;
