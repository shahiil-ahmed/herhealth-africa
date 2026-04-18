import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const ResourceModal = ({ isOpen, onClose, resource }) => {
  const [activeResource, setActiveResource] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen && resource) {
      const timer = setTimeout(() => {
        setActiveResource(resource);
        setIsVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      const timer1 = setTimeout(() => setIsVisible(false), 0);
      // Wait for animation to finish before clearing the resource
      const timer2 = setTimeout(() => setActiveResource(null), 300);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, resource]);

  if (!activeResource) return null;

  return (
    <div 
      className={`fixed inset-0 z-100 flex items-end justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 z-90 bg-black/40 backdrop-blur-[2px]" 
        onClick={onClose}
      />

      {/* Modal Sheet */}
      <div 
        className={`relative z-100 w-full max-w-2xl bg-petal rounded-t-[32px] shadow-2xl transition-transform duration-300 transform flex flex-col max-h-[85vh] ${
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
            <span className="text-[10px] font-bold text-rose-pink tracking-[1px]">
              {activeResource.type || 'Guide'}
            </span>
            <h2 className="text-2xl md:text-3xl font-medium text-dark-plum mt-1 leading-tight">
              {activeResource.title}
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
              {activeResource.content || "Text coming soon..."}
            </p>
            {/* Placeholder for more content to demonstrate scrolling */}
            <div className="h-4" />
            <p className="italic text-dark-plum/50 text-sm">
              Our team is working with medical specialists to bring you the most accurate and up-to-date information for this guide. Check back soon for the full content.
            </p>
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="p-6 bg-gradient-to-t from-petal via-petal to-transparent">
          <button 
            onClick={onClose}
            className="w-full bg-dark-plum text-white rounded-2xl py-4 font-bold tracking-widest hover:bg-[#1A101B] transition-all shadow-lg active:scale-[0.98]"
          >
            Got it! Back to dashboard
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
