import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  
  // eslint-disable-next-line no-unused-vars
  const [cycleData, setCycleData] = useState({ phase: 'Follicular Phase', day: 8 });

  // Get first name or default to 'SISTER', all caps
  const userName = currentUser?.displayName 
    ? currentUser.displayName.split(' ')[0].toUpperCase() 
    : 'SISTER';

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Ensure scrollbar-hide if we add a global class, or just normal overflow */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        <div className="bg-ink px-[22px] md:px-20 pt-[28px] md:pt-16 pb-[32px] md:pb-20 relative overflow-hidden">
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              background: 'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(184,92,56,0.3) 0%, transparent 60%), radial-gradient(ellipse 50% 80% at 0% 100%, rgba(191,155,74,0.15) 0%, transparent 60%)' 
            }}
          />
          
          <div className="flex justify-between items-start relative z-20">
            <div className="text-[11px] tracking-[2px] uppercase text-white/35 mb-3">
              WELCOME BACK, {userName} ✦
            </div>
          </div>
          
          {/* We must ensure z-index is lower than the dropdown here */}
          <div className="font-fraunces text-[32px] md:text-[48px] font-extralight text-white leading-[1.25] mb-4 md:mb-6 relative z-10">
            Your health,<br/><em className="italic text-clay-light">finally</em> navigated.
          </div>
          
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6 md:mb-10 relative z-10">
             <span className="w-2 h-2 rounded-full bg-clay-light animate-pulse"></span>
             <span className="text-[12px] font-medium text-white/80 tracking-wide">Currently in: {cycleData.phase} • Day {cycleData.day}</span>
          </div>
          
          <div className="flex gap-2 relative z-10 flex-wrap md:mt-2">
            <div className="bg-white/5 border border-white/10 rounded-[20px] px-[14px] py-[7px] text-[12px] text-white/60 flex items-center gap-[6px]">
              <span className="text-[14px]">📋</span> Navigation
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[20px] px-[14px] py-[7px] text-[12px] text-white/60 flex items-center gap-[6px]">
              <span className="text-[14px]">🏥</span> Specialists
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[20px] px-[14px] py-[7px] text-[12px] text-white/60 flex items-center gap-[6px]">
              <span className="text-[14px]">🌿</span> Wellness
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-[10px] md:gap-6 px-[18px] md:px-20 py-[22px] md:py-12 relative z-0">
          
          <Link to="/booking" className="block no-underline">
            <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:shadow-card-hover bg-clay text-white shadow-[0_4px_20px_rgba(184,92,56,0.3)]">
              <div className="absolute -top-[20px] -right-[20px] w-[80px] h-[80px] rounded-full bg-white/10"></div>
              <div className="text-[24px] mb-2 relative z-10">📋</div>
              <div className="relative z-10">
                <div className="text-[13px] font-semibold leading-[1.3] text-white">Book Session</div>
                <div className="text-[11px] mt-[3px] leading-[1.4] text-white/70">Start your navigation journey</div>
              </div>
            </div>
          </Link>

          <Link to="/tracker" className="block no-underline">
            <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:shadow-card-hover bg-base-white border border-clay/10 shadow-card text-ink">
              <div className="text-[24px] mb-2">📈</div>
              <div>
                <div className="text-[13px] font-semibold leading-[1.3] text-ink">Track Today</div>
                <div className="text-[11px] mt-[3px] leading-[1.4] text-dust">Log today's experience</div>
              </div>
            </div>
          </Link>

          <Link to="/directory" className="block no-underline">
            <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:shadow-card-hover bg-base-white border border-clay/10 shadow-card text-ink">
              <div className="text-[24px] mb-2">🏥</div>
              <div>
                <div className="text-[13px] font-semibold leading-[1.3] text-ink">Find Specialist</div>
                <div className="text-[11px] mt-[3px] leading-[1.4] text-dust">Lagos & Abuja vetted</div>
              </div>
            </div>
          </Link>

          <Link to="/wellness" className="block no-underline">
            <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:shadow-card-hover bg-moss text-white shadow-[0_4px_20px_rgba(74,103,65,0.3)]">
              <div className="absolute -bottom-[20px] -left-[20px] w-[80px] h-[80px] rounded-full bg-white/10"></div>
              <div className="text-[24px] mb-2 relative z-10">🌿</div>
              <div className="relative z-10">
                <div className="text-[13px] font-semibold leading-[1.3] text-white">Wellness Circle</div>
                <div className="text-[11px] mt-[3px] leading-[1.4] text-white/70">Heal together</div>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
