export interface GeneratedFile {
  path: string;
  language: string;
  code: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isGenerating?: boolean;
}