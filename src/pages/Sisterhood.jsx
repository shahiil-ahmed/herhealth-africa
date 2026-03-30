import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Leaf, Activity, Moon, RefreshCw, Send, Heart } from 'lucide-react';

const Sisterhood = () => {
  const [activeCircle, setActiveCircle] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const [wins, setWins] = useState([
    { id: 1, initial: 'A', text: 'My cycle finally returned after 6 months!', likes: 12 },
    { id: 2, initial: 'E', text: 'Managed to sleep 8 hours without waking up to pee.', likes: 8 }
  ]);

  const [messages, setMessages] = useState({
    'Anti-Inflammatory Living': [{ id: 1, initial: 'C', text: 'Has anyone tried cutting out dairy? Did it help with bloating?', time: '10:42 AM' }],
    'Movement and Energy': [],
    'Rest and Stress': [],
    'Cycle Awareness': []
  });

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => ({
      ...prev,
      [activeCircle]: [
        ...(prev[activeCircle] || []),
        {
          id: Date.now(),
          initial: 'Me',
          text: newMessage,
          time: timeString
        }
      ]
    }));
    setNewMessage('');
  };

  const circles = [
    { name: 'Anti-Inflammatory Living', icon: Leaf, bg: 'bg-[#A7F3D0]/30', color: 'text-[#065F46]' },
    { name: 'Movement and Energy', icon: Activity, bg: 'bg-[#FED7AA]/30', color: 'text-[#9A3412]' },
    { name: 'Rest and Stress', icon: Moon, bg: 'bg-[#E9D5FF]/30', color: 'text-[#6B21A8]' },
    { name: 'Cycle Awareness', icon: RefreshCw, bg: 'bg-[#FBCFE8]/30', color: 'text-[#BE185D]' }
  ];

  if (activeCircle === null) {
    return (
      <div className="min-h-screen bg-[#F2E6EC] pb-24 px-4 pt-6 max-w-2xl mx-auto">
        <h1 className="text-3xl font-medium text-[#2D1B2E] mb-2">
          The <span className="italic text-[#D4688A] font-[Fraunces,serif]">Sisterhood</span>
        </h1>
        <p className="text-[#2D1B2E]/60 text-sm mb-8">A safe, anonymous space to heal together.</p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {circles.map(circle => {
            const Icon = circle.icon;
            return (
              <div 
                key={circle.name}
                onClick={() => setActiveCircle(circle.name)}
                className="bg-white rounded-[24px] p-5 shadow-sm border border-black/5 flex flex-col items-center text-center cursor-pointer hover:shadow-md transition-all active:scale-95"
              >
                <div className={`w-12 h-12 rounded-full ${circle.bg} ${circle.color} flex items-center justify-center mb-3`}>
                  <Icon size={24} />
                </div>
                <span className="font-semibold text-[#2D1B2E] text-sm mt-3">{circle.name}</span>
              </div>
            );
          })}
        </div>

        <div>
          <h2 className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#2D1B2E]/60 mb-4">Wins Board 🏆</h2>
          {wins.map(win => (
            <div key={win.id} className="bg-white rounded-[20px] p-4 shadow-sm border border-black/5 mb-3 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-[#F2E6EC] text-[#D4688A] font-bold flex items-center justify-center shrink-0">
                {win.initial}
              </div>
              <div>
                <p className="text-sm text-[#2D1B2E] leading-relaxed">{win.text}</p>
                <button className="flex items-center gap-1 text-[10px] text-[#D4688A] mt-2 font-medium bg-[#FDE8EE] px-2 py-1 rounded-full">
                  <Heart size={10} /> {win.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] bg-[#FAF9F6] max-w-2xl mx-auto w-full relative shadow-sm">
      <div className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-black/5 px-4 py-4 flex items-center gap-3">
        <button 
          onClick={() => setActiveCircle(null)}
          className="bg-[#E8DCE5] text-[#2D1B2E] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-[#2D1B2E]">{activeCircle}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 [&::-webkit-scrollbar]:hidden">
        {messages[activeCircle]?.map(msg => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FBCFE8] text-[#D4688A] flex items-center justify-center text-xs font-bold shrink-0 mt-4">
              {msg.initial}
            </div>
            <div className="flex flex-col">
              <div className="bg-white border border-black/5 rounded-[20px] rounded-tl-none p-3.5 shadow-sm text-[14px] text-[#2D1B2E]">
                {msg.text}
              </div>
              <span className="text-[9px] text-[#2D1B2E]/40 mt-1">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-black/5 pb-[100px] md:pb-4">
        <div className="flex items-center gap-2 bg-[#FAF9F6] border border-black/10 rounded-full p-1.5">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Share anonymously..."
            className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-[#2D1B2E] placeholder:text-[#2D1B2E]/40"
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-[#D4688A] text-white flex justify-center items-center shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sisterhood;
