
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import JSZip from 'jszip';
import type { GeneratedFile, ChatMessage } from './types';
import { startChat } from './services/geminiService';
import type { Chat } from '@google/genai';
import { 
    CopyIcon, DownloadProjectIcon, DesktopIcon, TabletIcon, MobileIcon, XIcon, UndoIcon, RedoIcon,
    HtmlIcon, CssIcon, JsIcon, TsIcon, JsonIcon, MdIcon, FileIcon, PreviewIcon, DownloadIcon,
    MinimizeIcon, WindowMaximizeIcon, CloseIcon
} from './components/Icons';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

const customSyntaxStyle = {
  'pre[class*="language-"]': {
    background: '#15001f',
    color: '#bafff8',
    fontFamily: '"Roboto Mono", monospace',
    fontSize: '14px',
    margin: 0,
    overflow: 'auto',
    height: '100%',
  },
  'code[class*="language-"]': {
    fontFamily: '"Roboto Mono", monospace',
  },
  'keyword': { color: '#ff4284' },
  'string': { color: '#22ff00' },
  'preprocessor': { color: '#22ff00' },
  'function': { color: '#4281ff' },
  'class-name': { color: '#4281ff' },
  'variable': { color: '#ffae00' },
  'operator': { color: '#ffff00' },
  'punctuation': { color: '#e600ff' },
  'comment': { color: '#888', fontStyle: 'italic' },
  'property': { color: '#ffae00' },
  'number': { color: '#ffae00' },
  'boolean': { color: '#ff4284' },
  'tag': { color: '#ff4284' },
  'attr-name': { color: '#ffff00' },
  'attr-value': { color: '#22ff00' },
};


const getFileIcon = (path: string | null): React.ReactElement => {
    if (path === 'preview') return <PreviewIcon className="w-5 h-5 flex-shrink-0" />;
    if (!path) return <FileIcon className="w-5 h-5 flex-shrink-0" />;

    const extension = path.split('.').pop()?.toLowerCase() || '';
    const iconProps = { className: "w-5 h-5 flex-shrink-0" };

    switch (extension) {
        case 'html': return <HtmlIcon {...iconProps} />;
        case 'css': return <CssIcon {...iconProps} />;
        case 'js':
        case 'jsx': return <JsIcon {...iconProps} />;
        case 'ts':
        case 'tsx': return <TsIcon {...iconProps} />;
        case 'json': return <JsonIcon {...iconProps} />;
        case 'md': return <MdIcon {...iconProps} />;
        default: return <FileIcon {...iconProps} />;
    }
};

