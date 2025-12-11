
import React, { useState } from 'react';

interface UIOverlayProps {
  onGenerate: (prompt: string) => void;
  onClear: () => void;
  isGenerated: boolean;
  isLoading: boolean;
  error: string | null;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ onGenerate, onClear, isGenerated, isLoading, error }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 p-8 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col items-start gap-2 pointer-events-auto">
        <h1 className="text-4xl font-light text-slate-800 tracking-tight drop-shadow-sm bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/50">
          AI Home Builder
        </h1>
        <p className="text-slate-600 bg-white/70 backdrop-blur-sm px-4 py-1 rounded-md text-sm border border-white/50">
          Powered by Gemini • Phase 3
        </p>
      </div>

      {/* Error Message Toast */}
      {error && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-2xl pointer-events-auto">
          <strong className="font-bold">Generation Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Action Bar (Bottom Center) */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 pointer-events-auto w-full max-w-2xl px-4">
        
        {/* Input Form */}
        <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/60 transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-400">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your dream home (e.g., 'A cozy brick cottage with a big blue roof')" 
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-800 placeholder-slate-500 font-medium"
              disabled={isLoading || isGenerated}
            />
            
            {isGenerated ? (
              <button
                type="button"
                onClick={onClear}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow-md transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Clear
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className={`
                  px-6 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center gap-2
                  ${isLoading 
                    ? 'bg-slate-400 cursor-wait text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg active:scale-95'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Building...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Build
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Footer Instructions */}
        <div className="mt-4 flex justify-center">
          <div className="bg-white/60 backdrop-blur-md px-6 py-1 rounded-full shadow-sm border border-white/40">
            <p className="text-slate-600 text-xs font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGenerated ? 'bg-indigo-500' : 'bg-green-500'} animate-pulse`}></span>
              {isGenerated 
                ? "Architecture Generated. Rotate camera to inspect details." 
                : "AI ready. Type a description to begin construction."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
