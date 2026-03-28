import { useState } from 'react';
import { ChevronLeft, ClipboardList, Heart, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function BookingWizard() {
  // eslint-disable-next-line no-unused-vars
  const [step, setStep] = useState(1);

  return (
    /* Outer background filling the screen */
    <div className="min-h-screen bg-[#FAF9F6] px-4 pt-6 pb-32 md:p-8 lg:p-12">
      
      {/* Main Split-Card Container */}
      <div className="w-full max-w-6xl mx-auto bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 overflow-hidden flex flex-col lg:flex-row">

        {/* ========================================= */}
        {/* LEFT COLUMN: The Booking Wizard (Flex-1)  */}
        {/* ========================================= */}
        <div className="flex-1 p-6 md:p-10 lg:p-14">
          
          {/* Mobile Header with Back Button (Hidden on Desktop) */}
          <div className="flex items-center justify-center relative h-10 mb-2 md:hidden">
            <button className="bg-[#E8DCE5] text-[#2D1B2E] w-10 h-10 rounded-full flex items-center justify-center shrink-0 absolute left-0 transition-transform active:scale-95">
              <ChevronLeft size={20} />
            </button>
            <h1 className="w-full text-center text-xl font-medium text-[#2D1B2E]">
              Book a <span className="text-[#D4688A] italic font-[Fraunces,serif]">Session</span>
            </h1>
          </div>

          {/* Desktop Header */}
          <h1 className="hidden md:block text-3xl lg:text-4xl font-medium text-[#2D1B2E]">
            Book a <span className="text-[#D4688A] italic font-[Fraunces,serif]">Session</span>
          </h1>

          {/* Progress Bar & Step Header */}
          <div className="h-1.5 w-full bg-[#E8DCE5] mt-6 md:mt-10 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-[#8B5CF6] rounded-full transition-all duration-500"></div>
          </div>
          
          <p className="uppercase tracking-[0.15em] text-[11px] text-[#2D1B2E]/60 mt-5 font-bold">
            STEP 1 OF 3
          </p>
          
          <h2 className="text-2xl md:text-3xl font-bold mt-2 text-[#2D1B2E]">
            Choose your <span className="text-[#D4688A] italic font-[Fraunces,serif]">package</span>
          </h2>
          
          <p className="text-sm md:text-base text-[#2D1B2E]/60 mb-8 mt-2">
            Every session is with a trained HerHealth Navigator — not a bot.
          </p>

          {/* Package Cards */}
          <div className="space-y-4 md:space-y-5">
            {/* Card 1 */}
            <div className="bg-white rounded-[24px] p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:border-[#D4688A] hover:shadow-[0_4px_20px_rgba(212,104,138,0.15)] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-[#FBCFE8] text-[#BE185D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                  <h3 className="font-semibold text-[#2D1B2E] text-lg md:text-xl">Navigation Session</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[#D4688A] font-bold text-lg">₦35,000</span>
                    <span className="bg-[#D1FAE5] text-[#065F46] text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">Most Popular</span>
                  </div>
                </div>
                <p className="text-[#2D1B2E]/60 text-sm mt-2 leading-relaxed">
                  60-min deep dive into your symptoms, medical history and concerns. Leaves with a personalised action plan and doctor prep guide.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[24px] p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:border-[#D4688A] hover:shadow-[0_4px_20px_rgba(212,104,138,0.15)] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-[#DDD6FE] text-[#7C3AED] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                  <h3 className="font-semibold text-[#2D1B2E] text-lg md:text-xl">Care Bundle</h3>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2D1B2E] text-lg group-hover:text-[#D4688A] transition-colors">₦75,000</span>
                    <span className="bg-[#D1FAE5] text-[#065F46] text-[10px] md:text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">Save ₦30k</span>
                  </div>
                </div>
                <p className="text-[#2D1B2E]/60 text-sm mt-2 leading-relaxed">
                  3 sessions over 4 weeks. Includes symptom tracking review, specialist referrals, and ongoing WhatsApp support between sessions.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[24px] p-5 md:p-6 border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer hover:border-[#D4688A] hover:shadow-[0_4px_20px_rgba(212,104,138,0.15)] transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-[#A7F3D0] text-[#047857] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2">
                  <h3 className="font-semibold text-[#2D1B2E] text-lg md:text-xl">Follow-Up Session</h3>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#2D1B2E] text-lg group-hover:text-[#D4688A] transition-colors">₦25,000</span>
                  </div>
                </div>
                <p className="text-[#2D1B2E]/60 text-sm mt-2 leading-relaxed">
                  30-min check-in for existing clients. Review progress, update your health journal, and plan next steps.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* RIGHT COLUMN: Info Panel (Desktop Sidebar)*/}
        {/* ========================================= */}
        <div className="bg-[#FFF5F8] lg:w-[420px] p-6 md:p-10 lg:p-14 border-t lg:border-t-0 lg:border-l border-[#FEE2E2] flex flex-col justify-between">
          
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-[#2D1B2E] mb-8">
              Why book with <span className="italic text-[#D4688A] font-[Fraunces,serif]">HerHealth?</span>
            </h3>
            
            <ul className="space-y-6 md:space-y-8">
              <li className="flex gap-4">
                <CheckCircle2 className="text-[#D4688A] shrink-0 mt-0.5" size={22} />
                <div>
                  <h4 className="font-semibold text-[#2D1B2E] text-base">Expert Navigators</h4>
                  <p className="text-sm text-[#2D1B2E]/70 mt-1 leading-relaxed">Speak directly with trained professionals who understand African women's health nuances.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="text-[#D4688A] shrink-0 mt-0.5" size={22} />
                <div>
                  <h4 className="font-semibold text-[#2D1B2E] text-base">Actionable Care Plans</h4>
                  <p className="text-sm text-[#2D1B2E]/70 mt-1 leading-relaxed">Leave every session with clear next steps, dietary guides, and doctor prep checklists.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="text-[#D4688A] shrink-0 mt-0.5" size={22} />
                <div>
                  <h4 className="font-semibold text-[#2D1B2E] text-base">Safe & Confidential</h4>
                  <p className="text-sm text-[#2D1B2E]/70 mt-1 leading-relaxed">Your health data is entirely yours. We provide a judgment-free space to discuss your body.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Moved Disclaimer to the bottom of the Info Panel */}
          <div className="mt-12 lg:mt-16 bg-white/60 rounded-[20px] p-5 border border-[#FEE2E2]">
            <p className="text-[#D4688A] text-xs leading-relaxed font-medium">
              <span className="font-bold flex items-center gap-1.5 mb-1.5 text-sm">
                <ShieldCheck size={16}/> Please note
              </span>
              HerHealth provides health navigation and advocacy support only. We do not diagnose, prescribe or treat. We connect you with the right specialists.
            </p>
          </div>
          
        </div>

      </div>
    </div>
  );
}