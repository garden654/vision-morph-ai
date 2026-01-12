
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <i className="fas fa-wand-magic-sparkles text-white"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">Vision Transformer</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Gemini AI Studio</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">How it works</a>
          <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Examples</a>
          <button className="bg-slate-900 text-white px-5 py-2 rounded-full font-medium hover:bg-slate-800 transition-all">
            Share Result
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
