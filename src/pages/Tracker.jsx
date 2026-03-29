import { useState } from 'react';

function RatingRow({ label, icon, value, onChange }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-black/5 last:border-b-0">
      <div className="text-[13px] lg:text-[14px] text-[#2D1B2E] flex items-center gap-2">
        <span className="text-base lg:text-lg">{icon}</span>
        <span className="font-medium opacity-90">{label}</span>
      </div>
      <div className="flex gap-1.5 md:gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            onClick={() => onChange(level)}
            className={`w-[11px] h-[11px] md:w-[12px] md:h-[12px] rounded-full cursor-pointer transition-all duration-150 ${
              level <= value ? 'bg-[#D4688A] scale-110 shadow-sm' : 'bg-[#D4688A]/10 hover:bg-[#D4688A]/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Tracker() {
  const [ratings, setRatings] = useState({
    pelvicPain: 0,
    bleeding: 0,
    bloating: 0,
    fatigue: 0,
    mood: 0,
    nausea: 0,
    hotFlashes: 0,
    brainFog: 0,
    backPain: 0
  });
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(5);
  const [modalMode, setModalMode] = useState(null);

  const updateRating = (symptom, value) => {
    setRatings(prev => ({ ...prev, [symptom]: value }));
  };

  const saveLog = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const moodOptions = [
    { emoji: '😫', label: 'Terrible' },
    { emoji: '😔', label: 'Low' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '🤩', label: 'Great' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F2E6EC]">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-10 pt-8 pb-[90px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="max-w-6xl mx-auto w-full">
          
          <div className="mb-6 lg:mb-8">
            <h2 className="text-[24px] md:text-[28px] lg:text-[32px] font-[Fraunces,serif] font-light text-[#2D1B2E] mb-2">{today}</h2>
            <p className="text-[13px] md:text-[14px] lg:text-[15px] text-[#2D1B2E]/60 leading-relaxed max-w-xl">
              Track daily. Your data builds your Medical Summary and gives your doctor the full picture they need to help you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Cycle Overview */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <div className="text-[11px] font-semibold tracking-wider text-[#2D1B2E]/60 mb-5 uppercase">
                  CYCLE OVERVIEW
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#D4688A] rounded-xl text-white flex flex-col items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(212,104,138,0.25)]">
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-90 mt-0.5">Day</span>
                    <span className="text-xl font-bold leading-none mt-0.5">-</span>
                  </div>
                  <div>
                    <h3 className="text-[15px] md:text-base font-semibold text-[#2D1B2E]">Set your cycle</h3>
                    <p className="text-[13px] md:text-[14px] text-[#2D1B2E]/60 mt-1 leading-relaxed">
                      Log your last period to track your cycle phases
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModalMode('log')} className="flex-1 bg-[#FFF5F8] text-[#D4688A] font-medium py-3 rounded-xl flex items-center justify-center text-[13px] md:text-[14px] hover:bg-[#FBCFE8]/50 transition border border-[#D4688A]/10">
                    <span className="mr-2 text-base">📅</span> Log Period
                  </button>
                  <button onClick={() => setModalMode('edit')} className="flex-1 bg-[#FFF5F8] text-[#D4688A] font-medium py-3 rounded-xl flex items-center justify-center text-[13px] md:text-[14px] hover:bg-[#FBCFE8]/50 transition border border-[#D4688A]/10">
                    <span className="mr-2 text-base">⚙️</span> Edit Cycle
                  </button>
                </div>
              </div>

              {/* Symptoms List */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <div className="text-[11px] font-semibold tracking-wider uppercase text-[#2D1B2E]/60 mb-5">
                  Today's Symptoms — tap dots to rate
                </div>
                
                <RatingRow label="Pelvic Pain" icon="🔴" value={ratings.pelvicPain} onChange={(v) => updateRating('pelvicPain', v)} />
                <RatingRow label="Bleeding" icon="🩸" value={ratings.bleeding} onChange={(v) => updateRating('bleeding', v)} />
                <RatingRow label="Bloating" icon="💨" value={ratings.bloating} onChange={(v) => updateRating('bloating', v)} />
                <RatingRow label="Fatigue" icon="😴" value={ratings.fatigue} onChange={(v) => updateRating('fatigue', v)} />
                <RatingRow label="Mood" icon="😔" value={ratings.mood} onChange={(v) => updateRating('mood', v)} />
                
                {/* NEW SYMPTOMS */}
                <RatingRow label="Nausea" icon="🤢" value={ratings.nausea} onChange={(v) => updateRating('nausea', v)} />
                <RatingRow label="Hot Flashes" icon="🌡️" value={ratings.hotFlashes} onChange={(v) => updateRating('hotFlashes', v)} />
                <RatingRow label="Brain Fog" icon="🧠" value={ratings.brainFog} onChange={(v) => updateRating('brainFog', v)} />
                <RatingRow label="Back Pain" icon="⚡" value={ratings.backPain} onChange={(v) => updateRating('backPain', v)} />
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Mood Selector */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <div className="text-[11px] font-semibold tracking-wider text-[#2D1B2E]/60 mb-5 uppercase">
                  TODAY'S MOOD
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((option) => (
                    <div 
                      key={option.label}
                      onClick={() => setMood(option.label)}
                      className={`flex flex-col items-center justify-center py-3.5 rounded-xl cursor-pointer transition-all duration-200 border ${
                        mood === option.label 
                          ? 'bg-[#FFF5F8] border-[#D4688A] shadow-sm scale-[1.03]' 
                          : 'bg-[#FAF9F6] border-transparent hover:bg-white hover:border-[#D4688A]/20'
                      }`}
                    >
                      <span className="text-2xl mb-1.5">{option.emoji}</span>
                      <span className={`text-[10px] md:text-[11px] font-medium ${mood === option.label ? 'text-[#D4688A]' : 'text-[#2D1B2E]/60'}`}>
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <div className="text-[11px] font-semibold tracking-wider text-[#2D1B2E]/60 mb-5 uppercase flex justify-between items-center">
                  <span>ENERGY LEVEL</span>
                  <span className="text-[#D4688A] font-bold text-[12px] bg-[#FFF5F8] px-2.5 py-1 rounded-md">{energy}/10</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="10" 
                  value={energy} 
                  onChange={(e) => setEnergy(e.target.value)} 
                  className="w-full h-1.5 bg-[#E8DCE5] rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4688A]/40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#D4688A] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110" 
                />
                <div className="flex justify-between items-center text-[11px] md:text-xs text-[#2D1B2E]/50 font-medium mt-3">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <label className="text-[11px] font-semibold tracking-wider uppercase text-[#2D1B2E]/60 mb-4 block">
                  Today's Notes
                </label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-black/5 rounded-[12px] px-5 py-4 font-[Jost,sans-serif] text-[14px] text-[#2D1B2E] outline-none resize-none min-h-[120px] transition-all duration-200 leading-[1.6] focus:border-[#D4688A] focus:bg-white focus:ring-[3px] focus:ring-[#D4688A]/10"
                  placeholder="What you ate, activity, stress, sleep, anything that felt different today..."
                />
              </div>

              {/* Save Button */}
              <button 
                className={`text-white border-none rounded-[16px] px-6 py-4 font-[Jost,sans-serif] text-[15px] font-medium w-full cursor-pointer transition-all duration-250 tracking-[0.3px] relative overflow-hidden shadow-sm hover:-translate-y-[1px] ${
                  saved ? 'bg-[#065F46] shadow-md' : 'bg-[#D4688A] hover:bg-[#BE185D] hover:shadow-[0_8px_24px_rgba(212,104,138,0.35)]'
                }`}
                onClick={saveLog}
              >
                {saved ? '✅ Saved!' : "Save Today's Log ✓"}
              </button>

              {/* Weekly Chart */}
              <div className="mt-4 md:mt-6 pb-2">
                <div className="text-[20px] md:text-[22px] font-[Fraunces,serif] font-light text-[#2D1B2E] mb-[16px]">
                  This <em className="italic text-[#D4688A]">Week</em>
                </div>
                <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                  <div className="text-[11px] font-semibold tracking-wider uppercase text-[#2D1B2E]/60 mb-8">
                    Symptom Intensity — Last 7 Days
                  </div>
                  <div className="flex items-end justify-between h-[110px] px-1 md:px-2 gap-2">
                    {[
                      { d: 'Mon', h: '44px' }, 
                      { d: 'Tue', h: '58px' }, 
                      { d: 'Wed', h: '50px' }, 
                      { d: 'Thu', h: '64px' }, 
                      { d: 'Fri', h: '36px' }, 
                      { d: 'Sat', h: '28px' }, 
                      { d: 'Today', h: '52px', op: 1 }
                    ].map(col => (
                      <div key={col.d} className="flex flex-col items-center gap-2.5 flex-1 group">
                        <div 
                          className={`w-full max-w-[14px] md:max-w-[18px] rounded-t-[4px] rounded-b-[2px] transition-all duration-300 group-hover:bg-[#D4688A] ${col.op ? 'bg-[#D4688A] opacity-100' : 'bg-[#E8DCE5] opacity-70'}`} 
                          style={{ height: col.h }}
                        ></div>
                        <div className="text-[10px] md:text-[11px] text-[#2D1B2E]/60 font-semibold">{col.d}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center text-[12px] md:text-[13px] text-[#2D1B2E]/50 italic font-[Jost,sans-serif]">
                    Based on your saved logs. Save daily for better insights.
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Dynamic Modal */}
      {modalMode && (
        <div className="fixed inset-0 bg-[#2D1B2E]/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#FFF9FA] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl transform transition-all relative">
            <div className="w-12 h-1.5 bg-[#E8DCE5] rounded-full mx-auto mb-6 sm:hidden"></div>
            
            <h2 className="text-2xl font-medium text-[#2D1B2E] mb-2">
              {modalMode === 'log' ? (
                <>Log your <span className="italic text-[#D4688A] font-[Fraunces,serif]">Period</span></>
              ) : (
                <>Edit <span className="italic text-[#D4688A] font-[Fraunces,serif]">Cycle Info</span></>
              )}
            </h2>
            
            <p className="text-[#2D1B2E]/60 text-sm mb-6 leading-relaxed">
              {modalMode === 'log' 
                ? "When did your last period start? This helps us track your cycle phases accurately." 
                : "Update your standard cycle lengths so we can predict your phases better."}
            </p>

            <div className="mb-4">
              <label className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#2D1B2E]/60 mb-2 block">
                LAST PERIOD START DATE
              </label>
              <input 
                type="date" 
                className="w-full bg-white border border-[#D4688A]/20 rounded-[16px] px-4 py-3.5 font-[Jost,sans-serif] text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] shadow-sm" 
              />
            </div>
            
            <div className="flex gap-4 mb-5">
              <div className="flex-1">
                <label className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#2D1B2E]/60 mb-2 block">
                  AVG CYCLE (DAYS)
                </label>
                <input 
                  type="number" 
                  defaultValue="28"
                  placeholder="28"
                  className="w-full bg-white border border-[#D4688A]/20 rounded-[16px] px-4 py-3.5 font-[Jost,sans-serif] text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] shadow-sm" 
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold tracking-[1.2px] uppercase text-[#2D1B2E]/60 mb-2 block">
                  AVG PERIOD (DAYS)
                </label>
                <input 
                  type="number" 
                  defaultValue="5"
                  placeholder="5"
                  className="w-full bg-white border border-[#D4688A]/20 rounded-[16px] px-4 py-3.5 font-[Jost,sans-serif] text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] shadow-sm" 
                />
              </div>
            </div>

            <button 
              onClick={() => setModalMode(null)} 
              className="w-full bg-[#D4688A] text-white rounded-[16px] py-4 font-medium text-[15px] hover:bg-[#BE185D] transition-colors mt-2 shadow-sm"
            >
              Save Info →
            </button>
            <button 
              onClick={() => setModalMode(null)} 
              className="w-full text-[#2D1B2E]/50 underline text-sm mt-4 hover:text-[#2D1B2E] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
