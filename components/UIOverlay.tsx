import React from 'react';

interface UIOverlayProps {
  onGenerate: () => void;
  isGenerated: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ onGenerate, isGenerated }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 p-8 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 pointer-events-auto">
        <h1 className="text-4xl font-light text-slate-800 tracking-tight drop-shadow-sm bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/50">
          AI Home Builder
        </h1>
        <p className="text-slate-600 bg-white/70 backdrop-blur-sm px-4 py-1 rounded-md text-sm border border-white/50">
          Environment Initialization • v0.1.1
        </p>
      </div>

      {/* Action Bar (Bottom Center) */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-4 w-full">
        
        {/* Generation Button */}
        <button
          onClick={onGenerate}
          className={`
            px-8 py-3 rounded-full font-semibold shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95
            flex items-center gap-2 border border-white/40 backdrop-blur-md
            ${isGenerated 
              ? 'bg-red-500/80 hover:bg-red-600/90 text-white' 
              : 'bg-indigo-600/90 hover:bg-indigo-700/90 text-white'
            }
          `}
        >
          {isGenerated ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Clear Site
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Generate House
            </>
          )}
        </button>

        {/* Footer Instructions */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-white/50">
          <p className="text-slate-700 text-xs font-medium flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isGenerated ? 'bg-indigo-500' : 'bg-green-500'} animate-pulse`}></span>
            {isGenerated ? "Structure Active. Rotate to Inspect." : "Ready for Generation."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;