
import React from 'react';
import { PromptInputProps } from '../types';

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onGenerate, isLoading, disabled }) => {
  const suggestions = [
    'smiling and holding a flower',
    'a futuristic city background',
    'a cat wearing a wizard hat',
    'riding a bicycle in the rain'
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe how to transform the image... (Supports English & Korean)"
          className="w-full min-h-[120px] p-4 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 resize-none transition-all outline-none text-slate-400 placeholder:text-slate-300"
          disabled={disabled || isLoading}
        />
        <button
          onClick={onGenerate}
          disabled={disabled || isLoading || !prompt.trim()}
          className={`mt-4 w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
            ${disabled || isLoading || !prompt.trim()
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300'
            }
          `}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Generating Magic...</span>
            </>
          ) : (
            <>
              <i className="fas fa-sparkles"></i>
              <span>Transform Image</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-slate-400 uppercase">Suggestions:</span>
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => setPrompt(s)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            disabled={isLoading}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PromptInput;
