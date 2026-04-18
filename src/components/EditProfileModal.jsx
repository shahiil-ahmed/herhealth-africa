import { useState, useEffect } from 'react';
import { X, Save, User, Mail, Sparkles } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function EditProfileModal({ isOpen, onClose }) {
  const [fullName, setFullName] = useState('');
  const [healthGoals, setHealthGoals] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      fetchUserData();
    }
  }, [isOpen]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid, 'profile', 'data'));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setFullName(data.fullName || auth.currentUser.displayName || '');
        setHealthGoals(data.healthGoals || '');
      } else {
        setFullName(auth.currentUser.displayName || '');
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Full Name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // 1. Update Firestore
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'profile', 'data'), {
        fullName: fullName.trim(),
        healthGoals: healthGoals.trim(),
        updatedAt: new Date()
      }, { merge: true });

      // 2. Update Auth Display Name
      await updateProfile(auth.currentUser, {
        displayName: fullName.trim()
      });

      // 3. Success Feedback
      alert('Profile updated successfully! 🌸');
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-petal rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-dark-plum p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-pink flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">Edit profile</h2>
              <p className="text-white/60 text-[11px] tracking-wider font-medium">Update your details</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-widest text-dark-plum/60 font-bold ml-1">Full name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-plum/30" />
                <input 
                  autoFocus
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#FAF9F6] border border-black/5 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-rose-pink focus:ring-1 focus:ring-rose-pink/10 transition-all text-dark-plum font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5 opacity-60">
              <label className="text-[11px] tracking-widest text-dark-plum/60 font-bold ml-1">Email address (Read-only)</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-plum/30" />
                <input 
                  disabled
                  type="email"
                  value={auth.currentUser?.email || ''}
                  className="w-full bg-[#FAF9F6] border border-black/5 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none cursor-not-allowed text-dark-plum/60 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] tracking-widest text-dark-plum/60 font-bold ml-1">Health goals</label>
              <div className="relative">
                <Sparkles size={18} className="absolute left-4 top-4 text-dark-plum/30" />
                <textarea 
                  value={healthGoals}
                  onChange={(e) => setHealthGoals(e.target.value)}
                  placeholder="What are you working towards?"
                  className="w-full bg-[#FAF9F6] border border-black/5 rounded-2xl pl-12 pr-4 pt-4 pb-4 text-sm outline-none focus:border-rose-pink focus:ring-1 focus:ring-rose-pink/10 transition-all text-dark-plum font-medium min-h-[120px] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={isSaving}
              type="submit"
              className="w-full bg-rose-pink text-white rounded-2xl py-4 text-sm font-bold tracking-widest shadow-lg shadow-rose-pink/20 hover:bg-[#BE185D] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <Save size={18} className="group-hover:scale-110 transition-transform" />
              {isSaving ? 'Saving changes...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
