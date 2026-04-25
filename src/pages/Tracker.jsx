import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { 
  Activity,
  Droplets,
  Wind,
  BatteryLow,
  Heart,
  GlassWater,
  Thermometer,
  Cloud,
  Zap 
} from 'lucide-react';
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
import { calculateCyclePhase } from '../utils/cycleUtils';

function RatingRow({ label, icon: Icon, value, onChange, readOnly = false }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-[#FFE8EF] last:border-b-0">
      <div className="text-[13px] lg:text-[14px] text-[#2D1B2E] flex items-center gap-3">
        <div className="text-[#D4688A] shrink-0">
          <Icon size={20} />
        </div>
        <span className="font-medium opacity-90">{label}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            onClick={() => !readOnly && onChange(level)}
            className={`w-[13px] h-[13px] rounded-full transition-all duration-150 ${
              readOnly ? 'cursor-default' : 'cursor-pointer'
            } ${
              level <= value 
                ? 'bg-[#D4688A] scale-110 shadow-sm' 
                : 'bg-[#D4688A]/40' + (!readOnly ? ' hover:bg-[#D4688A]/60' : '')
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
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSavedToday, setHasSavedToday] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Fetch User Profile (Last Period Start)
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid, 'profile', 'data'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserProfile(data);
        if (data.cycleLength) setCycleLength(data.cycleLength);
        if (data.periodLength) setPeriodLength(data.periodLength);
        if (data.lastPeriodStart) {
          const date = data.lastPeriodStart instanceof Timestamp 
            ? data.lastPeriodStart.toDate() 
            : new Date(data.lastPeriodStart);
          setLastPeriodDate(date.toISOString().split('T')[0]);
        }
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
      collection(db, 'users', auth.currentUser.uid, 'dailyLogs'),
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

  const cycleInfo = calculateCyclePhase(userProfile?.lastPeriodStart, userProfile?.cycleLength || 28);
  const cycleDay = cycleInfo?.day;
  const cyclePhase = cycleInfo?.phase;

  const handleSaveCycle = async () => {
    if (!auth.currentUser || !lastPeriodDate) return;
    
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'profile', 'data'), {
        lastPeriodStart: Timestamp.fromDate(new Date(lastPeriodDate)),
        cycleLength: Number(cycleLength),
        periodLength: Number(periodLength),
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
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'dailyLogs', todayStr), {
        userId: auth.currentUser.uid,
        date: todayStr,
        mood,
        energy: Number(energy),
        ratings,
        notes,
        cycleDay: typeof cycleDay === 'number' ? cycleDay : null,
        avgIntensity,
        createdAt: serverTimestamp()
      });
      
      setHasSavedToday(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
    <div className="flex flex-col min-h-screen bg-petal">
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
                <div className="text-[11px] font-semibold tracking-wider text-[#2D1B2E]/60 mb-5">
                  Cycle overview
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#D4688A] rounded-xl text-white flex flex-col items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(212,104,138,0.25)]">
                    <span className="text-[9px] font-bold tracking-wider opacity-90 mt-0.5">Day</span>
                    <span className="text-xl font-bold leading-none mt-0.5">
                      {typeof cycleDay === 'number' ? cycleDay : '-'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[15px] md:text-base font-semibold text-[#2D1B2E]">
                      {cyclePhase === 'Late' 
                        ? 'Cycle Late' 
                        : cycleDay 
                        ? `Day ${cycleDay} — ${cyclePhase}` 
                        : 'Set your cycle'}
                    </h3>
                    <p className="text-[13px] md:text-[14px] text-[#2D1B2E]/60 mt-1 leading-relaxed">
                      {cyclePhase === 'Late' 
                        ? 'Your cycle is longer than expected. Log your period to stay updated.' 
                        : cycleDay 
                        ? 'Your cycle is being tracked in real-time across your dashboard.' 
                        : 'Log your last period to track your cycle phases'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModalMode('log')} className="flex-1 bg-[#FFF5F8] text-[#D4688A] font-medium py-3 rounded-xl flex items-center justify-center text-[13px] md:text-[14px] hover:bg-[#FBCFE8]/50 transition border border-[#D4688A]/10">
                    <span className="mr-2 text-base">📅</span> Log period start
                  </button>
                  <button onClick={() => setModalMode('edit')} className="flex-1 bg-[#FFF5F8] text-[#D4688A] font-medium py-3 rounded-xl flex items-center justify-center text-[13px] md:text-[14px] hover:bg-[#FBCFE8]/50 transition border border-[#D4688A]/10">
                    <span className="mr-2 text-base">⚙️</span> Edit cycle
                  </button>
                </div>
              </div>

              {/* Symptoms List */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <div className="text-[11px] font-bold tracking-wider text-[#2D1B2E]/60 mb-5">
                  Today's symptoms
                </div>
                
                <RatingRow label="Pelvic Pain" icon={Activity} value={ratings.pelvicPain} onChange={(v) => updateRating('pelvicPain', v)} readOnly={true} />
                <RatingRow label="Bleeding" icon={Droplets} value={ratings.bleeding} onChange={(v) => updateRating('bleeding', v)} readOnly={true} />
                <RatingRow label="Bloating" icon={Wind} value={ratings.bloating} onChange={(v) => updateRating('bloating', v)} readOnly={true} />
                <RatingRow label="Fatigue" icon={BatteryLow} value={ratings.fatigue} onChange={(v) => updateRating('fatigue', v)} readOnly={true} />
                
                <RatingRow label="Nausea" icon={GlassWater} value={ratings.nausea} onChange={(v) => updateRating('nausea', v)} readOnly={true} />
                <RatingRow label="Hot Flashes" icon={Thermometer} value={ratings.hotFlashes} onChange={(v) => updateRating('hotFlashes', v)} readOnly={true} />
                <RatingRow label="Brain Fog" icon={Cloud} value={ratings.brainFog} onChange={(v) => updateRating('brainFog', v)} readOnly={true} />
                <RatingRow label="Back Pain" icon={Zap} value={ratings.backPain} onChange={(v) => updateRating('backPain', v)} readOnly={true} />
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Mood Selector */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <div className="text-[11px] font-semibold tracking-wider text-[#2D1B2E]/60 mb-5">
                  How are you feeling today?
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {moodOptions.map((option) => (
                    <div 
                      key={option.label}
                      onClick={() => setMood(option.label)}
                      className={`flex flex-col items-center justify-center py-3.5 rounded-xl cursor-pointer transition-all duration-300 border ${
                        mood === option.label 
                          ? 'bg-[#D4688A] border-[#D4688A] shadow-sm scale-[1.03]' 
                          : 'bg-[#FAF9F6] border-transparent hover:bg-white hover:border-[#D4688A]/20'
                      }`}
                    >
                      <span className={`text-2xl mb-1.5 transition-colors duration-300 ${mood === option.label ? 'brightness-0 invert' : ''}`}>{option.emoji}</span>
                      <span className={`text-[10px] md:text-[11px] font-medium transition-colors duration-300 ${mood === option.label ? 'text-white' : 'text-[#2D1B2E]/60'}`}>
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Energy Level */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <div className="text-[11px] font-semibold tracking-wider text-[#2D1B2E]/60 mb-5 flex justify-between items-center">
                  <span>How is your energy today?</span>
                  <span className="text-[#D4688A] font-bold text-[12px] bg-[#FFF5F8] px-2.5 py-1 rounded-md">{energy}/10</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="10" 
                  value={energy} 
                  onChange={(e) => setEnergy(e.target.value)} 
                  style={{ 
                    background: `linear-gradient(to right, #D4688A ${energy * 10}%, #FFE8EF ${energy * 10}%)` 
                  }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4688A]/40 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-[#D4688A] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110" 
                />
                <div className="flex justify-between items-center text-[11px] md:text-xs text-[#2D1B2E]/50 font-medium mt-3">
                  <span>Exhausted</span>
                  <span>Energized</span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5">
                <label className="text-[11px] font-semibold tracking-wider text-[#2D1B2E]/60 mb-4 block">
                  Today's notes
                </label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-black/5 rounded-[12px] px-5 py-4 font-[Jost,sans-serif] text-[14px] text-[#2D1B2E] outline-none resize-none min-h-[120px] transition-all duration-200 leading-[1.6] focus:border-[#D4688A] focus:bg-white focus:ring-[3px] focus:ring-[#D4688A]/10"
                  placeholder="What you ate, how you slept, stress levels, medications, anything that felt different today..."
                />
              </div>

              {/* Save Button */}
              <div className="relative">
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

                {/* Success Toast */}
                {showToast && (
                  <div className="absolute -top-14 left-0 right-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#FFF5F8] border border-[#D4688A]/20 text-[#D4688A] text-[13px] font-medium px-4 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                      Today's log saved. Keep showing up for yourself. 🌸
                    </div>
                  </div>
                )}
              </div>

              {/* Weekly Chart */}
              <div className="mt-4 md:mt-6 pb-2">
                <div className="text-[20px] md:text-[22px] font-[Fraunces,serif] font-light text-[#2D1B2E] mb-[16px]">
                  This <em className="italic text-[#D4688A]">Week</em>
                </div>
                <div className="bg-white rounded-[16px] p-5 md:p-6 shadow-sm border border-black/5 relative min-h-[180px] flex flex-col">
                  <div className="text-[11px] font-semibold tracking-wider text-[#2D1B2E]/60 mb-8">
                    Symptom intensity — last 7 days
                  </div>
                  
                  {weeklyLogs.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-[13px] text-[#2D1B2E]/40 font-medium italic">No data tracked yet this week</p>
                    </div>
                  ) : (
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
                          const hasData = !!log;
                          const isToday = idx === 6;

                          return (
                            <div key={dateStr} className="flex flex-col items-center gap-2.5 flex-1 group">
                              <div 
                                className={`w-full max-w-[14px] md:max-w-[18px] rounded-t-[4px] rounded-b-[2px] transition-all duration-500 group-hover:bg-[#D4688A] ${hasData ? 'bg-[#D4688A] opacity-100' : 'bg-[#E8DCE5] opacity-50'}`} 
                                style={{ height: `${hasData ? intensity : 2}px` }}
                              ></div>
                              <div className="text-[10px] md:text-[11px] text-[#2D1B2E]/60 font-semibold">
                                {isToday ? 'Today' : days[date.getDay()]}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                  
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
              <label className="text-[10px] font-bold tracking-[1.2px] text-[#2D1B2E]/60 mb-2 block">
                Last period start date
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
                <label className="text-[10px] font-bold tracking-[1.2px] text-[#2D1B2E]/60 mb-2 block">
                  Avg cycle (days)
                </label>
                <input 
                  type="number" 
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  placeholder="28"
                  className="w-full bg-white border border-[#D4688A]/20 rounded-[16px] px-4 py-3.5 font-[Jost,sans-serif] text-[15px] text-[#2D1B2E] outline-none transition-all focus:border-[#D4688A] shadow-sm" 
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold tracking-[1.2px] text-[#2D1B2E]/60 mb-2 block">
                  Avg period (days)
                </label>
                <input 
                  type="number" 
                  value={periodLength}
                  onChange={(e) => setPeriodLength(e.target.value)}
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
