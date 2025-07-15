
import React, { useState, useRef } from 'react';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
  isImageModel: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isImageModel }) => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || file) && !isLoading) {
      onSendMessage(input.trim(), file ?? undefined);
      setInput('');
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-zinc-900/70 backdrop-blur-sm p-4 border-t border-zinc-700">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {file && (
            <div className="mb-2 flex items-center justify-between bg-zinc-800 p-2 rounded-lg text-sm">
                <span className="text-gray-300 truncate">Adjunto: {file.name}</span>
                <button 
                    type="button" 
                    onClick={() => setFile(null)} 
                    className="text-red-500 hover:text-red-400 font-bold ml-2"
                    aria-label="Remove attachment"
                >
                    &times;
                </button>
            </div>
        )}
        <div className="flex items-center gap-2 md:gap-4">
            {!isImageModel && (
                <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={isLoading}
                    className="p-3 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Adjuntar archivo"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
                    </svg>
                </button>
            )}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading || isImageModel}
                accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.zip,application/zip,application/x-zip-compressed"
            />
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isImageModel ? "Describe una imagen para crear..." : "Escribe tu mensaje..."}
                disabled={isLoading}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300 disabled:opacity-50"
                autoComplete="off"
            />
            <button
                type="submit"
                disabled={isLoading || (!input.trim() && !file)}
                className="bg-red-600 text-white rounded-full p-3 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition duration-300 disabled:bg-zinc-700 disabled:cursor-not-allowed"
                aria-label="Enviar mensaje"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
            </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;