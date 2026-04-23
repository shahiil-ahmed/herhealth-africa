import React from 'react';

/**
 * A helper component that detects URLs in plain text and wraps them in <a> tags.
 * Styles URLs with Rose Pink (#D4688A) and underline.
 */
const Linkify = ({ text }) => {
  if (!text) return null;

  // Regex to detect URLs starting with http/https or herhealth-africa.vercel.app
  const urlRegex = /(https?:\/\/[^\s]+|herhealth-africa\.vercel\.app[^\s]*)/gi;
  
  const parts = text.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          let href = part;
          // Ensure URL has protocol for the href
          if (!href.startsWith('http')) {
            href = `https://${href}`;
          }
          
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4688A] underline decoration-rose-pink hover:opacity-80 transition-opacity"
            >
              {part}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default Linkify;
