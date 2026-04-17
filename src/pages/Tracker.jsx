import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';

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
  const [mood, setMood] = useState(null);
  const [energy, setEnergy] = useState(5);
  const [modalMode, setModalMode] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);

  // Fetch User Profile (Last Period Start)
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribe = onSnapshot(doc(db, 'user_profiles', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Last 7 Days of Logs
  useEffect(() => {
    if (!auth.currentUser) return;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateStr = oneWeekAgo.toISOString().split('T')[0];

    const q = query(
      collection(db, 'health_logs'),
      where('userId', '==', auth.currentUser.uid),
      where('date', '>=', dateStr),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => doc.data());
      setWeeklyLogs(logs);
    });
    return () => unsubscribe();
  }, []);

  // Reset "Saved" state when any input changes
  useEffect(() => {
    if (hasSavedToday) {
      setHasSavedToday(false);
    }
  }, [ratings, mood, energy, notes]);

  const getPhaseInfo = (day) => {
    if (typeof day !== 'number') return { name: "Set cycle", description: "Log your last period to track your cycle phases" };
    if (day >= 1 && day <= 5) return { 
      name: "Menstrual Phase", 
      description: "Focus on rest and replenishment. Your body is renewing itself." 
    };
    if (day >= 6 && day <= 13) return { 
      name: "Follicular Phase", 
      description: "Your energy is rising. A great time for new projects and socialising." 
    };
    if (day >= 14 && day <= 16) return { 
      name: "Ovulatory Phase", 
      description: "You are at your peak vibrancy. Communication and confidence are high." 
    };
    if (day >= 17 && day <= 28) return { 
      name: "Luteal Phase", 
      description: "Slow down and practice self-care. Your body is preparing for a new cycle." 
    };
    if (day > 28) return { 
      name: "Late/Unknown", 
      description: "Your cycle is longer than 28 days. Log your period to stay updated." 
    };
    return { name: "Phase info", description: "Tracking your cycle..." };
  };

  const calculateCycleDay = (startDate) => {
    if (!startDate) return null;
    
    const start = startDate instanceof Timestamp ? startDate.toDate() : new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today - start);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 35) return 'Reset Needed';
    return diffDays + 1;
  };

  const cycleDay = calculateCycleDay(userProfile?.lastPeriodStart);

  const handleSaveCycle = async () => {
    if (!auth.currentUser || !lastPeriodDate) return;
    
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'user_profiles', auth.currentUser.uid), {
        lastPeriodStart: Timestamp.fromDate(new Date(lastPeriodDate)),
        updatedAt: serverTimestamp()
      }, { merge: true });
      setModalMode(null);
    } catch (error) {
      console.error("Error saving cycle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRating = (symptom, value) => {
    setRatings(prev => ({ ...prev, [symptom]: value }));
  };

  const saveLog = async () => {
    if (!auth.currentUser) return;

    setIsSubmitting(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const docId = `${auth.currentUser.uid}_${todayStr}`;

    // Calculate avg intensity of symptoms > 0
    const activeRatings = Object.values(ratings).filter(v => v > 0);
    const avgIntensity = activeRatings.length > 0 
      ? activeRatings.reduce((a, b) => a + b, 0) / activeRatings.length 
      : 0;

    try {
      await setDoc(doc(db, 'health_logs', docId), {
        userId: auth.currentUser.uid,
        date: todayStr,
        mood,
        energy,
        ratings,
        notes,
        cycleDay: typeof cycleDay === 'number' ? cycleDay : null,
        avgIntensity,
        createdAt: serverTimestamp()
      });
      
      setHasSavedToday(true);
    } catch (error) {
      console.error("Error saving log:", error);
    } finally {
      setIsSubmitting(false);
    }
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
              Track daily. Your body is telling a story — this is where you write it down. 🌸
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
                    <span className="text-xl font-bold leading-none mt-0.5">
                      {typeof cycleDay === 'number' ? cycleDay : '-'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[15px] md:text-base font-semibold text-[#2D1B2E]">
                      {cycleDay === 'Reset Needed' 
                        ? 'Cycle Reset Needed' 
                        : cycleDay 
                        ? `Day ${cycleDay} — ${getPhaseInfo(cycleDay).name}` 
                        : 'Set your cycle'}
                    </h3>
                    <p className="text-[13px] md:text-[14px] text-[#2D1B2E]/60 mt-1 leading-relaxed">
                      {cycleDay === 'Reset Needed' 
                        ? 'Your last period was over 35 days ago. Please log your latest cycle.' 
                        : cycleDay 
                        ? getPhaseInfo(cycleDay).description 
                        : 'Log your last period to track your cycle phases'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModalMode('log')} className="flex-1 bg-[#FFF5F8] text-[#D4688A] font-medium py-3 rounded-xl flex items-center justify-center text-[13px] md:text-[14px] hover:bg-[#FBCFE8]/50 transition border border-[#D4688A]/10">
                    <span className="mr-2 text-base">📅</span> Log Period Start
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
                disabled={isSubmitting}
                className={`text-white border-none rounded-[16px] px-6 py-4 font-[Jost,sans-serif] text-[15px] font-medium w-full cursor-pointer transition-all duration-250 tracking-[0.3px] relative overflow-hidden shadow-sm hover:-translate-y-[1px] flex items-center justify-center gap-3 ${
                  isSubmitting ? 'bg-[#D4688A] opacity-70 cursor-wait' :
                  hasSavedToday ? 'bg-[#059669] opacity-90 shadow-md ring-2 ring-[#059669]/20' : 
                  'bg-[#D4688A] hover:bg-[#BE185D] hover:shadow-[0_8px_24px_rgba(212,104,138,0.35)]'
                }`}
                onClick={saveLog}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : hasSavedToday ? (
                  '✓ Logged for Today'
                ) : (
                  "Save Today's Log ✓"
                )}
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
                    {(() => {
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      const last7Days = Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        return d;
                      });

                      return last7Days.map((date, idx) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const log = weeklyLogs.find(l => l.date === dateStr);
                        const intensity = log ? (log.avgIntensity / 5) * 100 : 0;
                        const isToday = idx === 6;

                        return (
                          <div key={dateStr} className="flex flex-col items-center gap-2.5 flex-1 group">
                            <div 
                              className={`w-full max-w-[14px] md:max-w-[18px] rounded-t-[4px] rounded-b-[2px] transition-all duration-500 group-hover:bg-[#D4688A] ${isToday ? 'bg-[#D4688A] opacity-100' : 'bg-[#E8DCE5] opacity-70'}`} 
                              style={{ height: `${Math.max(intensity, 8)}px` }}
                            ></div>
                            <div className="text-[10px] md:text-[11px] text-[#2D1B2E]/60 font-semibold">
                              {isToday ? 'Today' : days[date.getDay()]}
                            </div>
                          </div>
                        );
                      });
                    })()}
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
                value={lastPeriodDate}
                onChange={(e) => setLastPeriodDate(e.target.value)}
                className="w-full bg-white border border-[#D4688A] rounded-xl px-4 py-3.5 font-[Jost,sans-serif] text-[15px] text-[#2D1B2E] outline-none transition-all focus:ring-2 focus:ring-[#D4688A]/20 shadow-sm" 
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
              onClick={handleSaveCycle} 
              disabled={isSubmitting || !lastPeriodDate}
              className="w-full bg-[#D4688A] text-white rounded-[16px] py-4 font-medium text-[15px] hover:bg-[#BE185D] transition-colors mt-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : null}
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
