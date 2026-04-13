import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Profile from '../pages/Profile';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userName = currentUser?.displayName || 'Shahil';
  const userInitial = userName[0]?.toUpperCase() || 'S';

  const navItems = [
    { icon: '🏠', label: 'HOME', path: '/dashboard' },
    { icon: '📋', label: 'BOOK', path: '/booking' },
    { icon: '📈', label: 'TRACK', path: '/tracker' },
    { icon: '🏥', label: 'DISCOVER', path: '/discover' },
    { icon: '💜', label: 'SISTERHOOD', path: '/sisterhood' },
  ];

  return (
    <>
      {/* Desktop Top Header */}
      <div className="hidden md:block sticky top-0 left-0 w-full bg-white border-b border-black/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-[90]">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-medium text-dark-plum font-[Fraunces,serif]">
            Her<span className="italic text-rose-pink">Health</span>
          </div>
          
          <div className="flex items-center gap-8">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={i} 
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 cursor-pointer transition-colors font-[Jost,sans-serif] font-semibold tracking-wider text-[13px] ${
                  isActive ? 'text-rose-pink' : 'text-dark-plum/60 hover:text-dark-plum'
                }`}
              >
                <span className="text-[18px] leading-none mb-0.5">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

          <button 
            onClick={() => setIsProfileOpen(true)}
            className="w-10 h-10 rounded-full bg-rose-pink border border-black/5 flex items-center justify-center text-white font-[Jost,sans-serif] font-semibold text-lg cursor-pointer hover:bg-rose-pink/90 transition-colors shadow-sm"
          >
            {userInitial}
          </button>
        </div>
      </div>

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 left-0 w-full h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 z-[90]">
        <div className="text-xl font-medium text-dark-plum font-[Fraunces,serif]">
          Her<span className="italic text-rose-pink">Health</span>
        </div>
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="w-10 h-10 rounded-full bg-rose-pink border border-black/5 flex items-center justify-center text-white font-[Jost,sans-serif] font-semibold text-lg cursor-pointer hover:bg-rose-pink/90 transition-colors shadow-sm"
        >
          {userInitial}
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-black/5 rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-40">
        <div className="flex items-end justify-between px-6 pt-3 pb-6 max-w-xl mx-auto">
          {navItems.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <div 
                key={i} 
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group"
              >
                <div className={`w-12 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-[#E8DCE5] text-dark-plum' : 'text-dark-plum/40 group-hover:bg-base-white group-hover:text-dark-plum/80'}`}>
                  <span className="text-[18px] leading-none">{item.icon}</span>
                </div>
                <span className={`text-[9px] font-semibold tracking-wider transition-colors ${isActive ? 'text-dark-plum' : 'text-dark-plum/40 group-hover:text-dark-plum/80'}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
