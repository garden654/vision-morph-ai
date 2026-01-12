
export enum GenerationMode {
  CHARACTER = 'CHARACTER',
  STYLE = 'STYLE'
}

export interface ImageUploadProps {
  onUpload: (base64: string, mimeType: string) => void;
}

export interface ModeSelectorProps {
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
  creativity: number;
  setCreativity: (val: number) => void;
}

export interface PromptInputProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export interface ImageDisplayProps {
  image: string | null;
  label: string;
  isLoading?: boolean;
  isPlaceholder?: boolean;
}
