import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Leaf, Activity, Moon, RefreshCw, Send, Heart, Trophy } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  arrayUnion 
} from 'firebase/firestore';

const Sisterhood = () => {
  const [activeCircle, setActiveCircle] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newWin, setNewWin] = useState('');
  const [messages, setMessages] = useState([]);
  const [wins, setWins] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const circles = [
    { id: 'anti-inflammatory', name: 'Anti-Inflammatory Living', icon: Leaf, bg: 'bg-emerald-100/50', color: 'text-emerald-700' },
    { id: 'movement', name: 'Movement and Energy', icon: Activity, bg: 'bg-orange-100/50', color: 'text-orange-700' },
    { id: 'rest', name: 'Rest and Stress', icon: Moon, bg: 'bg-purple-100/50', color: 'text-purple-700' },
    { id: 'cycle', name: 'Cycle Awareness', icon: RefreshCw, bg: 'bg-pink-100/50', color: 'text-pink-700' }
  ];

  const getUserInitial = () => {
    if (auth.currentUser?.displayName) return auth.currentUser.displayName[0].toUpperCase();
    if (auth.currentUser?.email) return auth.currentUser.email[0].toUpperCase();
    return 'U';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Real-time listener for Wins Board
  useEffect(() => {
    const q = query(collection(db, 'wins'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const winsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWins(winsData);
    });
    return () => unsubscribe();
  }, []);

  // Real-time listener for Chat Room
  useEffect(() => {
    if (!activeCircle) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, `circles/${activeCircle.id}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [activeCircle]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeCircle || !auth.currentUser) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await addDoc(collection(db, `circles/${activeCircle.id}/messages`), {
        text: messageText,
        senderUid: auth.currentUser.uid,
        senderInitial: getUserInitial(),
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleShareWin = async (e) => {
    e.preventDefault();
    if (!newWin.trim() || !auth.currentUser) return;
    if (newWin.length > 280) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'wins'), {
        text: newWin.trim(),
        senderUid: auth.currentUser.uid,
        senderInitial: getUserInitial(),
        celebrations: [],
        createdAt: serverTimestamp()
      });
      setNewWin('');
    } catch (error) {
      console.error("Error sharing win:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCelebrate = async (winId) => {
    if (!auth.currentUser) return;
    try {
      const winRef = doc(db, 'wins', winId);
      await updateDoc(winRef, {
        celebrations: arrayUnion(auth.currentUser.uid)
      });
    } catch (error) {
      console.error("Error celebrating:", error);
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const date = createdAt.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (activeCircle === null) {
    return (
      <div className="min-h-screen bg-[#F2E6EC] pb-32 px-4 pt-8 max-w-2xl mx-auto animate-in fade-in duration-500">
        <header className="mb-8">
          <h1 className="text-3xl font-medium text-dark-plum mb-2">
            The <span className="italic text-rose-pink font-[Fraunces,serif]">Sisterhood</span>
          </h1>
          <p className="text-dark-plum/60 text-sm">A safe, anonymous space to heal together.</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-12">
          {circles.map(circle => {
            const Icon = circle.icon;
            return (
              <div 
                key={circle.id}
                onClick={() => setActiveCircle(circle)}
                className="bg-white rounded-[28px] p-6 shadow-sm border border-black/5 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all active:scale-95 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${circle.bg} ${circle.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <span className="font-bold text-dark-plum text-xs tracking-tight leading-tight">{circle.name}</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold tracking-[2px] uppercase text-dark-plum/40 flex items-center gap-2">
              <Trophy size={14} className="text-rose-pink" /> Community Wins
            </h2>
          </div>

          <div className="bg-white rounded-[24px] p-4 shadow-sm border border-black/5 mb-6">
            <form onSubmit={handleShareWin} className="flex flex-col gap-3">
              <textarea 
                value={newWin}
                onChange={(e) => setNewWin(e.target.value)}
                placeholder="What are we celebrating today?"
                maxLength={280}
                className="w-full bg-transparent border-none outline-none text-sm text-dark-plum placeholder:text-dark-plum/30 resize-none h-20 p-2"
              />
              <div className="flex items-center justify-between border-t border-black/5 pt-3">
                <span className="text-[10px] text-dark-plum/30 font-medium">{newWin.length}/280</span>
                <button 
                  disabled={!newWin.trim() || isSubmitting}
                  type="submit"
                  className="bg-rose-pink text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-sm disabled:opacity-50 hover:bg-[#BE185D] transition-colors"
                >
                  Share My Win
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            {wins.map(win => (
              <div key={win.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-black/5 flex gap-4 items-start animate-in slide-in-from-bottom-4 duration-300">
                <div className="w-10 h-10 rounded-full bg-rose-pink/10 text-rose-pink font-bold flex items-center justify-center shrink-0 border border-rose-pink/5">
                  {win.senderInitial}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] text-dark-plum leading-relaxed">{win.text}</p>
                  <button 
                    onClick={() => handleCelebrate(win.id)}
                    className={`flex items-center gap-1.5 text-[10px] mt-3 font-bold px-3 py-1.5 rounded-full transition-all ${
                      win.celebrations?.includes(auth.currentUser?.uid)
                        ? 'bg-rose-pink text-white shadow-md'
                        : 'bg-rose-pink/5 text-rose-pink hover:bg-rose-pink/10'
                    }`}
                  >
                    <Heart size={12} fill={win.celebrations?.includes(auth.currentUser?.uid) ? "white" : "none"} /> 
                    {win.celebrations?.length || 0} Celebrations
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] bg-[#FAF9F6] max-w-2xl mx-auto w-full relative">
      <div className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-xl border-b border-black/5 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => setActiveCircle(null)}
          className="bg-dark-plum/5 text-dark-plum w-10 h-10 rounded-full flex items-center justify-center hover:bg-dark-plum/10 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-[15px] font-bold text-dark-plum leading-tight">{activeCircle.name}</h2>
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Live Community</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 [&::-webkit-scrollbar]:hidden">
        {messages.map(msg => {
          const isMe = msg.senderUid === auth.currentUser?.uid;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} items-end`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-dark-plum/5 text-dark-plum/60 flex items-center justify-center text-[10px] font-bold shrink-0 border border-black/5">
                  {msg.senderInitial}
                </div>
              )}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                <div className={`p-4 shadow-sm text-[14px] ${
                  isMe 
                    ? 'bg-rose-pink text-white rounded-[24px] rounded-br-none' 
                    : 'bg-white text-dark-plum border border-black/5 rounded-[24px] rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-dark-plum/30 mt-1.5 font-medium">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-black/5 pb-24 md:pb-6">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-[#FAF9F6] border border-black/10 rounded-full p-2 pr-2">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write anonymously..."
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-dark-plum placeholder:text-dark-plum/30"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 rounded-full bg-rose-pink text-white flex justify-center items-center shrink-0 shadow-md hover:bg-[#BE185D] transition-colors disabled:opacity-50"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sisterhood;
