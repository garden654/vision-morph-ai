
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
    // API 키 확인 (process.env.API_KEY는 빌드 시 Vercel에서 주입됨)
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      setError('API Key가 감지되지 않습니다. Vercel 환경 변수 설정을 확인해주세요.');
      return;
    }

    if (!originalImage || !prompt.trim()) {
      setError('이미지를 업로드하고 설명을 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 최신 SDK 규격: new GoogleGenAI({ apiKey })
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = mode === GenerationMode.CHARACTER 
        ? `You are an image editor. Maintain the character/subject identity from the source image. Create new actions or expressions as described. Creativity level (0-1): ${creativity}. User request: ${prompt}`
        : `You are an image editor. Maintain the exact art style from the source image. Create an entirely new scene using that style. User request: ${prompt}`;

      // Base64 데이터에서 헤더 제거
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
      // 응답 구조에서 이미지 파트 추출
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
        // 텍스트 응답이 있을 경우 에러 메시지로 활용
        const textContent = response.text || "이미지를 생성하지 못했습니다. 프롬프트를 조정해보세요.";
        setError(textContent);
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      // 구체적인 에러 핸들링
      if (err.message?.includes('403') || err.message?.includes('API_KEY_INVALID')) {
        setError('API Key가 유효하지 않습니다. Vercel의 API_KEY 설정을 다시 확인해주세요.');
      } else if (err.message?.includes('429')) {
        setError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err.message || '이미지 생성 중 오류가 발생했습니다.');
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
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <i className="fas fa-exclamation-circle mt-0.5"></i>
                  <span>{error}</span>
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
              <div className="flex-grow flex items-center justify-center bg-indigo-50/50 border-2 border-dashed border-indigo-100 rounded-3xl p-12 text-center">
                <div>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-sm">
                    <i className="fas fa-wand-sparkles text-2xl"></i>
                  </div>
                  <h3 className="text-indigo-900 font-bold text-lg">기다리고 있습니다</h3>
                  <p className="text-indigo-600/70 max-w-xs mx-auto mt-2">
                    이미지를 업로드하고 AI에게 마법같은 변화를 요청해보세요.
                  </p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 text-center text-slate-400 text-sm">
        <p>© 2025 Vision Morph AI. Powered by Gemini Flash Image.</p>
      </footer>
    </div>
  );
};

export default App;
