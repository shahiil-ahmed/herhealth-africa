import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, Sparkles, User, Bell, Calendar, 
  Lock, LogOut, ChevronRight
} from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';
import NotificationSettingsModal from '../components/NotificationSettingsModal';
import CycleSettingsModal from '../components/CycleSettingsModal';
import PrivacyDataModal from '../components/PrivacyDataModal';
import { db } from '../firebase/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Profile({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid, 'profile', 'data'), 
      (doc) => {
        if (doc.exists()) {
          setProfileData(doc.data());
        }
      },
      (error) => {
        console.error("Error in Profile listener:", error);
        if (error.code === 'permission-denied') {
          unsubscribe();
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const userName = profileData?.fullName || currentUser?.displayName || 'Shahil';
  const userInitial = userName[0]?.toUpperCase() || 'S';
  const userEmail = currentUser?.email || 'member@herhealth.com';

  async function handleLogout() {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <>
      {/* Dark Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* Side Drawer Panel */}
      <div 
      className={`fixed top-0 right-0 h-full w-full max-w-md pb-24 bg-petal font-[Jost,sans-serif] shadow-[-10px_0_40px_rgba(0,0,0,0.08)] overflow-y-auto overscroll-contain transform-gpu [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transform transition-transform duration-300 ease-in-out z-[100] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 pt-10 pb-6">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-rose-pink flex items-center justify-center text-white transition-transform active:scale-95 shadow-sm border border-black/5 hover:bg-rose-pink/90"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-medium text-dark-plum absolute left-1/2 -translate-x-1/2">
            Your <span className="italic text-rose-pink font-[Fraunces,serif]">Profile</span>
          </h1>
          <div className="w-10"></div>
        </div>

        <div className="px-6 space-y-6">
          <div className="bg-dark-plum rounded-[24px] p-6 flex items-center gap-4 shadow-lg shadow-black/5">
            <div className="w-16 h-16 shrink-0 rounded-full bg-rose-pink flex items-center justify-center text-white text-2xl font-semibold">
              {userInitial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-white text-xl font-semibold truncate">{userName}</h2>
                <Sparkles size={16} className="text-rose-pink shrink-0" />
              </div>
              <p className="text-white/60 text-sm mt-0.5 truncate">{userEmail}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '0', label: 'Days Logged' },
              { value: '0', label: 'Day Streak' },
              { value: '1', label: 'Member Since' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-[20px] p-4 text-center shadow-sm border border-black/5 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold text-rose-pink font-[Fraunces,serif]">{stat.value}</div>
                <div className="text-[10px] tracking-wider text-dark-plum font-medium mt-1 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-medium text-dark-plum mb-4">
              Account <span className="italic text-rose-pink font-[Fraunces,serif]">Settings</span>
            </h3>
            <div className="space-y-3">
              {[
                { icon: User, title: 'Edit Profile', desc: 'Name, photo, health goals' },
                { icon: Bell, title: 'Notifications', desc: 'Daily reminders & updates' },
                { icon: Calendar, title: 'Cycle Settings', desc: 'Period length, cycle length' },
                { icon: Lock, title: 'Privacy & Data', desc: 'Your health data is yours' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  onClick={
                    item.title === 'Edit Profile' ? () => setIsEditModalOpen(true) : 
                    item.title === 'Notifications' ? () => setIsNotificationModalOpen(true) : 
                    item.title === 'Cycle Settings' ? () => setIsCycleModalOpen(true) :
                    item.title === 'Privacy & Data' ? () => setIsPrivacyModalOpen(true) :
                    undefined
                  }
                  className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-black/5 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-base-white flex items-center justify-center text-dark-plum shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-dark-plum truncate">{item.title}</div>
                    <div className="text-xs text-dark-plum/50 mt-0.5 truncate">{item.desc}</div>
                  </div>
                  <ChevronRight size={18} className="text-dark-plum/30 shrink-0" />
                </div>
              ))}
              
              <div 
                onClick={handleLogout}
                className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm border border-black/5 cursor-pointer active:scale-[0.98] transition-transform mt-2"
              >
                <div className="w-10 h-10 rounded-full bg-base-white flex items-center justify-center text-rose-pink shrink-0">
                  <LogOut size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-rose-pink truncate">Sign Out</div>
                  <div className="text-xs text-dark-plum/50 mt-0.5 truncate">See you soon 🌸</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
      <NotificationSettingsModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />
      <CycleSettingsModal 
        isOpen={isCycleModalOpen} 
        onClose={() => setIsCycleModalOpen(false)} 
      />
      <PrivacyDataModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
    </>
  );
}
