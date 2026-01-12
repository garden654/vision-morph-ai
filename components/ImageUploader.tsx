
import React, { useState, useCallback } from 'react';
import { ImageUploadProps } from '../types';

const ImageUploader: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      onUpload(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onUpload]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}
      `}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={onFileChange}
      />
      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-500">
        <i className="fas fa-cloud-arrow-up text-2xl"></i>
      </div>
      <div>
        <p className="text-slate-800 font-semibold">Click to upload or drag and drop</p>
        <p className="text-slate-500 text-sm mt-1">PNG, JPG, WEBP formats supported</p>
      </div>
    </div>
  );
};

export default ImageUploader;
