import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Video, BookOpen, CheckSquare, Stethoscope, Leaf } from "lucide-react";
import UserBookings from "../components/UserBookings";
import ResourceModal from "../components/ResourceModal";

const resources = [
  {
    icon: Video,
    title: "What Are Fibroids? Explained Simply",
    subtitle: "WHITEBOARD VIDEO",
    color: "text-[#D4688A]",
    bg: "bg-[#D4688A]/10",
    content: "Text coming soon..."
  },
  {
    icon: BookOpen,
    title: "Endometriosis: The 7-Year Wait",
    subtitle: "GUIDE",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    content: "Text coming soon..."
  },
  {
    icon: CheckSquare,
    title: "Doctor Visit Prep Checklist",
    subtitle: "FREE TOOL",
    color: "text-[#065F46]",
    bg: "bg-[#065F46]/10",
    content: "Text coming soon..."
  },
  {
    icon: Stethoscope,
    title: "Questions to Ask Your Gynaecologist",
    subtitle: "GUIDE",
    color: "text-[#D4688A]",
    bg: "bg-[#D4688A]/10",
    content: "Text coming soon..."
  },
  {
    icon: Leaf,
    title: "Anti-Inflammatory Food Guide for Nigerian Women",
    subtitle: "NUTRITION",
    color: "text-[#065F46]",
    bg: "bg-[#065F46]/10",
    content: "Text coming soon..."
  },
  {
    icon: Video,
    title: "Cycle Charting: A Practical Guide",
    subtitle: "WHITEBOARD VIDEO",
    color: "text-[#8B5CF6]",
    bg: "bg-[#8B5CF6]/10",
    content: "Text coming soon..."
  },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [selectedResource, setSelectedResource] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const [cycleData, setCycleData] = useState({
    phase: "Follicular Phase",
    day: 8,
  });

  // Get first name or default to 'SISTER', all caps
  const userName = currentUser?.displayName
    ? currentUser.displayName.split(" ")[0].toUpperCase()
    : "SISTER";

  const handleResourceClick = (resource) => {
    console.log("📍 Dashboard Card Clicked:", resource.title);
    // Map 'subtitle' to 'type' for ResourceModal compatibility
    const mappedResource = {
      ...resource,
      type: resource.subtitle
    };
    setSelectedResource(mappedResource);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedResource(null);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full flex-1 bg-[#F2E6EC]">
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

          <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-12">
            <div className="flex justify-between items-start relative z-20">
              <div className="text-[11px] tracking-[2px] uppercase text-white/35 mb-3">
                WELCOME BACK, {userName} ✦
              </div>
            </div>

            {/* We must ensure z-index is lower than the dropdown here */}
            <div className="font-fraunces text-[32px] md:text-[48px] font-extralight text-white leading-[1.25] mb-4 md:mb-6 relative z-10">
              Your body,
              <br />
              <em className="italic text-[#D4688A]">finally</em> understood.
            </div>

            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6 md:mb-10 relative z-10">
              <span className="w-2 h-2 rounded-full bg-[#D4688A] animate-pulse"></span>
              <span className="text-[12px] font-medium text-white/80 tracking-wide">
                Currently in: {cycleData.phase} • Day {cycleData.day}
              </span>
            </div>

            <div className="flex gap-2 relative z-10 flex-wrap md:mt-2">
              <div className="bg-white/5 border border-white/10 rounded-[20px] px-[14px] py-[7px] text-[12px] text-white/60 flex items-center gap-[6px]">
                <span className="text-[14px]">🌸</span> Health Navigation
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[20px] px-[14px] py-[7px] text-[12px] text-white/60 flex items-center gap-[6px]">
                <span className="text-[14px]">🏥</span> Vetted Specialists
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[20px] px-[14px] py-[7px] text-[12px] text-white/60 flex items-center gap-[6px]">
                <span className="text-[14px]">💜</span> Community
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 -mt-6 relative z-10 mb-2">
          <Link to="/tracker" className="block no-underline">
            <div className="bg-white rounded-[20px] shadow-md border border-black/5 p-4 md:p-5 flex flex-col gap-[10px] cursor-pointer hover:-translate-y-1 transition-transform">
               <div className="text-[10px] font-semibold tracking-[1.5px] text-dark-plum/60">Today's check-in</div>
               <div className="flex gap-3 items-center">
                 <div className="text-[24px]">📊</div>
                 <div className="text-[12px] text-dark-plum leading-normal max-w-lg">
                   Log your symptoms today to build your health picture. <span className="text-rose-pink font-medium">Tap to track →</span>
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
                <div className="text-[24px] mb-2 relative z-10">📋</div>
                <div className="relative z-10">
                  <div className="text-[13px] font-semibold leading-[1.3] text-white">
                    Book Session
                  </div>
                  <div className="text-[11px] mt-[3px] leading-[1.4] text-white/70">
                    Start your navigation journey
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/tracker" className="block no-underline">
              <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:shadow-card-hover bg-white border border-black/5 shadow-card text-[#2D1B2E]">
                <div className="text-[24px] mb-2">📈</div>
                <div>
                  <div className="text-[13px] font-semibold leading-[1.3] text-[#2D1B2E]">
                    Track Today
                  </div>
                  <div className="text-[11px] mt-[3px] leading-[1.4] text-[#2D1B2E]/60">
                    Log symptoms & cycle
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/discover" className="block no-underline">
              <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:scale-105 hover:shadow-card-hover bg-white border border-black/5 shadow-card text-dark-plum">
                <div className="text-[24px] mb-2">🏥</div>
                <div>
                  <div className="text-[13px] font-semibold leading-[1.3] text-dark-plum">
                    Find Specialist
                  </div>
                  <div className="text-[11px] mt-[3px] leading-[1.4] text-dark-plum/60">
                    Lagos & Abuja vetted
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/sisterhood" className="block no-underline">
              <div className="rounded-[20px] p-4 cursor-pointer transition-all duration-250 relative overflow-hidden min-h-[110px] flex flex-col justify-between hover:-translate-y-[3px] hover:scale-105 hover:shadow-card-hover bg-[#8B5CF6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]">
                <div className="absolute -bottom-[20px] -left-[20px] w-[80px] h-[80px] rounded-full bg-white/10"></div>
                <div className="text-[24px] mb-2 relative z-10">💜</div>
                <div className="relative z-10">
                  <div className="text-[13px] font-semibold leading-tight text-white">
                    Wellness Circle
                  </div>
                  <div className="text-[11px] mt-[3px] leading-normal text-white/70">
                    Heal together
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">
          <h2 className="text-2xl mb-6 text-[#2D1B2E]">
            She said{" "}
            <span className="italic text-[#D4688A] font-[Fraunces,serif]">
              it first
            </span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="bg-[#2D1B2E] rounded-[24px] p-6 md:p-8 max-w-3xl shadow-lg border border-black/5">
              <p className="text-white text-lg md:text-xl italic font-[Fraunces,serif] leading-relaxed mb-6">
                "I was 25 when I was diagnosed. Heavy bleeding, severe pain,
                constantly bloated. The nurse handed me my results with a look
                of pity. I just wanted someone to tell me I would be fine."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D4688A] flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">
                    Amara, 26 — Lagos
                  </span>
                  <span className="text-white/60 text-xs mt-0.5">
                    Fibroids diagnosed at 25
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#2D1B2E] rounded-[24px] p-6 md:p-8 max-w-3xl shadow-lg border border-black/5">
              <p className="text-white text-lg md:text-xl italic font-[Fraunces,serif] leading-relaxed mb-6">
                "My journey with HerHealth changed everything. From the first
                consultation to finding a vetted specialist, I felt seen and
                supported. My health is now a conversation, not a series of
                dismissive appointments."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#D4688A] flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  C
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-sm font-medium">
                    Chinaza, 29 — Lagos
                  </span>
                  <span className="text-white/60 text-xs mt-0.5">
                    PCOS management journey
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 pb-24">
          <h2 className="text-2xl mb-6 text-[#2D1B2E]">
            Learn &{" "}
            <span className="italic text-[#D4688A] font-[Fraunces,serif]">
              Understand
            </span>
          </h2>

          <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {resources.map((resource, index) => (
              <div
                key={index}
                onClick={() => handleResourceClick(resource)}
                className="bg-white rounded-[20px] p-5 min-w-[280px] snap-start shadow-sm border border-black/5 flex flex-col justify-between cursor-pointer hover:-translate-y-1 transition-transform pointer-events-auto relative z-10"
              >
                <div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${resource.bg} ${resource.color}`}>
                    <resource.icon size={20} />
                  </div>
                  <div className="text-[#2D1B2E] text-base font-medium mt-4 leading-snug">
                    {resource.title}
                  </div>
                </div>
                <div className="text-gray-400 uppercase text-[10px] tracking-wider mt-2 font-semibold">
                  {resource.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ResourceModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          resource={selectedResource} 
        />
      </div>
    </div>
  );
}
