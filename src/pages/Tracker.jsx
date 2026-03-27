import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RatingRow({ label, icon, value, onChange }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-black/5 last:border-b-0">
      <div className="text-[13px] text-ink flex items-center gap-2">
        <span className="text-base">{icon}</span>
        {label}
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            onClick={() => onChange(level)}
            className={`w-[11px] h-[11px] rounded-full cursor-pointer transition-all duration-150 ${
              level <= value ? 'bg-clay' : 'bg-clay/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Tracker() {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({
    pelvicPain: 0,
    bleeding: 0,
    bloating: 0,
    fatigue: 0,
    mood: 0
  });
  const [notes, setNotes] = useState('');

  const updateRating = (symptom, value) => {
    setRatings(prev => ({ ...prev, [symptom]: value }));
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-5 pt-[18px] pb-[14px] sticky top-0 z-50 bg-parchment/90 backdrop-blur-xl border-b border-clay/5">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-9 h-9 rounded-full bg-linen border-none flex items-center justify-center text-base cursor-pointer transition-colors hover:bg-gold-pale"
        >
          ←
        </button>
        <div className="font-fraunces text-xl font-light text-ink tracking-tight">
          Symptom <em className="italic text-clay">Tracker</em>
        </div>
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-[18px] pt-5 pb-[90px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-2xl mx-auto w-full">
          
          <div className="mb-6">
            <h2 className="text-[22px] font-fraunces font-light text-ink mb-1">{today}</h2>
            <p className="text-[13px] text-dust leading-relaxed">
              Track daily. Your data builds your Medical Summary and gives your doctor the full picture they need to help you.
            </p>
          </div>

          <div className="bg-base-white rounded-[20px] p-5 mb-5 border border-clay/10 shadow-card">
            <div className="text-[11px] font-semibold tracking-[1.2px] uppercase text-dust mb-4">
              Today's Symptoms — tap dots to rate
            </div>
            
            <RatingRow 
              label="Pelvic Pain" icon="🔴" 
              value={ratings.pelvicPain} 
              onChange={(v) => updateRating('pelvicPain', v)} 
            />
            <RatingRow 
              label="Bleeding" icon="🩸" 
              value={ratings.bleeding} 
              onChange={(v) => updateRating('bleeding', v)} 
            />
            <RatingRow 
              label="Bloating" icon="💨" 
              value={ratings.bloating} 
              onChange={(v) => updateRating('bloating', v)} 
            />
            <RatingRow 
              label="Fatigue" icon="😴" 
              value={ratings.fatigue} 
              onChange={(v) => updateRating('fatigue', v)} 
            />
            <RatingRow 
              label="Mood" icon="😔" 
              value={ratings.mood} 
              onChange={(v) => updateRating('mood', v)} 
            />
          </div>

          <div className="mb-[18px]">
            <label className="text-[10px] font-semibold tracking-[1.2px] uppercase text-dust mb-2 block">
              Today's Notes
            </label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-base-white border-[1.5px] border-clay/10 rounded-[13px] px-4 py-[13px] font-jost text-[14px] text-ink outline-none resize-none min-h-[100px] transition-all duration-200 leading-[1.6] focus:border-clay focus:ring-[3px] focus:ring-clay/10"
              placeholder="What you ate, activity, stress, sleep, anything that felt different today..."
            />
          </div>

          <button 
            className="bg-clay text-white border-none rounded-[14px] px-6 py-4 font-jost text-[14px] font-medium w-full cursor-pointer transition-all duration-250 tracking-[0.3px] relative overflow-hidden hover:bg-clay-deep hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(184,92,56,0.35)] after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_60%)]"
            onClick={() => console.log('Saved data:', { ratings, notes })}
          >
            Save Today's Log ✓
          </button>

        </div>
      </div>
    </div>
  );
}
