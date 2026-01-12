
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
    // Vercel 환경변수에서 API_KEY 가져오기
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === "undefined") {
      setError('환경 변수 API_KEY가 설정되지 않았거나 배포에 반영되지 않았습니다. Vercel Settings > Environment Variables 등록 후 Redeploy 해주세요.');
      return;
    }

    if (!originalImage || !prompt.trim()) {
      setError('이미지를 업로드하고 설명을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 매 호출 시 신규 인스턴스 생성 (보안 및 최신 키 반영)
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = mode === GenerationMode.CHARACTER 
        ? `Task: Image-to-Image transformation. Maintain the core subject identity (human/character). Apply new actions, expressions, or modifications as requested. Creativity degree: ${creativity}. Request: ${prompt}`
        : `Task: Style-consistent scene generation. Maintain the artistic style and medium of the source image. Create an entirely new scene. Request: ${prompt}`;

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
        const textFallback = response.text || "결과 이미지를 생성하지 못했습니다. 설명을 조금 더 구체적으로 바꿔보세요.";
        setError(textFallback);
      }
    } catch (err: any) {
      console.error('API Error:', err);
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('403')) {
        setError('유효하지 않은 API Key입니다. Gemini AI Studio에서 새 키를 발급받아 Vercel에 업데이트하세요.');
      } else {
        setError(`에러 발생: ${err.message || '알 수 없는 네트워크 오류'}`);
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
          
          {/* Left Side: Controls */}
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
                Describe New Image
              </h2>
              <PromptInput 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onGenerate={generateNewImage}
                isLoading={isGenerating}
                disabled={!originalImage}
              />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
                  <i className="fas fa-circle-exclamation mt-0.5 text-lg"></i>
                  <div className="flex-1">
                    <p className="font-bold">작동 오류</p>
                    <p className="opacity-90">{error}</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Side: Display */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                  Original Image
                </h2>
                <ImageDisplay image={originalImage} label="Original" />
              </div>
              
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                  Generated Image
                </h2>
                <ImageDisplay 
                  image={generatedImage} 
                  label="Generated" 
                  isLoading={isGenerating}
                  isPlaceholder={!generatedImage}
                />
              </div>
            </div>
            
            {!originalImage && (
              <div className="flex-grow flex items-center justify-center bg-indigo-50/30 border-2 border-dashed border-indigo-100 rounded-3xl p-12 text-center">
                <div>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-sm">
                    <i className="fas fa-wand-sparkles text-2xl"></i>
                  </div>
                  <h3 className="text-indigo-900 font-bold text-lg">AI 변환 준비 완료</h3>
                  <p className="text-indigo-600/60 max-w-xs mx-auto mt-2 text-sm">
                    먼저 원본 이미지를 업로드하고,<br/>어떻게 바꾸고 싶은지 적어주세요.
                  </p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </main>

      <footer className="py-8 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm">© 2025 Vision Morph AI. Powered by Gemini 2.5 Flash Image.</p>
      </footer>
    </div>
  );
};

export default App;
