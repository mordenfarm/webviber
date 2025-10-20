
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { GeneratedFile, ChatMessage } from './types';
import { startChat } from './services/geminiService';
import type { Chat } from '@google/genai';
import { CopyIcon, DownloadIcon, SparklesIcon, DesktopIcon, TabletIcon, MobileIcon, MaximizeIcon, RestoreIcon } from './components/Icons';

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

interface LoaderProps {
  text: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
    return (
      <div className="loader-wrapper">
        <div className="flex flex-wrap justify-center items-center px-4">
          {text.split('').map((char, index) => (
            <span
              key={`${char}-${index}`}
              className="loader-letter"
              style={{ animationDelay: `${index * 0.05}s` }} // Faster animation delay
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
        <div className="loader"></div>
      </div>
    );
};

// New component to render chat messages with potential code blocks
const ChatMessageContent: React.FC<{ content: string }> = ({ content }) => {
    // This regex splits the string by ```code blocks```, keeping the delimiters
    const parts = content.split(/(```[\s\S]*?```)/g);
  
    return (
      <>
        {parts.map((part, i) => {
          // Check if the part is a code block
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
          // Otherwise, it's plain text
          return <span key={i}>{part}</span>;
        })}
      </>
    );
};


const App: React.FC = () => {
  const [currentInput, setCurrentInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm WEB VIBER. What amazing web component can I build for you today?" }
  ]);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [activeFilename, setActiveFilename] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditingLoading, setIsEditingLoading] = useState<boolean>(false);
  const [currentStreamingFile, setCurrentStreamingFile] = useState<GeneratedFile | null>(null);
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [showCodeLoader, setShowCodeLoader] = useState<boolean>(false);
  const [animateLoaderOut, setAnimateLoaderOut] = useState<boolean>(false);
  const [loaderText, setLoaderText] = useState('');
  
  // FIX: Corrected the typo in the type definition from `HTMLDivDivElement` to `HTMLDivElement`.
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  
  const activeFile = generatedFiles.find(f => f.filename === activeFilename);
  const codeToDisplay = isLoading && currentStreamingFile?.filename === activeFilename 
    ? currentStreamingFile.code 
    : activeFile?.code || '';
    
  const progressMessages = useRef([
    "Analyzing your vision...",
    "Drafting initial structure...",
    "Building HTML foundation...",
    "Styling with CSS...",
    "Adding JavaScript interactivity...",
    "Finalizing the files..."
  ]).current;

  const stopProgressMessages = useCallback(() => {
    if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
    }
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
        setTimeout(() => {
            element.scrollTop = element.scrollHeight;
        }, 50);
    }
  }, [codeToDisplay, isLoading]);
  
  const getLanguage = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const langMap: { [key: string]: string } = {
      js: 'javascript', html: 'html', css: 'css', php: 'php',
      ts: 'typescript', jsx: 'jsx', tsx: 'tsx', json: 'json', md: 'markdown',
    };
    return langMap[extension] || 'plaintext';
  };

  const generatePreview = (files: GeneratedFile[]) => {
    const htmlFile = files.find(f => f.language === 'html');
    if (!htmlFile) return null;

    let html = htmlFile.code;
    const cssFile = files.find(f => f.language === 'css');
    if (cssFile) {
        html = html.replace('</head>', `<style>${cssFile.code}</style></head>`);
    }
    const jsFile = files.find(f => f.language === 'javascript');
    if (jsFile) {
        html = html.replace('</body>', `<script>${jsFile.code}</script></body>`);
    }
    return html;
  };

  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim() || isLoading) return;
    
    const isInitialGeneration = generatedFiles.length === 0;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: currentInput }];
    setChatHistory(newHistory);
    setCurrentInput('');
    setIsLoading(true);

    if (isInitialGeneration) {
        setShowCodeLoader(true);
        setAnimateLoaderOut(false);
        setLoaderText('Powering up Blackgift servers...');
    } else {
        setIsEditingLoading(true);
    }
    
    setChatHistory(prev => [...prev, { role: 'model', content: '', isGenerating: true }]);

    try {
      const session = chatSession || startChat();
      if (!chatSession) setChatSession(session);
      
      const stream = await session.sendMessageStream({ message: currentInput });

      let buffer = '';
      let firstChunkReceived = false;
      let filesBuffer: GeneratedFile[] = [...generatedFiles];

      for await (const chunk of stream) {
        if (!firstChunkReceived && isInitialGeneration) {
            firstChunkReceived = true;
            setTimeout(() => startProgressMessages(), 1500);
        }

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
            const filename = match[1].trim();
            const code = match[2].trim();
            const newFile = { filename, language: getLanguage(filename), code };
            
            const existingFileIndex = filesBuffer.findIndex(f => f.filename === filename);
            if (existingFileIndex > -1) {
                filesBuffer[existingFileIndex] = newFile;
            } else {
                filesBuffer.push(newFile);
            }
            lastIndex = match.index + match[0].length;
        }

        if(JSON.stringify(filesBuffer) !== JSON.stringify(generatedFiles)) {
             setGeneratedFiles([...filesBuffer]);
        }
        if (filesBuffer.length > 0) {
           setActiveFilename(filesBuffer[filesBuffer.length-1].filename)
        }
        
        const remainingBuffer = rawCodeSoFar.substring(lastIndex);
        const streamingFileMatch = /START_FILE: (.*?)\n([\s\S]*)/.exec(remainingBuffer);

        if (streamingFileMatch) {
            const filename = streamingFileMatch[1].trim();
            if (activeFilename !== filename) setActiveFilename(filename);
            setCurrentStreamingFile({ filename, code: streamingFileMatch[2], language: getLanguage(filename) });
        } else {
            setCurrentStreamingFile(null);
        }
      }
      
      stopProgressMessages();
      const finalFiles = [...filesBuffer];
      setGeneratedFiles(finalFiles);
      setCurrentStreamingFile(null);
      
      if (finalFiles.length > 0) {
        if (isInitialGeneration) {
            setAnimateLoaderOut(true);
            setTimeout(() => setShowCodeLoader(false), 1000);
        }
        
        const preview = generatePreview(finalFiles);
        setPreviewContent(preview);
        if (!activeFilename) setActiveFilename(finalFiles[0].filename);

      } else {
        setShowCodeLoader(false);
         setChatHistory(prev => [...prev, { role: 'model', content: "Sorry, I couldn't generate any files from that. Could you try rephrasing?" }]);
      }

    } catch (e: any) {
       console.error(e);
       setChatHistory(prev => [...prev, { role: 'model', content: e.message || "An unknown error occurred." }]);
       setShowCodeLoader(false);
       stopProgressMessages();
    } finally {
      setIsLoading(false);
      setIsEditingLoading(false);
      setChatHistory(prev => {
        if (prev.length === 0) return [];
        const lastMessage = prev[prev.length - 1];
        if (!lastMessage) return prev;
        const updatedMessage = { ...lastMessage, isGenerating: false };
        return [...prev.slice(0, -1), updatedMessage];
      });
    }
  }, [currentInput, isLoading, chatHistory, chatSession, generatedFiles, activeFilename, startProgressMessages, stopProgressMessages]);

  const handleCopy = () => {
    const file = generatedFiles.find(f => f.filename === activeFilename);
    if (!file) return;
    navigator.clipboard.writeText(file.code).then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus(''), 2000);
    });
  };

  const handleDownload = () => {
    const file = generatedFiles.find(f => f.filename === activeFilename);
    if (!file) return;
    const blob = new Blob([file.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };
  
  const currentLanguage = getLanguage(activeFilename || '');

  const deviceStyles: {[key in PreviewDevice]: string} = {
    desktop: 'w-full h-full',
    tablet: 'w-[768px] max-w-full h-[1024px] max-h-full rounded-lg shadow-2xl border-4 border-gray-600',
    mobile: 'w-[375px] max-w-full h-[667px] max-h-full rounded-lg shadow-2xl border-4 border-gray-600',
  };

  const mainGridClass = previewContent ? isPreviewMaximized ? 'grid grid-cols-1' : 'grid grid-cols-1 md:grid-cols-2' : '';

  return (
    <div className="bg-[#131314] text-gray-200 flex flex-col h-screen max-h-screen">
      <header className="flex items-center justify-between p-4 border-b border-gray-800/70 flex-shrink-0 relative">
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-wider text-white">WEB<span className="text-blue-400">VIBER</span></h1>
            <span className="text-xs text-gray-500 tracking-widest -mt-1 font-mono">BLACKGIFT TECH</span>
        </div>
        {isEditingLoading && (
            <div className="header-loader animate-fade-in-right">
                Updating Code...
                <span className="dot-pulse"></span>
            </div>
        )}
      </header>
      
      <div className="flex flex-col md:flex-row flex-grow min-h-0">
        <aside className="w-full md:w-1/3 flex flex-col p-0 border-b md:border-b-0 md:border-r border-gray-800/70">
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="e.g., A responsive login form..."
                    className="w-full bg-gray-800/60 border border-gray-700/80 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow resize-none text-gray-200 placeholder-gray-500 chat-textarea"
                    disabled={isLoading}
                    rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !currentInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
                  title="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className={`w-full md:w-2/3 bg-[#1e1e1e] min-w-0 transition-all duration-500 md:min-h-0 ${mainGridClass}`}>
          <div className={`flex flex-col min-w-0 min-h-0 ${isPreviewMaximized ? 'hidden' : ''}`}>
            {(generatedFiles.length > 0) ? (
              <>
                <div className="flex p-2 space-x-2 border-b border-gray-800/70 bg-[#131314] flex-shrink-0 overflow-x-auto">
                    {[...new Set([...generatedFiles.map(f => f.filename), currentStreamingFile?.filename].filter(Boolean))]
                      .map(filename => {
                        const file = generatedFiles.find(f => f.filename === filename) || currentStreamingFile;
                        return file && (
                          <button
                              key={file.filename}
                              onClick={() => setActiveFilename(file.filename)}
                              className={`py-2 px-4 text-sm rounded-md transition-colors flex-shrink-0 font-medium ${activeFilename === file.filename ? 'bg-blue-600/30 text-blue-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}
                          >{file.filename}</button>
                        )
                    })}
                </div>
                
                {activeFilename && !isLoading && generatedFiles.length > 0 && (
                  <div className="flex justify-between items-center p-3 bg-gray-800/40 border-b border-gray-800/70 flex-shrink-0">
                    <span className="text-sm text-gray-400 font-mono">{activeFilename}</span>
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm transition-opacity duration-300 font-medium ${copyStatus ? 'opacity-100' : 'opacity-0'} ${copyStatus === 'Copied!' ? 'text-green-400' : 'text-red-400'}`}>{copyStatus}</span>
                      <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors" title="Copy code"><CopyIcon className="w-5 h-5"/></button>
                      <button onClick={handleDownload} className="text-gray-400 hover:text-white transition-colors" title="Download file"><DownloadIcon className="w-5 h-5"/></button>
                    </div>
                  </div>
                )}
                <div className="relative h-[60vh] md:h-auto md:flex-grow min-h-0 bg-[#1e1e1e] font-mono">
                  <div ref={codeContainerRef} className="absolute inset-0 overflow-auto">
                    <div className="p-4 text-sm relative">
                      <SyntaxHighlighter language={currentLanguage} style={dracula} showLineNumbers wrapLines
                        lineNumberStyle={{ minWidth: '2.25em', color: '#858585' }}
                        customStyle={{ margin: 0, padding: 0, backgroundColor: 'transparent', fontFamily: '"Roboto Mono", monospace' }}>
                        {codeToDisplay}
                      </SyntaxHighlighter>
                      {isLoading && currentStreamingFile && <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>}
                    </div>
                  </div>
                   {showCodeLoader && (
                        <div className={`code-loader-container ${animateLoaderOut ? 'animate-slide-out-right' : ''}`}>
                            <Loader text={loaderText} />
                        </div>
                    )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 md:border-r border-gray-800/70">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <h2 className="text-xl font-semibold text-white">Code Canvas</h2>
                <p className="mt-1 text-gray-400">Your generated code will appear here.</p>
                {showCodeLoader && (
                    <div className={`code-loader-container ${animateLoaderOut ? 'animate-slide-out-right' : ''}`}>
                        <Loader text={loaderText} />
                    </div>
                )}
              </div>
            )}
          </div>
            {previewContent && (
              <div className="flex flex-col min-w-0 min-h-0 border-t md:border-t-0 md:border-l border-gray-800/70 animate-fade-in-right">
                <div className="flex justify-between items-center p-2 bg-gray-800/40 border-b border-gray-800/70 flex-shrink-0">
                    <div className="flex items-center space-x-1 p-1 bg-gray-900/50 rounded-md">
                        {(['desktop', 'tablet', 'mobile'] as PreviewDevice[]).map(device => (
                            <button key={device} onClick={() => setPreviewDevice(device)} title={device.charAt(0).toUpperCase() + device.slice(1)}
                                className={`p-1 rounded transition-colors ${previewDevice === device ? 'bg-blue-600/50 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                                {device === 'desktop' && <DesktopIcon className="w-5 h-5"/>}
                                {device === 'tablet' && <TabletIcon className="w-5 h-5"/>}
                                {device === 'mobile' && <MobileIcon className="w-5 h-5"/>}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setIsPreviewMaximized(!isPreviewMaximized)} title={isPreviewMaximized ? 'Restore' : 'Maximize'}
                        className="p-2 rounded text-gray-400 hover:bg-gray-700/50 hover:text-white transition-colors">
                        {isPreviewMaximized ? <RestoreIcon className="w-5 h-5"/> : <MaximizeIcon className="w-5 h-5"/>}
                    </button>
                </div>
                <div className="h-[80vh] md:h-auto md:flex-grow p-4 bg-gray-900/50 flex items-center justify-center overflow-auto">
                    <div className={`bg-white transition-all duration-300 ease-in-out ${deviceStyles[previewDevice]}`}>
                       <iframe srcDoc={previewContent} title="Live Preview" className="w-full h-full border-none"/>
                    </div>
                </div>
              </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;
