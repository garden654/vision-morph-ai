
import React from 'react';
import { ImageDisplayProps } from '../types';

const ImageDisplay: React.FC<ImageDisplayProps> = ({ image, label, isLoading, isPlaceholder }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[400px] flex flex-col">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">{label}</span>
        {image && !isLoading && (
          <a 
            href={image} 
            download={`${label.toLowerCase()}_image.png`}
            className="text-indigo-600 hover:text-indigo-700"
          >
            <i className="fas fa-download"></i>
          </a>
        )}
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4 relative bg-slate-100/50">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20">
               <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-slate-800 font-semibold animate-pulse">Processing Pixel Data</p>
              <p className="text-xs text-slate-500 mt-1">This takes about 10-20 seconds...</p>
            </div>
          </div>
        ) : image ? (
          <img 
            src={image} 
            alt={label} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
          />
        ) : (
          <div className="text-center p-8 opacity-40">
            <i className={`fas ${isPlaceholder ? 'fa-image-polaroid' : 'fa-image'} text-6xl text-slate-300 mb-4 block`}></i>
            <p className="text-slate-500 font-medium italic">
              {isPlaceholder ? 'Generated result will appear here' : 'No image uploaded yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;
