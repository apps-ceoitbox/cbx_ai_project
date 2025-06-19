import React from 'react';

const EnhanceLoader: React.FC = () => {
  return (
    // Added 'fixed', 'inset-0', 'bg-black/80' for the overlay effect
    <div className="fixed inset-0 flex flex-col items-center justify-center space-y-8 p-8 z-50 bg-black/70 text-white">
      <div className="relative w-32 h-32">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-red-200/30"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 border-r-rose-500 animate-spin"></div>
        
        {/* Middle Ring */}
        <div className="absolute inset-2 rounded-full border-2 border-rose-200/20"></div>
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-rose-400 border-l-red-400 animate-spin animation-delay-300" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
        
        {/* Inner Ring */}
        <div className="absolute inset-6 rounded-full border border-red-300/40"></div>
        <div className="absolute inset-6 rounded-full border border-transparent border-t-red-600 border-b-rose-600 animate-spin animation-delay-600" style={{animationDuration: '2s'}}></div>
        
        {/* Central AI Core */}
        <div className="absolute inset-10 rounded-full bg-gradient-to-br from-red-500/80 to-rose-600/80 backdrop-blur-sm animate-pulse">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-red-400/50 to-rose-500/50 animate-ping animation-delay-150"></div>
        </div>
        
        {/* Neural Network Nodes */}
        <div className="absolute top-4 right-8 w-2 h-2 bg-red-400 rounded-full animate-pulse animation-delay-200"></div>
        <div className="absolute bottom-6 left-4 w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse animation-delay-400"></div>
        <div className="absolute top-8 left-2 w-1 h-1 bg-red-300 rounded-full animate-pulse animation-delay-600"></div>
        <div className="absolute bottom-4 right-6 w-1.5 h-1.5 bg-rose-300 rounded-full animate-pulse animation-delay-800"></div>
        
        {/* Connection Lines */}
        <div className="absolute top-6 left-6 w-8 h-0.5 bg-gradient-to-r from-red-400/60 to-transparent rotate-45 animate-pulse"></div>
        <div className="absolute bottom-8 right-8 w-6 h-0.5 bg-gradient-to-l from-rose-400/60 to-transparent -rotate-45 animate-pulse animation-delay-300"></div>
      </div>
      
      {/* AI Processing Indicators */}
      <div className="flex items-center space-x-4">
        {/* Data Flow Bars */}
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-1 bg-gradient-to-t from-red-500 to-rose-400 rounded-full animate-pulse"
              style={{
                height: `${12 + i * 4}px`,
                animationDelay: `${i * 200}ms`,
                animationDuration: '1.5s'
              }}
            ></div>
          ))}
        </div>
        
        {/* Central AI Symbol */}
        <div className="relative">
          <div className="w-8 h-8 border-2 border-red-400 rounded transform rotate-45 animate-spin" style={{animationDuration: '4s'}}></div>
          <div className="absolute inset-2 w-4 h-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-sm animate-pulse"></div>
        </div>
        
        {/* Data Flow Bars (Mirror) */}
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="w-1 bg-gradient-to-t from-rose-500 to-red-400 rounded-full animate-pulse"
              style={{
                height: `${28 - i * 4}px`,
                animationDelay: `${i * 200 + 100}ms`,
                animationDuration: '1.5s'
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* AI Status Text */}
      <div className="text-center space-y-2">
        <div className="text-xl font-bold bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent animate-pulse">
         PROMPT ENHANCING
        </div>
        
      </div>
      
      {/* Neural Network Progress */}
      <div className="w-64 space-y-2">
        <div className="flex justify-between text-xs text-gray-500 font-mono">
          <span>Enhancing</span>
          <span>∞</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-slide"></div>
            <div className="absolute right-0 top-0 w-2 h-full bg-rose-300 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Floating Data Particles */}
      {/* This div is also within the fixed parent, so its positioning will be relative to it. */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-red-400/60 rounded-full animate-float"></div>
        <div className="absolute top-1/3 right-1/5 w-0.5 h-0.5 bg-rose-400/60 rounded-full animate-float animation-delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-red-300/60 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-0.5 h-0.5 bg-rose-300/60 rounded-full animate-float animation-delay-1500"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500/40 rounded-full animate-float animation-delay-750"></div>
      </div>
      
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
            opacity: 0.6;
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(90deg); 
            opacity: 1;
          }
          50% { 
            transform: translateY(-15px) translateX(-10px) rotate(180deg); 
            opacity: 0.8;
          }
          75% { 
            transform: translateY(-25px) translateX(5px) rotate(270deg); 
            opacity: 1;
          }
        }
        
        .animation-delay-150 { animation-delay: 150ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-600 { animation-delay: 600ms; }
        .animation-delay-750 { animation-delay: 750ms; }
        .animation-delay-800 { animation-delay: 800ms; }
        .animation-delay-1000 { animation-delay: 1000ms; }
        .animation-delay-1500 { animation-delay: 1500ms; }
        
        .animate-slide {
          animation: slide 2s infinite;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default EnhanceLoader;