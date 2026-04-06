import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const ResourceModal = ({ isOpen, onClose, resource }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small timeout to ensure the transition happens after mount
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered || !resource) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end justify-center transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div 
        className={`relative w-full max-w-2xl bg-[#FEF2F4] rounded-t-[32px] shadow-2xl transition-transform duration-300 transform flex flex-col max-h-[85vh] ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-black/10 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4 flex justify-between items-start">
          <div className="pt-2">
            <span className="text-[10px] font-bold text-rose-pink uppercase tracking-[2px]">
              {resource.type || 'GUIDE'}
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-dark-plum mt-1 leading-tight">
              {resource.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/50 hover:bg-white rounded-full flex items-center justify-center text-dark-plum transition-colors mt-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <div className="prose prose-sm max-w-none text-dark-plum/80 leading-relaxed space-y-4">
            <p className="text-base">
              {resource.content || "Text coming soon..."}
            </p>
            {/* Placeholder for more content to demonstrate scrolling */}
            <div className="h-4" />
            <p className="italic text-dark-plum/50 text-sm">
              Our team is working with medical specialists to bring you the most accurate and up-to-date information for this guide. Check back soon for the full content.
            </p>
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="p-6 bg-gradient-to-t from-[#FEF2F4] via-[#FEF2F4] to-transparent">
          <button 
            onClick={onClose}
            className="w-full bg-dark-plum text-white rounded-2xl py-4 font-bold uppercase tracking-widest hover:bg-[#1A101B] transition-all shadow-lg active:scale-[0.98]"
          >
            Got it! Back to Dashboard
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 27, 46, 0.1);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default ResourceModal;
