import React, { useState, useEffect } from 'react';
import { ChevronLeft, Video, BookOpen, Clock, MapPin, Send, PlayCircle, HelpCircle, FileText, CheckSquare, ChevronRight, Stethoscope } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import ResourceModal from '../components/ResourceModal';

const resources = [
  { 
    title: "What Are Fibroids?", 
    type: "Whiteboard video", 
    icon: PlayCircle, 
    description: "Click to learn more about this topic and find helpful health navigation resources.",
    content: "Text coming soon..." 
  },
  { 
    title: "Endometriosis: The 7-Year Wait", 
    type: "Guide", 
    icon: BookOpen, 
    description: "Click to learn more about this topic and find helpful health navigation resources.",
    content: "Text coming soon..." 
  },
  { 
    title: "Questions to Ask Your Gynaecologist", 
    type: "Guide", 
    icon: HelpCircle, 
    description: "Click to learn more about this topic and find helpful health navigation resources.",
    content: "Text coming soon..." 
  },
  { 
    title: "PCOS: Beyond the Name", 
    type: "Guide", 
    icon: FileText, 
    description: "Click to learn more about this topic and find helpful health navigation resources.",
    content: "Text coming soon..." 
  },
  { 
    title: "Fertility Myths vs Facts", 
    type: "Guide", 
    icon: CheckSquare, 
    description: "Click to learn more about this topic and find helpful health navigation resources.",
    content: "Text coming soon..." 
  },
  { 
    title: "Period Poverty in Africa", 
    type: "Guide", 
    icon: BookOpen, 
    description: "Click to learn more about this topic and find helpful health navigation resources.",
    content: "Text coming soon..." 
  }
];

const categories = [
  { name: "Gynaecology", icon: "👩‍⚕️", iconBg: "bg-[#FBCFE8]" },
  { name: "Endocrinology", icon: "🦋", iconBg: "bg-[#FBCFE8]" },
  { name: "Pelvic Physio", icon: "🧘‍♀️", iconBg: "bg-[#FED7AA]" },
  { name: "Nutrition", icon: "🥗", iconBg: "bg-[#A7F3D0]" },
  { name: "Mental Health", icon: "🧠", iconBg: "bg-[#E9D5FF]" }
];

const SpecialistCard = ({ name, specialty, location }) => (
  <div className="bg-white rounded-[24px] p-5 shadow-sm border border-[#FFE8EF] flex gap-4 items-start hover:shadow-md transition-all group animate-in fade-in zoom-in-95 duration-300">
    <div className="w-12 h-12 rounded-2xl bg-rose-pink flex items-center justify-center text-white font-semibold text-lg shrink-0 group-hover:scale-110 transition-transform">
      <Stethoscope size={24} strokeWidth={1.5} />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-dark-plum text-[15px]">{name}</h3>
      <p className="text-xs text-rose-pink font-bold mt-0.5 tracking-wide">{specialty}</p>
      <div className="flex items-center gap-1.5 mt-3 text-dark-plum/40 text-[10px] font-bold tracking-wider">
        <MapPin size={12} className="text-rose-pink/50" /> {location}
      </div>
    </div>
  </div>
);

