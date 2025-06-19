import React from 'react';

const ImageGenerationLoader: React.FC = () => {
  return (
    // Fixed inset overlay with 80% black opacity and high z-index
    <div className="fixed inset-0 flex flex-col items-center justify-center space-y-8 p-8 bg-black/70 z-50">
      <div className="relative w-36 h-36"> {/* Slightly larger for more impact */}
        {/* Outer Ring - Red/Rose theme */}
        <div className="absolute inset-0 rounded-full border-2 border-red-300/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 border-r-rose-500 animate-spin"></div>
        
        {/* Middle Ring - Red/Rose/Orange blend */}
        <div className="absolute inset-3 rounded-full border-2 border-rose-200/20"></div>
        <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-rose-400 border-l-red-400 animate-spin animation-delay-300" style={{animationDirection: 'reverse', animationDuration: '3.5s'}}></div> {/* Slightly slower */}
        
        {/* Inner Ring - Core of creation (Red/Rose) */}
        <div className="absolute inset-8 rounded-full border border-red-300/40"></div>
        <div className="absolute inset-8 rounded-full border border-transparent border-t-red-600 border-b-rose-600 animate-spin animation-delay-600" style={{animationDuration: '2.5s'}}></div> {/* Slightly slower */}
        
        {/* Central 'Creative' Core - Blending red/rose for a vibrant look */}
        <div className="absolute inset-12 rounded-full bg-gradient-to-br from-red-500/80 to-rose-600/80 backdrop-blur-sm animate-pulse">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-red-400/50 to-rose-500/50 animate-ping animation-delay-150"></div>
        </div>
        
        {/* 'Pixel' Nodes / Data Points (Red/Rose) */}
        <div className="absolute top-6 right-10 w-2 h-2 bg-red-400 rounded-full animate-pulse animation-delay-200"></div>
        <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse animation-delay-400"></div>
        <div className="absolute top-10 left-4 w-1 h-1 bg-red-300 rounded-full animate-pulse animation-delay-600"></div>
        <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-rose-300 rounded-full animate-pulse animation-delay-800"></div>
        
        {/* 'Vector' Connection Lines (Red/Rose) */}
        <div className="absolute top-8 left-8 w-10 h-0.5 bg-gradient-to-r from-red-400/60 to-transparent rotate-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-8 h-0.5 bg-gradient-to-l from-rose-400/60 to-transparent -rotate-30 animate-pulse animation-delay-300"></div>
      </div>
      
      {/* Image Processing Indicators */}
      <div className="flex items-center space-x-4">
        {/* Data Flow Bars - Representing pixel processing (Red/Rose) */}
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-1 bg-gradient-to-t from-red-500 to-rose-400 rounded-full animate-pulse"
              style={{
                height: `${14 + i * 5}px`, // Slightly taller bars
                animationDelay: `${i * 250}ms`, // Adjusted delay
                animationDuration: '1.8s' // Slightly longer duration
              }}
            ></div>
          ))}
        </div>
        
        {/* Central 'Brush' or 'Pixel' Symbol (Red/Rose) */}
        <div className="relative">
          <div className="w-10 h-10 border-2 border-red-400 rounded-full transform scale-75 animate-spin" style={{animationDuration: '5s'}}></div> {/* Changed to circle, slower spin */}
          <div className="absolute inset-2 w-6 h-6 bg-gradient-to-br from-red-500 to-rose-500 rounded-full animate-pulse"></div> {/* Inner circle */}
        </div>
        
        {/* Data Flow Bars (Mirror) - Red/Rose */}
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-1 bg-gradient-to-t from-rose-500 to-red-400 rounded-full animate-pulse"
              style={{
                height: `${34 - i * 5}px`, // Adjusted height for mirror
                animationDelay: `${i * 250 + 125}ms`, // Adjusted delay
                animationDuration: '1.8s'
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* AI Status Text */}
      <div className="text-center space-y-2">
        <div className="text-2xl font-extrabold bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent animate-pulse">
          GENERATING IMAGE
        </div>
        <div className="text-base text-gray-400 font-mono tracking-wider"> {/* Slightly larger, darker text */}
          Crafting pixels...
        </div>
      </div>
      
      {/* Generation Progress */}
      <div className="w-72 space-y-2"> {/* Slightly wider progress bar */}
        <div className="flex justify-between text-xs text-gray-500 font-mono">
          <span>Rendering</span>
          <span>...</span> {/* Changed to ellipses for indeterminate progress */}
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden"> {/* Thicker progress bar, darker background */}
          <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-slide"></div> {/* Brighter shimmer */}
            <div className="absolute right-0 top-0 w-3 h-full bg-rose-300 animate-pulse"></div> {/* Wider pulse dot */}
          </div>
        </div>
      </div>
      
      {/* Floating 'Pixel' Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/5 left-1/5 w-1.5 h-1.5 bg-red-400/60 rounded-full animate-float opacity-0 animate-delay-100"></div> {/* More subtle, delayed particles */}
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-rose-400/60 rounded-full animate-float animation-delay-600 opacity-0 animate-delay-100"></div>
        <div className="absolute bottom-1/5 left-1/4 w-2 h-2 bg-red-300/60 rounded-full animate-float animation-delay-1200 opacity-0 animate-delay-100"></div>
        <div className="absolute bottom-1/4 right-1/5 w-1 h-1 bg-rose-300/60 rounded-full animate-float animation-delay-1800 opacity-0 animate-delay-100"></div>
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-500/40 rounded-full animate-float animation-delay-900 opacity-0 animate-delay-100"></div>
        
        {/* Added custom 'animate-delay' for fade-in effect on float */}
        <style>{`
          .animate-delay-100 {
            animation-delay: 100ms;
            animation-fill-mode: both; /* Keep the first frame state (opacity: 0) */
          }
        `}</style>
      </div>
      
      {/* Base Animation Styles (unchanged from previous) */}
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0; /* Start hidden */
          }
          10% { opacity: 0.6; } /* Fade in */
          25% { 
            transform: translateY(-25px) translateX(12px) rotate(90deg); 
            opacity: 1;
          }
          50% { 
            transform: translateY(-20px) translateX(-12px) rotate(180deg); 
            opacity: 0.8;
          }
          75% { 
            transform: translateY(-30px) translateX(7px) rotate(270deg); 
            opacity: 1;
          }
          90% { opacity: 0.6; } /* Fade out slightly before repeating */
        }
        
        /* Standard animation delays */
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-150 { animation-delay: 150ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-250 { animation-delay: 250ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-750 { animation-delay: 750ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-900 { animation-delay: 900ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1200 { animation-delay: 1200ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        .animation-delay-1800 { animation-delay: 1800ms; }
        
        .animate-slide {
          animation: slide 2s infinite;
        }
        
        .animate-float {
          animation: float 5s ease-in-out infinite; /* Longer duration for more subtle float */
        }
      `}</style>
    </div>
  );
};

export default ImageGenerationLoader;