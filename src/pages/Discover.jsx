import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Send, Stethoscope, ChevronDown, Heart } from 'lucide-react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';


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
  const { currentUser } = useAuth();
  const [specialists, setSpecialists] = useState([]);
  const [isNominationSubmitted, setIsNominationSubmitted] = useState(false);
  const [nomination, setNomination] = useState({ doctorName: '', details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nominationError, setNominationError] = useState("");
  const [showReviews, setShowReviews] = useState(false);
  


  useEffect(() => {
    console.log("🚀 Discover Component Mounted - Port 5173 Check");
    const unsubscribe = onSnapshot(
      collection(db, 'specialists'), 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSpecialists(data);
      },
      (error) => {
        console.error("Error in Discover specialists listener:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleNominate = async (e) => {
    e.preventDefault();
    if (!nomination.doctorName || !nomination.details) return;
    
    setIsSubmitting(true);
    setNominationError("");
    try {
      await addDoc(collection(db, 'nominations'), {
        doctorName: nomination.doctorName,
        details: nomination.details,
        submittedBy: currentUser?.uid || "anonymous",
        createdAt: serverTimestamp()
      });
      setIsNominationSubmitted(true);
      setNomination({ doctorName: '', details: '' });
      
      // Reset logic: Clear result banner after 5 seconds
      setTimeout(() => {
        setIsNominationSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting nomination:", error);
      setNominationError("Failed to submit nomination. Please try again. 🌸");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-petal pb-24 px-4 pt-6">
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



        {/* Directory Section */}
        <div className="flex flex-col items-start mt-16 mb-6 px-4 md:px-0">
          <h2 className="text-[11px] font-bold tracking-[2px] text-dark-plum/60 px-1">
            Specialist directory
          </h2>
        </div>

        {/* Dynamic Category Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 md:gap-y-6">
          {categories.map((cat, i) => {
            const matchedSpecialists = specialists.filter(s => 
              s.category === cat.name
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

        {/* Community Testimonials Accordion */}
        <div className="mt-12 bg-white rounded-[24px] border border-[#FFE8EF] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
          <button 
            onClick={() => setShowReviews(!showReviews)}
            className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#FAF9F6] transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-pink/10 flex items-center justify-center text-rose-pink shrink-0">
                <Heart size={18} className="fill-rose-pink/20" />
              </div>
              <div>
                <h3 className="font-semibold text-dark-plum text-sm md:text-base">Sister Testimonials</h3>
                <p className="text-xs text-dark-plum/50 mt-0.5">Read real stories from our community</p>
              </div>
            </div>
            <ChevronDown 
              size={20} 
              className={`text-dark-plum/60 transition-transform duration-300 shrink-0 ${showReviews ? 'rotate-180' : ''}`} 
            />
          </button>
          
          {showReviews && (
            <div className="px-6 pb-6 pt-2 border-t border-[#FFE8EF]/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid md:grid-cols-2 gap-6 items-start mt-4">
                {/* Amara Review */}
                <div className="bg-[#2D1B2E] rounded-[20px] p-6 shadow-md border border-black/5 hover:scale-[1.01] transition-transform">
                  <p className="text-white text-sm md:text-base italic font-[Fraunces,serif] leading-relaxed mb-6">
                    "I was 25 when I was diagnosed. Heavy bleeding, severe pain,
                    constantly bloated. The nurse handed me my results with a look
                    of pity. I just wanted someone to tell me I would be fine."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4688A] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      A
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-semibold">
                        Amara, 26 — Lagos
                      </span>
                      <span className="text-white/60 text-[10px] mt-0.5">
                        Fibroids diagnosed at 25
                      </span>
                    </div>
                  </div>
                </div>

                {/* Janet Review */}
                <div className="bg-[#2D1B2E] rounded-[20px] p-6 shadow-md border border-black/5 hover:scale-[1.01] transition-transform">
                  <p className="text-white text-sm md:text-base italic font-[Fraunces,serif] leading-relaxed mb-6">
                    "My journey with HerHealth changed everything. From the first
                    consultation to finding a vetted specialist, I felt seen and
                    supported. My health is now a conversation, not a series of
                    dismissive appointments."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4688A] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      J
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-semibold">
                        Janet, 29 — Lagos
                      </span>
                      <span className="text-white/60 text-[10px] mt-0.5">
                        PCOS management journey
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nomination Form Section */}
        <div className="mt-16 bg-white rounded-[32px] shadow-sm border border-black/5 relative overflow-hidden text-center md:text-left transition-all duration-500 min-h-[200px]">
          {/* Success Banner */}
          <div 
            className={`absolute top-0 left-0 right-0 w-full bg-emerald-500 text-white text-[10px] md:text-xs py-4 px-6 font-bold tracking-[2px] transition-all duration-500 z-20 rounded-t-[32px] flex items-center justify-center md:justify-start ${
              isNominationSubmitted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
          >
            <span className="flex items-center gap-2">
              Thank you! We will look into this specialist. 🌸
            </span>
          </div>

          {/* Error Banner */}
          <div 
            className={`absolute top-0 left-0 right-0 w-full bg-rose-500 text-white text-[10px] md:text-xs py-4 px-6 font-bold tracking-[2px] transition-all duration-500 z-20 rounded-t-[32px] flex items-center justify-center md:justify-start ${
              nominationError ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
          >
            <span className="flex items-center gap-2">
              {nominationError}
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
                  placeholder="Reason or details (e.g. Clinic name)"
                  className="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-rose-pink transition-all"
                  value={nomination.details}
                  onChange={(e) => setNomination({...nomination, details: e.target.value})}
                />
              </div>
              <div className="flex flex-col justify-end">
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-rose-pink text-white rounded-xl px-6 py-4 text-sm font-bold tracking-widest hover:bg-[#BE185D] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
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


      </div>
    </div>
  );
}

