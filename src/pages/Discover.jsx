import React, { useState } from 'react';
import { ChevronLeft, Search, Video, BookOpen, Clock } from 'lucide-react';

const resources = [
  { title: "What Are Fibroids?", type: "WHITEBOARD VIDEO", icon: Video },
  { title: "Endometriosis: The 7-Year Wait", type: "GUIDE", icon: BookOpen },
  { title: "Questions to Ask Your Gynaecologist", type: "GUIDE", icon: BookOpen }
];

const categories = [
  { name: "Gynaecology", icon: "👩‍⚕️", iconBg: "bg-[#FBCFE8]" },
  { name: "Endocrinology", icon: "🦋", iconBg: "bg-[#FBCFE8]" },
  { name: "Pelvic Physio", icon: "🧘‍♀️", iconBg: "bg-[#FED7AA]" },
  { name: "Nutrition", icon: "🥗", iconBg: "bg-[#A7F3D0]" },
  { name: "Mental Health", icon: "🧠", iconBg: "bg-[#E9D5FF]" }
];

export default function Discover() {
  const [activeLocation, setActiveLocation] = useState('All');
  const [isNominationSubmitted, setIsNominationSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#F2E6EC] pb-24 px-4 md:px-8 pt-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="relative">
          <button className="md:hidden w-10 h-10 bg-[#E8DCE5] text-[#2D1B2E] rounded-full flex items-center justify-center absolute left-0 top-0">
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center md:text-left pt-2 md:pt-0">
            <h1 className="text-2xl md:text-3xl font-medium text-[#2D1B2E]">
              Dis<span className="italic text-[#D4688A] font-[Fraunces,serif]">cover</span>
            </h1>
            <p className="text-[#2D1B2E]/60 text-sm mt-2 max-w-2xl mx-auto md:mx-0">
              Directory and resources in one safe place.
            </p>
          </div>
        </div>

        {/* Educational Resources Section */}
        <h2 className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#2D1B2E]/60 mb-4 mt-8">
          Learn & Understand
        </h2>
        <div 
          className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {resources.map((res, i) => {
            const Icon = res.icon;
            return (
              <div 
                key={i} 
                className="bg-white rounded-[20px] p-5 min-w-[260px] snap-start shadow-sm border border-black/5 flex flex-col justify-between cursor-pointer transition-shadow hover:shadow-md"
              >
                <div className="text-[#2D1B2E]">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <div className="mt-8">
                  <h3 className="font-semibold text-[#2D1B2E] leading-tight">{res.title}</h3>
                  <p className="text-[10px] text-[#2D1B2E]/50 tracking-[1.5px] uppercase mt-2 font-semibold">
                    {res.type}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Directory & Filters Section */}
        <h2 className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#2D1B2E]/60 mb-4 mt-8">
          Specialist Directory
        </h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {['All', 'Lagos', 'Abuja', 'Online'].map(loc => (
            <button
              key={loc}
              onClick={() => setActiveLocation(loc)}
              className={`rounded-full px-5 py-2 text-sm font-medium cursor-pointer transition-colors ${
                activeLocation === loc 
                  ? 'bg-[#D4688A] text-white' 
                  : 'bg-white border border-black/5 text-[#2D1B2E]/70 hover:bg-gray-50'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Placeholder Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {categories.map((cat, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm rounded-[24px] p-5 border border-dashed border-[#D4688A]/30 flex gap-4 items-start hover:bg-white transition-colors cursor-default">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${cat.iconBg}`}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#2D1B2E]">{cat.name}</h3>
                <p className="text-xs text-[#2D1B2E]/60 mt-1.5 leading-relaxed">
                  We are currently vetting top specialists in this field to ensure they meet the HerHealth standard.
                </p>
                <div className="bg-[#F2E6EC] text-[#D4688A] text-[10px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 mt-3 w-fit">
                  <Clock size={12} /> Vetting in progress
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nomination Banner */}
        <div className="mt-10 bg-gradient-to-r from-[#FDE8EE] to-[#EAE0F5] rounded-[24px] p-8 text-center relative overflow-hidden">
          
          <div 
            className={`absolute top-0 left-0 w-full bg-[#D1FAE5] text-[#065F46] text-sm py-2 font-medium transition-transform duration-300 ${
              isNominationSubmitted ? 'translate-y-0' : '-translate-y-full'
            }`}
          >
            Thank you! We'll review your nomination 🌸
          </div>

          <div className="pt-2">
            <h2 className="text-lg font-medium text-[#2D1B2E]">Know a specialist we should vet?</h2>
            <p className="text-[#2D1B2E]/60 text-sm mt-2">We're always expanding. Nominate a doctor you trust.</p>
            <button 
              onClick={() => {
                setIsNominationSubmitted(true);
                setTimeout(() => setIsNominationSubmitted(false), 3000);
              }}
              className="mt-4 border border-[#D4688A] text-[#D4688A] rounded-full px-6 py-3 text-sm font-medium hover:bg-white/50 transition bg-transparent cursor-pointer"
            >
              Nominate a Specialist
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
