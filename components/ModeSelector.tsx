
import React from 'react';
import { GenerationMode, ModeSelectorProps } from '../types';

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode, creativity, setCreativity }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setMode(GenerationMode.CHARACTER)}
          className={`relative p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${
            mode === GenerationMode.CHARACTER
              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          {mode === GenerationMode.CHARACTER && (
            <div className="absolute top-3 right-3 text-indigo-600">
              <i className="fas fa-circle-check"></i>
            </div>
          )}
          <span className="font-bold text-slate-800">Maintain Character</span>
          <span className="text-xs text-slate-500 leading-relaxed">
            New actions or expressions for the subject while keeping identity.
          </span>
        </button>

        <button
          onClick={() => setMode(GenerationMode.STYLE)}
          className={`relative p-4 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${
            mode === GenerationMode.STYLE
              ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          {mode === GenerationMode.STYLE && (
            <div className="absolute top-3 right-3 text-indigo-600">
              <i className="fas fa-circle-check"></i>
            </div>
          )}
          <span className="font-bold text-slate-800">Maintain Style</span>
          <span className="text-xs text-slate-500 leading-relaxed">
            Create an entirely new scene using the original artwork's unique style.
          </span>
        </button>
      </div>

      {mode === GenerationMode.CHARACTER && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-700">Creativity Level</label>
            <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
              {Math.round(creativity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={creativity}
            onChange={(e) => setCreativity(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
            <span>Rigid</span>
            <span>Balanced</span>
            <span>Wild</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelector;
