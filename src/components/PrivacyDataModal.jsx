import { useState } from 'react';
import { X, Lock, Shield, Trash2, Check, AlertTriangle, LogOut } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { 
  doc, 
  collection, 
  query, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';

export default function PrivacyDataModal({ isOpen, onClose }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [understandChecked, setUnderstandChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDeleteData = async () => {
    if (!auth.currentUser || !understandChecked) return;
    
    setIsDeleting(true);
    const userId = auth.currentUser.uid;
    const batch = writeBatch(db);

    try {
      // 1. Delete user profile document
      batch.delete(doc(db, 'users', userId, 'profile', 'data'));

      // 2. Clear user daily logs
      const logsQuery = query(collection(db, 'users', userId, 'dailyLogs'));
      const logsSnapshot = await getDocs(logsQuery);
      logsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 3. Clear user bookings
      const bookingsQuery = query(collection(db, 'users', userId, 'bookings'));
      const bookingsSnapshot = await getDocs(bookingsQuery);
      bookingsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 4. Commit all deletions at once
      await batch.commit();

      // Show success feedback
      setShowSuccess(true);
      
      // Delay before signing out for closure
      setTimeout(async () => {
        await auth.signOut();
        onClose();
      }, 1500);

    } catch (err) {
      console.error("Error during data deletion:", err);
      alert("Failed to delete data. Please try again or contact support.");
    } finally {
      setIsDeleting(false);
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
      <div className="relative w-full max-w-md bg-petal rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-dark-plum p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-pink flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">Privacy & Data</h2>
              <p className="text-white/60 text-[11px] tracking-wider font-medium">Your data integrity</p>
            </div>
          </div>
          {!showSuccess && (
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8 space-y-8">
          {showSuccess ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in zoom-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold text-dark-plum">All data has been wiped</h3>
              <p className="text-sm text-dark-plum/50 max-w-[240px]">
                Your account is cleared. You will be signed out in a moment.
              </p>
            </div>
          ) : !showConfirm ? (
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-rose-pink/10 flex items-center justify-center text-rose-pink shrink-0">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-dark-plum">Data Ownership</h4>
                    <p className="text-[13px] text-dark-plum/50 mt-1 leading-relaxed">
                      Your health data belongs to you. We do not sell your personal information.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-dark-plum">Encryption</h4>
                    <p className="text-[13px] text-dark-plum/50 mt-1 leading-relaxed">
                      All logs and cycle data are encrypted and stored securely on our infrastructure.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-black/5">
                <button 
                  onClick={() => setShowConfirm(true)}
                  className="w-full text-rose-pink hover:bg-rose-pink/5 py-4 rounded-2xl text-sm font-bold tracking-widest border border-rose-pink/20 transition-all active:scale-[0.98]"
                >
                  Request data deletion
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-300">
              <div className="bg-rose-50 p-5 rounded-[24px] border border-rose-100 flex gap-4">
                <AlertTriangle size={24} className="text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-900">Final Confirmation Required</h4>
                  <p className="text-[13px] text-rose-800/80 leading-relaxed">
                    Are you sure? This will permanently delete your profile, bookings, and all health logs.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-4 p-4 bg-[#FAF9F6] rounded-2xl border border-black/5 cursor-pointer hover:bg-white transition-colors group">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-md border-gray-300 text-rose-pink focus:ring-rose-pink"
                  checked={understandChecked}
                  onChange={(e) => setUnderstandChecked(e.target.checked)}
                />
                <span className="text-xs font-semibold text-dark-plum/70 group-hover:text-dark-plum">
                  I understand this cannot be undone.
                </span>
              </label>

              <div className="pt-4 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="bg-petal text-dark-plum/60 py-4 rounded-2xl text-[13px] font-bold tracking-widest hover:bg-white border border-black/5 transition-all"
                >
                  Back
                </button>
                <button 
                  disabled={!understandChecked || isDeleting}
                  onClick={handleDeleteData}
                  className="bg-rose-pink text-white py-4 rounded-2xl text-[13px] font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-[#BE185D] shadow-lg shadow-rose-pink/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                  {isDeleting ? 'Wiping...' : 'Delete my data'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
