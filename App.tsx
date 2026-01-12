
import React, { useState } from 'react';
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
    // Vercel 환경 변수 읽기 시도
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined" || apiKey === "") {
      setError('API_KEY가 감지되지 않았습니다. Vercel Settings에서 환경변수 등록 후 반드시 [Redeploy]를 진행해주세요.');
      return;
    }

    if (!originalImage || !prompt.trim()) {
      setError('이미지를 업로드하고 설명을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = mode === GenerationMode.CHARACTER 
        ? `Task: Transform the provided image. Keep the main character/subject identity. Change their action or expression based on the prompt. Creativity: ${creativity}. Prompt: ${prompt}`
        : `Task: Create a new scene. Use the exact artistic style of the source image. Prompt: ${prompt}`;

      const base64Data = originalImage.includes(',') ? originalImage.split(',')[1] : originalImage;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
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
      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        setError(response.text || "AI가 이미지를 생성하지 못했습니다. 설명을 조금 다르게 적어보세요.");
      }
    } catch (err: any) {
      console.error('API Error:', err);
      if (err.message?.includes('403')) {
        setError('API Key 권한 오류(403). Gemini API 키가 활성화되었는지 확인하세요.');
      } else {
        setError(`에러: ${err.message || '네트워크 연결 상태를 확인해주세요.'}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">1</span>
                Image Upload
              </h2>
              <ImageUploader onUpload={handleImageUpload} />
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">2</span>
                Generation Mode
              </h2>
              <ModeSelector mode={mode} setMode={setMode} creativity={creativity} setCreativity={setCreativity} />
            </section>

            <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">3</span>
                Describe New Image
              </h2>
              <PromptInput prompt={prompt} setPrompt={setPrompt} onGenerate={generateNewImage} isLoading={isGenerating} disabled={!originalImage} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                  <p className="font-bold mb-1">알림</p>
                  <p>{error}</p>
                </div>
              )}
            </section>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Original
                </h2>
                <ImageDisplay image={originalImage} label="Original" />
              </div>
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                  Generated
                </h2>
                <ImageDisplay image={generatedImage} label="Generated" isLoading={isGenerating} isPlaceholder={!generatedImage} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-8 border-t border-slate-200 text-center text-slate-400 text-sm">
        © 2025 Vision Morph AI. Powered by Gemini 2.5 Flash Image.
      </footer>
    </div>
  );
};

export default App;
