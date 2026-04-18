import { useState, useEffect } from 'react';
import { X, Calendar, Plus, Minus, Check } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function Stepper({ label, description, value, min, max, onChange }) {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="flex flex-col py-5 border-b border-black/5 last:border-0 grow">
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <h4 className="text-[14px] font-semibold text-dark-plum">{label}</h4>
          <p className="text-[12px] text-dark-plum/50 mt-0.5 leading-snug">{description}</p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-black/5 rounded-2xl p-1.5 shadow-sm">
          <button 
            onClick={decrement}
            disabled={value <= min}
            className="w-11 h-11 rounded-xl bg-[#FAF9F6] flex items-center justify-center text-dark-plum hover:bg-rose-pink hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Minus size={18} />
          </button>
          <span className="w-8 text-center text-lg font-bold text-dark-plum font-[Fraunces,serif]">{value}</span>
          <button 
            onClick={increment}
            disabled={value >= max}
            className="w-11 h-11 rounded-xl bg-[#FAF9F6] flex items-center justify-center text-dark-plum hover:bg-dark-plum hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CycleSettingsModal({ isOpen, onClose }) {
  const [periodLength, setPeriodLength] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      fetchCycleSettings();
    }
  }, [isOpen]);

  const fetchCycleSettings = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'user_profiles', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setPeriodLength(data.periodLength || 5);
        setCycleLength(data.cycleLength || 28);
      }
    } catch (err) {
      console.error("Error fetching cycle settings:", err);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
      await setDoc(doc(db, 'user_profiles', auth.currentUser.uid), {
        periodLength: Math.round(periodLength),
        cycleLength: Math.round(cycleLength),
        updatedAt: new Date()
      }, { merge: true });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error saving cycle settings:", err);
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
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">Cycle Settings</h2>
              <p className="text-white/60 text-[11px] tracking-wider font-medium">Predictive accuracy</p>
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
          <p className="text-[13px] text-dark-plum/60 leading-relaxed italic bg-rose-pink/5 p-4 rounded-2xl border border-rose-pink/10">
            Standard cycles are 28 days, but every body is different. Update this to make your predictions more accurate.
          </p>

          <div className="bg-[#FAF9F6] rounded-[24px] p-5 border border-black/5">
            <Stepper 
              label="Period length"
              description="How many days does your period usually last?"
              value={periodLength}
              min={1}
              max={14}
              onChange={setPeriodLength}
            />
            <Stepper 
              label="Cycle length"
              description="How many days is your full cycle?"
              value={cycleLength}
              min={21}
              max={45}
              onChange={setCycleLength}
            />
          </div>

          <div className="pt-2">
            <button 
              disabled={isSaving || showSuccess}
              onClick={handleSave}
              className={`w-full rounded-2xl py-4 text-sm font-bold tracking-widest transition-all flex items-center justify-center gap-2 group shadow-lg ${
                showSuccess 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-rose-pink text-white shadow-rose-pink/20 hover:bg-[#BE185D] disabled:opacity-50'
              }`}
            >
              {showSuccess ? (
                <>
                  <Check size={18} className="animate-in zoom-in" />
                  Cycle settings saved 🌸
                </>
              ) : (
                isSaving ? 'Updating...' : 'Save settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
