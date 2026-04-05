import { useState, useEffect } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Switch({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-black/5 last:border-0 grow">
      <div className="flex-1 pr-4">
        <h4 className="text-[14px] font-semibold text-dark-plum">{label}</h4>
        <p className="text-[12px] text-dark-plum/50 mt-0.5 leading-snug">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer group">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-pink group-hover:opacity-90"></div>
      </label>
    </div>
  );
}

export default function NotificationSettingsModal({ isOpen, onClose }) {
  const [preferences, setPreferences] = useState({
    dailyReminders: true,
    cycleAlerts: true,
    communityUpdates: true
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      fetchPreferences();
    }
  }, [isOpen]);

  const fetchPreferences = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'user_profiles', auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().notifications) {
        setPreferences(userDoc.data().notifications);
      } else {
        // Default to true if not set
        setPreferences({
          dailyReminders: true,
          cycleAlerts: true,
          communityUpdates: true
        });
      }
    } catch (err) {
      console.error("Error fetching notification preferences:", err);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
      await setDoc(doc(db, 'user_profiles', auth.currentUser.uid), {
        notifications: preferences,
        updatedAt: new Date()
      }, { merge: true });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error saving notification preferences:", err);
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
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-dark-plum p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-pink flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">Notification Preferences</h2>
              <p className="text-white/60 text-[11px] uppercase tracking-wider font-medium">Customize your alerts</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-[#FAF9F6] rounded-[24px] p-5 border border-black/5">
            <Switch 
              label="Daily Check-in Reminders"
              description="Remind me to log my symptoms daily."
              checked={preferences.dailyReminders}
              onChange={(val) => setPreferences(prev => ({ ...prev, dailyReminders: val }))}
            />
            <Switch 
              label="Cycle Alerts"
              description="Notify me when my period is approaching."
              checked={preferences.cycleAlerts}
              onChange={(val) => setPreferences(prev => ({ ...prev, cycleAlerts: val }))}
            />
            <Switch 
              label="Community Updates"
              description="Notify me of new messages in the Sisterhood."
              checked={preferences.communityUpdates}
              onChange={(val) => setPreferences(prev => ({ ...prev, communityUpdates: val }))}
            />
          </div>

          <div className="pt-2">
            <button 
              disabled={isSaving || showSuccess}
              onClick={handleSave}
              className={`w-full rounded-2xl py-4 text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group shadow-lg ${
                showSuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-rose-pink text-white shadow-rose-pink/20 hover:bg-[#BE185D] disabled:opacity-50'
              }`}
            >
              {showSuccess ? (
                <>
                  <Check size={18} className="animate-in zoom-in" />
                  Preferences Saved
                </>
              ) : (
                isSaving ? 'Saving...' : 'Save Preferences'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