const ChatMessageContent: React.FC<{ content: string }> = ({ content }) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
  
    return (
      <>
        {parts.map((part, i) => {
          const codeBlockMatch = part.match(/```(\w+)?\n([\s\S]+)```/);
          if (codeBlockMatch) {
            const language = codeBlockMatch[1] || 'plaintext';
            const code = codeBlockMatch[2];
            return (
              <div key={i} className="chat-code-block">
                <SyntaxHighlighter
                  language={language}
                  style={dracula}
                  codeTagProps={{ style: { fontFamily: '"Roboto Mono", monospace', fontSize: '0.9em' } }}
                >
                  {code.trim()}
                </SyntaxHighlighter>
              </div>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
};

const FileNavigator: React.FC<{
  files: GeneratedFile[];
  activePath: string | null;
  onFileClick: (path: string) => void;
  onPreviewClick: () => void;
  previewContentExists: boolean;
}> = ({ files, activePath, onFileClick, onPreviewClick, previewContentExists }) => {
  return (
    <div className="file-navigator w-full md:w-1/3 lg:w-1/4 h-full flex flex-col min-h-0">
      <h3 className="text-lg font-semibold p-4 border-b border-gray-800/70 flex-shrink-0 text-gray-200">
        Project Files
      </h3>
      <div className="overflow-y-auto flex-grow">
        {previewContentExists && (
          <div
            onClick={onPreviewClick}
            className={`file-item text-gray-300 ${activePath === 'preview' ? 'active' : ''}`}
            title="Preview"
          >
            {getFileIcon('preview')}
            <span className="font-semibold text-blue-400">Preview</span>
          </div>
        )}
        {files.map(file => (
          <div
            key={file.path}
            onClick={() => onFileClick(file.path)}
            className={`file-item text-gray-400 ${activePath === file.path ? 'active' : ''}`}
            title={file.path}
          >
            {getFileIcon(file.path)}
            <span className="truncate">{file.path}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      content: `Welcome to WEB VIBER! I'm your AI web development assistant.

Here’s my approach to building your app:

1. You provide a prompt describing the web app or component you want.
2. I generate the complete code, including all necessary files (HTML, CSS, JavaScript, etc.).
3. The files appear on the left, and the code is shown in the editor. You can also view a live preview.

To get started, just type your idea into the chat box below.

For example, you could ask me to 'build a responsive login page with a futuristic theme.'

What would you like to create today?`
    }
  ]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [currentStreamingFile, setCurrentStreamingFile] = useState<GeneratedFile | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [loaderText, setLoaderText] = useState('');
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [history, setHistory] = useState<GeneratedFile[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const lastCodePathRef = useRef<string | null>(null);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (!process.env.API_KEY) {
        setApiKeyMissing(true);
        setChatHistory(prev => {
            const instructions = { 
                role: 'model', 
                content: "This app requires a Gemini API key. Please set it in your Netlify deployment.\n\nThe environment variable name is `API_KEY`.\n\nYou can set it under **Site configuration > Build & deploy > Environment**." 
            };
            // Avoid adding duplicate messages if one already exists
            if (prev.some(msg => msg.content.includes("API_KEY"))) {
                return prev;
            }
            return [...prev, instructions];
        });
    }
  }, []);
  
  const activeFile = generatedFiles.find(f => f.path === activePath);
  const codeToDisplay = isLoading && currentStreamingFile?.path === activePath 
    ? currentStreamingFile.code 
    : activeFile?.code || '';
    
  const progressMessages = useRef([
    "Analyzing your vision...", "Drafting project structure...", "Generating configuration files...", "Building component tree...",
    "Styling with CSS...", "Adding JavaScript interactivity...", "Finalizing the project files..."
  ]).current;

  const stopProgressMessages = useCallback(() => {
    if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
    }
    setLoaderText('');
  }, []);

  const startProgressMessages = useCallback(() => {
    stopProgressMessages();
    let index = 0;
    setLoaderText(progressMessages[index]);
    progressIntervalRef.current = window.setInterval(() => {
        index = (index + 1) % progressMessages.length;
        setLoaderText(progressMessages[index]);
    }, 2500);
  }, [progressMessages, stopProgressMessages]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isLoading && codeContainerRef.current) {
        const element = codeContainerRef.current;
        setTimeout(() => { element.scrollTop = element.scrollHeight; }, 50);
    }
  }, [codeToDisplay, isLoading]);
  
  const getLanguage = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase() || '';
    const langMap: { [key: string]: string } = {
      js: 'javascript', html: 'html', css: 'css', php: 'php',
      ts: 'typescript', jsx: 'jsx', tsx: 'tsx', json: 'json', md: 'markdown',
    };
    return langMap[extension] || 'plaintext';
  };

  const generatePreview = (files: GeneratedFile[]) => {
    const htmlFile = files.find(f => f.path.endsWith('index.html'));
    if (!htmlFile) return null;
    let html = htmlFile.code;
    const cssFile = files.find(f => f.language === 'css');
    if (cssFile) html = html.replace('</head>', `<style>${cssFile.code}</style></head>`);
    const jsFile = files.find(f => f.language === 'javascript');
    if (jsFile) html = html.replace('</body>', `<script>${jsFile.code}</script></body>`);
    return html;
  };

  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim() || isLoading || apiKeyMissing) return;
    
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: currentInput }];
    setChatHistory(newHistory);
    setCurrentInput('');
    setIsLoading(true);
    startProgressMessages();
    setChatHistory(prev => [...prev, { role: 'model', content: '', isGenerating: true }]);

    try {
      const session = chatSession || startChat();
      if (!chatSession) setChatSession(session);
      
      const stream = await session.sendMessageStream({ message: currentInput });

      let buffer = '';
      let filesBuffer: GeneratedFile[] = [...generatedFiles];

      for await (const chunk of stream) {
        buffer += chunk.text;
        setChatHistory(prev => {
            const lastMessage = prev[prev.length - 1];
            const updatedMessage = { ...lastMessage, content: buffer, isGenerating: true };
            return [...prev.slice(0, -1), updatedMessage];
        });

        const fileRegex = /START_FILE: (.*?)\n([\s\S]*?)END_FILE/g;
        let lastIndex = 0;
        let match;
        const rawCodeSoFar = buffer;

        while ((match = fileRegex.exec(rawCodeSoFar)) !== null) {
            const path = match[1].trim();
            const code = match[2].trim();
            const newFile = { path, language: getLanguage(path), code };
            
            const existingFileIndex = filesBuffer.findIndex(f => f.path === path);
            if (existingFileIndex > -1) filesBuffer[existingFileIndex] = newFile;
            else filesBuffer.push(newFile);
            lastIndex = match.index + match[0].length;
        }

        if(JSON.stringify(filesBuffer) !== JSON.stringify(generatedFiles)) {
             setGeneratedFiles([...filesBuffer]);
        }
        if (filesBuffer.length > 0) {
            const latestPath = filesBuffer[filesBuffer.length - 1].path;
            setActivePath(latestPath);
            lastCodePathRef.current = latestPath;
        }
        
        const remainingBuffer = rawCodeSoFar.substring(lastIndex);
        const streamingFileMatch = /START_FILE: (.*?)\n([\s\S]*)/.exec(remainingBuffer);

        if (streamingFileMatch) {
            const path = streamingFileMatch[1].trim();
            if (activePath !== path) setActivePath(path);
            setCurrentStreamingFile({ path, code: streamingFileMatch[2], language: getLanguage(path) });
        } else {
            setCurrentStreamingFile(null);
        }
      }
      
      const finalFiles = [...filesBuffer];
      setGeneratedFiles(finalFiles);
      setCurrentStreamingFile(null);
      
      if (finalFiles.length > 0) {
        const preview = generatePreview(finalFiles);
        setPreviewContent(preview);

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(finalFiles);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        const finalActiveFile = finalFiles.find(f => f.path === activePath)?.path || finalFiles[0].path;
        lastCodePathRef.current = finalActiveFile;
        if (isMobile) {
            setActivePath('preview');
        } else {
            setActivePath(finalActiveFile);
        }
      } else {
         setChatHistory(prev => [...prev, { role: 'model', content: "Sorry, I couldn't generate any files from that. Could you try rephrasing?" }]);
      }

    } catch (e: any) {
       console.error(e);
       let errorMessage = e.message || "An unknown error occurred.";
       if (errorMessage.includes("API_KEY") || errorMessage.includes("environment variable")) {
           errorMessage = "The `API_KEY` environment variable is missing or invalid. Please set it in your Netlify site settings under 'Site configuration > Build & deploy > Environment'.";
           setApiKeyMissing(true);
       }
       setChatHistory(prev => {
            const historyWithoutGenerating = prev.filter(m => !m.isGenerating);
            return [...historyWithoutGenerating, { role: 'model', content: errorMessage }];
       });
    } finally {
      setIsLoading(false);
      stopProgressMessages();
      setChatHistory(prev => {
        if (prev.length === 0) return [];
        const lastMessage = prev[prev.length - 1];
        if (!lastMessage || !lastMessage.isGenerating) return prev;
        const updatedMessage = { ...lastMessage, isGenerating: false };
        return [...prev.slice(0, -1), updatedMessage];
      });
    }
  }, [currentInput, isLoading, chatHistory, chatSession, generatedFiles, activePath, startProgressMessages, stopProgressMessages, apiKeyMissing, isMobile, history, historyIndex]);

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.code).then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus(''), 2000);
    });
  };
  
  const handleDownloadFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.path.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  const handleDownloadProject = async () => {
    if (generatedFiles.length === 0) return;
    const projectName = prompt("Please enter a name for your project:", "web-viber-project");
    if (!projectName || projectName.trim() === '') return;

    setIsDownloading(true);
    const zip = new JSZip();
    generatedFiles.forEach(file => {
      zip.file(file.path, file.code);
    });

    try {
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.trim().replace(/\s+/g, '-')}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to create zip file:", error);
      setCopyStatus('Zip failed!');
      setTimeout(() => setCopyStatus(''), 2000);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const previousFiles = history[newIndex];
    setGeneratedFiles(previousFiles);
    setPreviewContent(generatePreview(previousFiles));
    setActivePath(previousFiles[0]?.path || null);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const nextFiles = history[newIndex];
    setGeneratedFiles(nextFiles);
    setPreviewContent(generatePreview(nextFiles));
    setActivePath(nextFiles[0]?.path || null);
  };
  
  const deviceStyles: {[key in PreviewDevice]: string} = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] max-w-full h-[1024px] max-h-full rounded-lg shadow-2xl border-4 border-gray-600',
    mobile: 'w-[375px] max-w-full h-[667px] max-h-full rounded-lg shadow-2xl border-4 border-gray-600',
  };

  const showMobilePreview = isMobile && activePath === 'preview';

  const CodeEditor = () => (
    <div className="code-card">
      <div className="code-titlebar">
        <span className="font-mono text-sm truncate px-4">{activePath || 'Untitled'}</span>
        <div className="buttons">
          <button onClick={handleUndo} disabled={historyIndex <= 0} className="hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed" title="Undo"><UndoIcon className="w-4 h-4 fill-white"/></button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed" title="Redo"><RedoIcon className="w-4 h-4 fill-white"/></button>
          <button onClick={handleCopy} disabled={!activeFile} className="hover:bg-gray-700/50 disabled:opacity-50" title="Copy code"><CopyIcon className="w-4 h-4"/></button>
          <button onClick={handleDownloadFile} disabled={!activeFile} className="hover:bg-gray-700/50 disabled:opacity-50" title="Download file"><DownloadIcon className="w-4 h-4"/></button>
          <div className="w-px h-5 bg-gray-600 mx-1"></div>
          <button className="minimize-btn" title="Minimize"><MinimizeIcon /></button>
          <button className="maximize-btn" title="Maximize"><WindowMaximizeIcon /></button>
          <button className="close-btn" title="Close"><CloseIcon /></button>
        </div>
      </div>
      <div ref={codeContainerRef} className="code-content">
        <SyntaxHighlighter
          language={getLanguage(activePath || '')}
          style={customSyntaxStyle as any}
          showLineNumbers
          wrapLines
          lineNumberStyle={{ minWidth: '2.25em', color: '#858585', backgroundColor: 'transparent' }}
          customStyle={{ margin: 0, padding: 0, backgroundColor: 'transparent' }}
          codeTagProps={{ style: { fontFamily: '"Roboto Mono", monospace', fontSize: '0.9em' } }}
        >
          {codeToDisplay}
        </SyntaxHighlighter>
        {isLoading && currentStreamingFile && <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>}
      </div>
    </div>
  );

  const Previewer = () => (
    <div className="code-card animate-fade-in-right">
      <div className="code-titlebar">
        <div className="flex items-center space-x-1 p-1 bg-gray-900/50 rounded-md ml-2">
            {(['desktop', 'tablet', 'mobile'] as PreviewDevice[]).map(device => (
                <button key={device} onClick={() => setPreviewDevice(device)} title={device.charAt(0).toUpperCase() + device.slice(1)}
                    className={`p-1 rounded transition-colors ${previewDevice === device ? 'bg-blue-600/50 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                    {device === 'desktop' && <DesktopIcon className="w-5 h-5"/>}
                    {device === 'tablet' && <TabletIcon className="w-5 h-5"/>}
                    {device === 'mobile' && <MobileIcon className="w-5 h-5"/>}
                </button>
            ))}
        </div>
        <div className="buttons">
            <button className="minimize-btn" title="Minimize"><MinimizeIcon /></button>
            <button className="maximize-btn" title="Maximize"><WindowMaximizeIcon /></button>
            <button className="close-btn" title="Close"><CloseIcon /></button>
        </div>
      </div>
      <div className="p-4 flex items-center justify-center overflow-auto code-content bg-gray-900/50">
        <div className={`bg-white transition-all duration-300 ease-in-out ${deviceStyles[previewDevice]}`}>
          <iframe srcDoc={previewContent || ''} title="Live Preview" className="w-full h-full border-none"/>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#131314] text-gray-200 flex flex-col h-screen max-h-screen">
      <header className="flex items-center justify-between p-4 border-b border-gray-800/70 flex-shrink-0">
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-wider text-white">WEB<span className="text-blue-400">VIBER</span></h1>
            <span className="text-xs text-gray-500 tracking-widest -mt-1 font-mono">BLACKGIFT TECH</span>
        </div>
        <div className="flex items-center gap-4">
            {(isLoading || isDownloading) && (
                <div className="flex items-center gap-3 animate-fade-in-right">
                    <div className="loader"></div>
                    <span key={loaderText} className="text-sm text-gray-400 font-mono animate-text-focus-in">
                        {isLoading ? loaderText : 'Downloading...'}
                    </span>
                </div>
            )}
            {!isLoading && !isDownloading && (
                 <button
                    onClick={handleDownloadProject}
                    disabled={generatedFiles.length === 0}
                    className="flex items-center gap-2 text-gray-300 hover:text-blue-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-md hover:bg-gray-800/60"
                    title="Download Project as .zip"
                >
                    <DownloadProjectIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">Download Project</span>
                </button>
            )}
        </div>
      </header>
      
      <div className="flex flex-col-reverse md:flex-row flex-grow min-h-0">
        <aside className="w-full md:w-1/3 lg:w-2/5 flex flex-col p-0 border-t md:border-t-0 md:border-r border-gray-800/70">
          <div className="chat-container">
            <div ref={chatHistoryRef} className="chat-history">
              {chatHistory.map((msg, index) => (
                <div key={index} className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                  {msg.role === 'model' ? <ChatMessageContent content={msg.content} /> : msg.content}
                  {msg.isGenerating && <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>}
                </div>
              ))}
            </div>
            <div className="chat-input-container p-4">
              <div className="relative">
                <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder={apiKeyMissing ? "API Key must be configured in Netlify." : "e.g., A responsive login form..."}
                    className="w-full bg-gray-800/60 border border-gray-700/80 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none text-gray-200 placeholder-gray-500 chat-textarea"
                    disabled={isLoading || apiKeyMissing} rows={1} />
                <button
                  onClick={handleSendMessage} disabled={isLoading || !currentInput.trim() || apiKeyMissing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
                  title="Send message">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="relative w-full md:w-2/3 lg:w-3/5 flex flex-col md:flex-row min-h-0">
          <div className={`flex flex-col md:flex-row flex-grow min-h-0 ${showMobilePreview ? 'hidden' : ''}`}>
            <FileNavigator
              files={generatedFiles}
              activePath={activePath}
              onFileClick={setActivePath}
              onPreviewClick={() => setActivePath('preview')}
              previewContentExists={!!previewContent}
            />
            <div className="w-full md:flex-grow flex flex-col min-w-0 min-h-0">
              {generatedFiles.length === 0 ? (
                <div className="code-card">
                  <div className="code-titlebar">
                    <span className="font-mono text-sm truncate px-4">Code Canvas</span>
                     <div className="buttons">
                        <button className="minimize-btn" title="Minimize"><MinimizeIcon /></button>
                        <button className="maximize-btn" title="Maximize"><WindowMaximizeIcon /></button>
                        <button className="close-btn" title="Close"><CloseIcon /></button>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 code-content">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    <h2 className="text-xl font-semibold text-white">Code Canvas</h2>
                    <p className="mt-1 text-gray-400">Your generated code will appear here.</p>
                  </div>
                </div>
              ) : activePath === 'preview' ? (
                <Previewer />
              ) : (
                <CodeEditor />
              )}
            </div>
          </div>

          {showMobilePreview && previewContent && (
              <div className="mobile-preview-overlay bg-[#1e1e1e] animate-fade-in-right">
                  <div className="flex justify-between items-center p-2 bg-gray-800/40 border-b border-gray-800/70 flex-shrink-0">
                      <span className="text-sm font-medium text-white px-2">Preview</span>
                      <button onClick={() => setActivePath(lastCodePathRef.current)} title="Close Preview"
                          className="p-2 rounded-full text-gray-300 bg-gray-700/50 hover:bg-gray-600/80 hover:text-white transition-colors">
                          <XIcon className="w-5 h-5"/>
                      </button>
                  </div>
                  <iframe srcDoc={previewContent} title="Mobile Preview" className="w-full h-full border-none bg-white"/>
              </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;