export default function Discover() {
  const [activeLocation, setActiveLocation] = useState('All');
  const [specialists, setSpecialists] = useState([]);
  const [isNominationSubmitted, setIsNominationSubmitted] = useState(false);
  const [nomination, setNomination] = useState({ doctorName: '', clinicName: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal state management
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log("🚀 Discover Component Mounted - Port 5173 Check");
    const unsubscribe = onSnapshot(collection(db, 'specialists'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSpecialists(data);
    });
    return () => unsubscribe();
  }, []);

  const handleNominate = async (e) => {
    e.preventDefault();
    if (!nomination.doctorName || !nomination.clinicName) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'nominations'), {
        ...nomination,
        createdAt: serverTimestamp()
      });
      setIsNominationSubmitted(true);
      
      // Reset logic: Clear form and result after 5 seconds
      setTimeout(() => {
        setIsNominationSubmitted(false);
        setNomination({ doctorName: '', clinicName: '' });
      }, 5000);
    } catch (error) {
      console.error("Error submitting nomination:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResourceClick = (resource) => {
    console.log("📍 Card Clicked:", resource.title);
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Delay clearing the resource object until animation finishes (300ms)
    setTimeout(() => {
      setSelectedResource(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F2E6EC] pb-24 px-4 pt-6">
      <div className="max-w-6xl mx-auto px-2 md:px-0">
        
        {/* Header Section */}
        <div className="relative">
          <button className="md:hidden w-10 h-10 bg-rose-pink text-white rounded-full flex items-center justify-center absolute left-0 top-0 shadow-sm border border-black/5 hover:bg-rose-pink/90 transition-colors">
            <ChevronLeft size={20} />
          </button>
          
          <div className="text-center md:text-left pt-2 md:pt-0">
            <h1 className="text-2xl md:text-3xl font-medium text-dark-plum">
              Dis<span className="italic text-rose-pink font-[Fraunces,serif]">cover</span>
            </h1>
            <p className="text-dark-plum/60 text-sm mt-2 max-w-2xl mx-auto md:mx-0">
              Directory and resources in one safe place.
            </p>
          </div>
        </div>

        {/* Educational Resources Section - Learn & Understand */}
        <div className="mt-8">
          <h2 className="text-[11px] font-bold tracking-[1.5px] text-dark-plum/60 mb-4 px-2 md:px-0">
            Learn & understand
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 px-2 md:px-0">
            {resources.map((res, i) => {
              const Icon = res.icon;
              return (
                <div 
                  key={i} 
                  onClick={() => handleResourceClick(res)}
                  className="bg-white rounded-[20px] p-6 shadow-sm border border-black/5 flex flex-col justify-between cursor-pointer pointer-events-auto transition-all hover:bg-[#FFF5F8] hover:shadow-md hover:scale-[1.01] active:scale-95 group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="text-rose-pink group-hover:scale-110 transition-transform">
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <ChevronRight size={18} className="text-rose-pink/40 group-hover:text-rose-pink transition-colors" />
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="font-semibold text-dark-plum leading-tight text-[15px]">{res.title}</h3>
                    <p className="text-[11px] text-dark-plum/50 mt-1 line-clamp-2">
                      {res.description}
                    </p>
                    <p className="text-[10px] text-rose-pink tracking-tight mt-3 font-bold">
                      {res.type}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Directory & Filters Section */}
        <div className="flex flex-col items-start mt-20 mb-10 px-4 md:px-0">
          <h2 className="text-[11px] font-bold tracking-[2px] text-dark-plum/60 mb-6 px-1">
            Specialist directory
          </h2>
          
          <div className="flex flex-nowrap overflow-x-auto justify-start gap-3 w-full pb-4 scrollbar-hide [&::-webkit-scrollbar]:hidden px-1">
            {['All', 'Lagos', 'Abuja', 'Online'].map(loc => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={`rounded-full px-6 py-2.5 text-[12px] font-bold tracking-wide transition-all whitespace-nowrap ${
                  activeLocation === loc 
                    ? 'bg-rose-pink text-white shadow-md' 
                    : 'bg-white/50 border border-black/5 text-dark-plum/60 hover:bg-white hover:text-dark-plum'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Category Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 md:gap-y-6">
          {categories.map((cat, i) => {
            const matchedSpecialists = specialists.filter(s => 
              s.category === cat.name && 
              (activeLocation === 'All' || s.location === activeLocation)
            );

            if (matchedSpecialists.length > 0) {
              return matchedSpecialists.map(spec => (
                <SpecialistCard key={spec.id} {...spec} />
              ));
            }

            return (
              <div key={i} className="bg-white/40 backdrop-blur-sm rounded-[24px] p-5 border border-[#FFE8EF] flex gap-4 items-start group hover:bg-white/60 transition-colors min-h-[160px]">
                <div className="w-12 h-12 rounded-2xl bg-rose-pink flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Stethoscope size={24} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-dark-plum opacity-60 text-[15px]">{cat.name}</h3>
                  <p className="text-[11px] text-dark-plum/40 mt-1.5 leading-relaxed">
                    We are personally vetting every specialist before they appear here.
                  </p>
                  <div className="bg-rose-pink/5 text-rose-pink text-[9px] px-2 py-1 rounded-md font-bold tracking-widest flex items-center gap-1.5 mt-3 w-fit border border-rose-pink/10">
                    <span>⏳ Vetting in progress</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nomination Form Section */}
        <div className="mt-16 bg-white rounded-[32px] shadow-sm border border-black/5 relative overflow-hidden text-center md:text-left transition-all duration-500 min-h-[200px]">
          {/* Success Banner */}
          <div 
            className={`absolute top-0 left-0 right-0 w-full bg-emerald-500 text-white text-[10px] md:text-xs py-4 px-6 font-bold uppercase tracking-[2px] transition-all duration-500 z-20 rounded-t-[32px] flex items-center justify-center md:justify-start ${
              isNominationSubmitted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
          >
            <span className="flex items-center gap-2">
              Nomination Received • Thank you 🌸
            </span>
          </div>

          <div className="p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-center">
            <div className="max-w-md">
              <h2 className="text-2xl font-medium text-dark-plum">Know a specialist we should vet?</h2>
              <p className="text-dark-plum/60 text-sm mt-3 leading-relaxed">
                HerHealth is built on trust. If you've had a great experience with a doctor, nominate them to join our curated directory.
              </p>
            </div>
            
            <form onSubmit={handleNominate} className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <input 
                  required
                  type="text" 
                  placeholder="Doctor's Full Name"
                  className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-rose-pink transition-all"
                  value={nomination.doctorName}
                  onChange={(e) => setNomination({...nomination, doctorName: e.target.value})}
                />
                <input 
                  required
                  type="text" 
                  placeholder="Clinic or Hospital Name"
                  className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-rose-pink transition-all"
                  value={nomination.clinicName}
                  onChange={(e) => setNomination({...nomination, clinicName: e.target.value})}
                />
              </div>
              <div className="flex flex-col justify-end">
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-rose-pink text-white rounded-xl px-6 py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#BE185D] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isSubmitting ? 'Submitting...' : (
                    <>
                      Nominate Specialist <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Integration */}
        <ResourceModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          resource={selectedResource} 
        />

      </div>
    </div>
  );
}

