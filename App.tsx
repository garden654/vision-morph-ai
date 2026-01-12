
import React, { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GenerationMode } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ModeSelector from './components/ModeSelector';
import PromptInput from './components/PromptInput';
import ImageDisplay from './components/ImageDisplay';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('image/png');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.CHARACTER);
  const [creativity, setCreativity] = useState<number>(0.5);
  const [prompt, setPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (base64: string, mimeType: string) => {
    setOriginalImage(base64);
    setOriginalMimeType(mimeType);
    setGeneratedImage(null);
    setError(null);
  };

  const generateNewImage = async () => {
    if (!originalImage || !prompt.trim()) {
      setError('Please upload an image and enter a description first.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      // Constructing a detailed prompt based on mode
      const systemInstruction = mode === GenerationMode.CHARACTER 
        ? `You are an expert image editor. The user wants to maintain the character/subject of the uploaded image but change their action or expression. Creativity level: ${creativity * 100}%. Instruction: ${prompt}`
        : `You are an expert style transfer artist. The user wants to maintain the exact art style of the uploaded image but create a completely new scene. Instruction: ${prompt}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: originalImage.split(',')[1] || originalImage,
                mimeType: originalMimeType,
              },
            },
            {
              text: systemInstruction,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        // If the model only returned text, it might be an error message or refusal
        const textResponse = response.text || "Model didn't generate an image.";
        setError(`AI Response: ${textResponse}`);
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side: Controls */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                Upload Source Image
              </h2>
              <ImageUploader onUpload={handleImageUpload} />
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                Select Mode
              </h2>
              <ModeSelector 
                mode={mode} 
                setMode={setMode} 
                creativity={creativity} 
                setCreativity={setCreativity} 
              />
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                Describe Transformation
              </h2>
              <PromptInput 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onGenerate={generateNewImage}
                isLoading={isGenerating}
                disabled={!originalImage}
              />
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <i className="fas fa-exclamation-circle mt-0.5"></i>
                  <span>{error}</span>
                </div>
              )}
            </section>
          </div>

          {/* Right Side: Results */}
          <div className="w-full lg:w-1/2 flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">4</span>
                Original Image
              </h2>
              <ImageDisplay image={originalImage} label="Source" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">5</span>
                Generated Image
              </h2>
              <ImageDisplay 
                image={generatedImage} 
                label="Result" 
                isLoading={isGenerating}
                isPlaceholder={!generatedImage}
              />
            </div>
          </div>
          
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>© 2024 Vision Transformer AI. Powered by Gemini 2.5 Flash Image.</p>
      </footer>
    </div>
  );
};

export default App;
