import React, { useState } from 'react';
import { ChevronLeft, Search, MapPin } from 'lucide-react';

const doctors = [
  { id: 1, name: "Dr. Chioma Okonkwo", title: "Consultant Gynaecologist", conditions: "Fibroids • PCOS • Endometriosis", location: "Victoria Island, Lagos", city: "Lagos", specialty: "Gynaecology", icon: "👩‍⚕️", iconBg: "bg-[#FBCFE8]" },
  { id: 2, name: "Dr. Adaeze Nwosu", title: "Reproductive Endocrinologist", conditions: "Thyroid • Hormones • PCOS • Fertility", location: "Lekki, Lagos", city: "Lagos", specialty: "Endocrinology", icon: "👩‍⚕️", iconBg: "bg-[#FBCFE8]" },
  { id: 3, name: "Funke Adeleke", title: "Pelvic Floor Physiotherapist", conditions: "Pelvic Pain • Post-surgical Recovery • Vulvodynia", location: "Ikeja, Lagos", city: "Lagos", specialty: "Pelvic Physio", icon: "🧘‍♀️", iconBg: "bg-[#FED7AA]" },
  { id: 4, name: "Blessing Okafor", title: "Women's Health Dietitian", conditions: "Anti-inflammatory Nutrition • PCOS • Gut Health", location: "Lekki, Lagos", city: "Lagos", specialty: "Nutrition", icon: "🥗", iconBg: "bg-[#A7F3D0]" },
  { id: 5, name: "Dr. Kemi Adeyemi", title: "Clinical Psychologist", conditions: "Chronic Illness • Health anxiety • Hormonal mood disorders", location: "Surulere, Lagos", city: "Lagos", specialty: "Mental Health", icon: "🧠", iconBg: "bg-[#FBCFE8]" },
  { id: 6, name: "Dr. Ngozi Eze", title: "Consultant Gynaecologist", conditions: "Endometriosis • Fibroids • Fertility", location: "Wuse 2, Abuja", city: "Abuja", specialty: "Gynaecology", icon: "👩‍⚕️", iconBg: "bg-[#FBCFE8]" },
  { id: 7, name: "Dr. Yewande Adeola", title: "Endocrinologist & Menopause Specialist", conditions: "Perimenopause • Thyroid • Metabolic Health", location: "Maitama, Abuja", city: "Abuja", specialty: "Endocrinology", icon: "👩‍⚕️", iconBg: "bg-[#FBCFE8]" }
];

const categories = ["All", "Gynaecology", "Pelvic Physio", "Nutrition", "Endocrinology", "Mental Health"];

export default function Doctors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isNominationSubmitted, setIsNominationSubmitted] = useState(false);

  const filteredDoctors = doctors.filter(doc => {
    const matchesFilter = activeFilter === 'All' || doc.specialty === activeFilter;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.conditions.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const lagosDoctors = filteredDoctors.filter(doc => doc.city === 'Lagos');
  const abujaDoctors = filteredDoctors.filter(doc => doc.city === 'Abuja');

  const renderDoctorCards = (docs) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {docs.map(doc => (
        <div key={doc.id} className="bg-white rounded-[24px] p-5 border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex gap-4 items-start transition-shadow hover:shadow-md">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${doc.iconBg}`}>
            {doc.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#2D1B2E]">{doc.name}</h3>
            <p className="text-xs text-[#2D1B2E]/60 mt-0.5">{doc.title}</p>
            <p className="text-[10px] text-[#2D1B2E]/50 mt-1 leading-snug">{doc.conditions}</p>
            
            <div className="flex items-center gap-1 text-[10px] text-[#2D1B2E]/50 mt-2">
              <MapPin size={10} /> 
              <span>{doc.location}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3 text-[9px] font-medium">
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md">
                {doc.specialty}
              </span>
              <span className="bg-[#D1FAE5] text-[#065F46] px-2 py-1 rounded-md flex items-center gap-1">
                ✓ HerHealth Vetted
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 px-4 md:px-8 pt-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="relative">
          <button className="md:hidden w-10 h-10 bg-[#E8DCE5] text-[#2D1B2E] rounded-full flex items-center justify-center absolute left-0 top-0">
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center md:text-left pt-2 md:pt-0">
            <h1 className="text-2xl md:text-3xl text-[#2D1B2E] font-medium">
              Find a <span className="italic text-[#D4688A] font-[Fraunces,serif]">Specialist</span>
            </h1>
            <p className="text-[#2D1B2E]/60 text-sm mt-4 max-w-2xl mx-auto md:mx-0">
              Every specialist here has been personally vetted by HerHealth. We only list doctors we would send our own sisters to.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-full border border-black/5 shadow-sm px-4 py-3.5 flex items-center gap-3 mt-6">
          <Search className="text-[#2D1B2E]/40" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, specialty, or condition..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-[#2D1B2E] placeholder:text-[#2D1B2E]/40" 
          />
        </div>

        {/* Filter Chips */}
        <div className="flex overflow-x-auto gap-2 mt-6 pb-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map(filter => (
            <button 
              key={filter} 
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter 
                  ? 'bg-[#D4688A] text-white' 
                  : 'bg-white border border-black/5 text-[#2D1B2E]/70 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="mt-8">
          {filteredDoctors.length === 0 && (
            <div className="text-center py-10 text-[#2D1B2E]/60 text-sm">
              No specialists found matching your search criteria.
            </div>
          )}

          {lagosDoctors.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#2D1B2E]/60 mb-4">
                Lagos Specialists
              </h2>
              {renderDoctorCards(lagosDoctors)}
            </div>
          )}

          {abujaDoctors.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#2D1B2E]/60 mb-4">
                Abuja Specialists
              </h2>
              {renderDoctorCards(abujaDoctors)}
            </div>
          )}
        </div>

        {/* Nomination Banner */}
        <div className="mt-10 bg-gradient-to-r from-[#FDE8EE] to-[#EAE0F5] rounded-[24px] p-8 text-center relative overflow-hidden">
          
          {/* Alert Notification */}
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
              className="mt-4 border border-[#D4688A] text-[#D4688A] rounded-full px-6 py-3 text-sm font-medium hover:bg-white/50 transition bg-transparent"
            >
              Nominate a Specialist
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
