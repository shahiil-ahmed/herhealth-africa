import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Stethoscope, BarChart3, ClipboardList, Activity, Heart } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { calculateCyclePhase } from "../utils/cycleUtils";
import UserBookings from "../components/UserBookings";
import Linkify from "../components/Linkify";


export default function Dashboard() {
  const { currentUser } = useAuth();

  const [cycleData, setCycleData] = useState(null);
  const [isCycleLoading, setIsCycleLoading] = useState(true);

  // Fetch cycle data in real-time
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", currentUser.uid, "profile", "data"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.lastPeriodStart) {
            const result = calculateCyclePhase(
              data.lastPeriodStart,
              data.cycleLength || 28
            );
            setCycleData(result);
          }
        }
        setIsCycleLoading(false);
      },
      (error) => {
        console.error("Error fetching cycle data:", error);
        setIsCycleLoading(false);
        if (error.code === 'permission-denied') {
          unsubscribe();
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Get first name or default to 'Sister'
  const userName = currentUser?.displayName
    ? currentUser.displayName.split(" ")[0]
    : "Sister";

  return (
    <div className="flex flex-col h-full flex-1 bg-petal">
      {/* Ensure scrollbar-hide if we add a global class, or just normal overflow */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* ... (rest of the sections remain same until Resources) */}
        <div className="bg-[#2D1B2E] relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(184,92,56,0.3) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 0% 100%, rgba(191,155,74,0.15) 0%, transparent 60%)",
            }}
          />

          <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-12 pb-10">
            <div className="flex justify-between items-start relative z-20">
              <div className="text-[11px] tracking-[2px] text-white/35 mb-3">
                Welcome back, {userName} ✦
              </div>
            </div>

            {/* We must ensure z-index is lower than the dropdown here */}
            <div className="font-fraunces text-[32px] md:text-[48px] font-extralight text-white leading-[1.25] mb-4 md:mb-6 relative z-10">
              Your body,
              <br />
              <em className="italic text-[#D4688A]">finally</em> understood.
            </div>

            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 relative z-10 transition-all duration-300">
              <span className={`w-2 h-2 rounded-full bg-[#D4688A] ${isCycleLoading ? 'animate-bounce' : 'animate-pulse'}`}></span>
              <span className="text-[12px] font-medium text-white/80 tracking-wide">
                {isCycleLoading ? (
                  "Syncing cycle..."
                ) : cycleData ? (
                  `Currently in: ${cycleData.phase} • Day ${cycleData.day}`
                ) : (
                  "Set your cycle →"
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 -mt-6 relative z-10 mb-2">
          <Link to="/tracker" className="block no-underline">
            <div className="bg-white rounded-[20px] shadow-md border border-black/5 p-4 md:p-5 flex flex-col gap-[10px] cursor-pointer hover:-translate-y-1 transition-transform">
               <div className="text-[10px] font-semibold tracking-[1.5px] text-dark-plum/60">Today's check-in</div>
               <div className="flex gap-3 items-center">
                 <BarChart3 size={24} color="#D4688A" strokeWidth={2.5} />
                 <div className="text-[12px] text-dark-plum leading-normal max-w-lg">
                   <Linkify text="Log your symptoms today to build your health picture." /> <span className="text-rose-pink font-medium">Tap to track →</span>
                 </div>
               </div>
            </div>
          </Link>
        </div>

        <UserBookings />

        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6 relative z-0">
             <Link to="/booking" className="block no-underline">
               <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:shadow-card-hover bg-[#D4688A] text-white shadow-[0_4px_20px_rgba(212,104,138,0.3)]">
                 <div className="absolute -top-[20px] -right-[20px] w-[80px] h-[80px] rounded-full bg-white/10"></div>
                 <div className="mb-2 relative z-10">
                   <ClipboardList size={32} color="white" />
                 </div>
                 <div className="relative z-10">
                   <div className="text-[13px] font-semibold leading-[1.3] text-white">
                     Book session
                   </div>
                   <div className="text-[11px] mt-[3px] leading-[1.4] text-white/70">
                     Start your navigation journey
                   </div>
                 </div>
               </div>
             </Link>

             <Link to="/tracker" className="block no-underline">
               <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:shadow-card-hover bg-white border border-black/5 shadow-card text-[#2D1B2E]">
                 <div className="mb-2">
                   <Activity size={32} color="#D4688A" />
                 </div>
                  <div>
                    <div className="text-[13px] font-semibold leading-[1.3] text-[#2D1B2E]">
                      Track today
                    </div>
                    <div className="text-[11px] mt-[3px] leading-[1.4] text-[#2D1B2E]/60">
                      Log symptoms & cycle
                    </div>
                  </div>
               </div>
             </Link>

             <Link to="/discover" className="block no-underline">
               <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:scale-105 hover:shadow-card-hover bg-white border border-black/5 shadow-card text-dark-plum">
                 <div className="mb-2">
                   <Stethoscope size={32} color="#D4688A" />
                 </div>
                  <div>
                    <div className="text-[13px] font-semibold leading-[1.3] text-dark-plum">
                      Find specialist
                    </div>
                    <div className="text-[11px] mt-[3px] leading-[1.4] text-dark-plum/60">
                      Connect with experts
                    </div>
                  </div>
               </div>
             </Link>

              <Link to="/sisterhood" className="block no-underline">
                <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:scale-105 hover:shadow-card-hover bg-[#D4688A] text-white shadow-[0_4px_20px_rgba(212,104,138,0.3)]">
                  <div className="absolute -bottom-[20px] -left-[20px] w-[80px] h-[80px] rounded-full bg-white/10"></div>
                  <div className="mb-2 relative z-10">
                    <Heart size={32} color="white" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[13px] font-semibold leading-tight text-white">
                      Sisterhood
                    </div>
                    <div className="text-[11px] mt-[3px] leading-normal text-white/70">
                      Heal together
                    </div>
                  </div>
                </div>
              </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
