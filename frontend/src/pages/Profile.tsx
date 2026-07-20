import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, Calendar, Save, Trash2, Camera, UserX } from 'lucide-react';
import Button from '../components/UI/Button';
import Loader from '../components/UI/Loader';
import ErrorMessage from '../components/UI/ErrorMessage';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';
import { User } from '../types/auth';

const Profile = () => {
  const { user, logout, addToast } = useAppContext();
  
  const [profile, setProfile] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Account Deletion
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await authService.getProfile();
        setProfile(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const updated = await authService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        bio: bio
      });
      setProfile(updated);
      addToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        addToast('Avatar image must be smaller than 5MB.', 'error');
        return;
      }
      setIsSaving(true);
      try {
        const updated = await authService.updateProfile({ avatar: file });
        setProfile(updated);
        addToast('Avatar updated successfully!', 'success');
      } catch (err: any) {
        addToast(err.message || 'Failed to upload avatar.', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authService.deleteAccount();
      addToast('Your account was permanently deleted.', 'info');
      logout();
    } catch (err: any) {
      addToast(err.message || 'Failed to delete account.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Loader message="Loading profile settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Profile Management</h1>
        <p className="text-slate-400 mt-1">Manage your account details and profile information.</p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Avatar & Stats */}
        <div className="glass-panel bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 flex flex-col items-center text-center shadow-xl h-fit">
          
          <div className="relative group mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-900 border-2 border-blue-500/30 flex items-center justify-center">
              {profile?.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-slate-500" />
              )}
            </div>
            
            {/* Upload overlay */}
            <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
                disabled={isSaving}
              />
            </label>
          </div>

          <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
          <p className="text-slate-400 text-sm mt-1">{profile?.email}</p>

          <div className="grid grid-cols-2 gap-4 w-full mt-8 pt-8 border-t border-slate-700/50">
            <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-700/30">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Scans</span>
              <span className="text-xl font-bold text-white">{profile?.scans_count || 0}</span>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-2xl border border-slate-700/30">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Reports</span>
              <span className="text-xl font-bold text-white">{profile?.reports_count || 0}</span>
            </div>
          </div>

          {profile?.date_joined && (
            <p className="text-[11px] text-slate-500 font-medium mt-6 flex items-center gap-1.5 justify-center">
              <Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile.date_joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </p>
          )}

        </div>

        {/* Right Card: Profile Form */}
        <div className="lg:col-span-2 glass-panel bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Personal Details</h3>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-600 rounded-2xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-600 rounded-2xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="block w-full pl-11 pr-4 py-3 border border-slate-600 rounded-2xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Bio / Professional Summary</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief bio or technician specialties..."
                rows={4}
                className="block w-full px-4 py-3 border border-slate-600 rounded-2xl bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all resize-none"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full sm:w-auto px-6 py-3.5 shadow-blue-500/10 font-bold"
              disabled={isSaving}
              icon={Save}
            >
              {isSaving ? 'Saving Changes...' : 'Save Settings'}
            </Button>
          </form>

          {/* Delete Account Section */}
          <div className="mt-12 pt-8 border-t border-red-500/10 text-left">
            <h4 className="text-md font-bold text-red-400">Danger Zone</h4>
            <p className="text-slate-400 text-sm mt-1 mb-4 leading-relaxed font-medium">
              Permanently delete your account, reports, history, and chat sessions. This action is irreversible.
            </p>
            
            {!showConfirmDelete ? (
              <button 
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl border border-red-600/20 font-semibold transition-all cursor-pointer text-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex gap-2 text-sm text-red-200">
                  <UserX className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="font-semibold">Are you absolutely sure? This will delete all your diagnostics data.</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold border-0 cursor-pointer"
                  >
                    Yes, Delete My Account
                  </button>
                  <button 
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold border-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
