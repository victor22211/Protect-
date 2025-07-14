
import React, { useState, useEffect, useCallback } from 'react';
import type { Chat, Part } from '@google/genai';
import type { ChatCompletionMessageParam, ChatCompletionContentPart } from 'openai/resources/chat/completions';
import { Sender, ChatMessage, AIPersonality, PERSONALITIES } from './types';
import { startChat, generateImage as generateGeminiImage } from './services/geminiService';
import { streamChat as streamOpenAIChat } from './services/openaiService';
import Header from './components/Header';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chat, setChat] = useState<Chat | null>(null); // Gemini-specific chat session
  const [error, setError] = useState<string | null>(null);
  const [personality, setPersonality] = useState<AIPersonality>('flash');

  const initializeChat = useCallback((selectedPersonality: AIPersonality) => {
    setError(null);
    const config = PERSONALITIES[selectedPersonality];

    // Reset messages with the welcome message for the new personality
    const welcomeMessage = {
      id: 'initial-message',
      sender: Sender.AI,
      text: config.welcomeMessage,
    };

    if (config.provider === 'google' && config.type === 'chat') {
        setIsLoading(true);
        try {
          const chatSession = startChat(config.systemInstruction, config.model);
          setChat(chatSession);
          setMessages([welcomeMessage]);
        } catch (e: unknown) {
            handleApiError(e, 'An unknown error occurred during initialization.');
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    } else {
        // For 'image' type or OpenAI, reset Gemini chat and set welcome message
        setChat(null);
        setMessages([welcomeMessage]);
    }
  }, []);
  
  const handleApiError = (e: unknown, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if (e instanceof Error) {
        errorMessage = e.message;
    }
    console.error(e);
    setError(errorMessage);
  };

  useEffect(() => {
    initializeChat(personality);
  }, [initializeChat, personality]);

  const handlePersonalityChange = (newPersonality: AIPersonality) => {
    if (newPersonality !== personality) {
      setPersonality(newPersonality);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = useCallback(async (text: string, file?: File) => {
    const currentConfig = PERSONALITIES[personality];
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.User,
      text,
      fileInfo: file ? { name: file.name, type: file.type, size: file.size } : undefined,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    const aiMessageId = (Date.now() + 1).toString();

    try {
      // Add placeholder for AI response
      setMessages((prev) => [
        ...prev,
        { id: aiMessageId, sender: Sender.AI, text: '' },
      ]);

      if (currentConfig.provider === 'google') {
        if (currentConfig.type === 'image') {
          if (!text) throw new Error("Por favor, proporciona una descripción para generar la imagen.");
          const base64Image = await generateGeminiImage(text);
          setMessages((prev) => prev.map(msg => msg.id === aiMessageId ? { ...msg, imageUrl: base64Image } : msg));
        } else { // 'chat' type
          if (!chat) throw new Error("El chat no está inicializado. Por favor, recarga la página.");
          
          const parts: Part[] = [{ text }];
          if (file) {
              if (file.size > 120 * 1024 * 1024) throw new Error("El archivo es demasiado grande. El límite es 120 MB.");
              const base64Data = await fileToBase64(file);
              parts.push({ inlineData: { data: base64Data, mimeType: file.type } });
          }

          const stream = await chat.sendMessageStream({ message: parts });
          let aiResponseText = '';
          for await (const chunk of stream) {
              aiResponseText += chunk.text;
              setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? { ...msg, text: aiResponseText } : msg));
          }
        }
      } else if (currentConfig.provider === 'openai') {
          const history: ChatCompletionMessageParam[] = messages
            .filter(msg => msg.id !== 'initial-message' && msg.text)
            .map(msg => ({
              role: msg.sender === Sender.User ? 'user' : 'assistant',
              content: msg.text,
            }));
            
          const userContent: ChatCompletionContentPart[] = [
            { type: 'text', text }
          ];

          if (file) {
            const base64Image = await fileToBase64(file);
            userContent.push({ type: 'image_url', image_url: { url: `data:${file.type};base64,${base64Image}` } });
          }

          const openAIMessages: ChatCompletionMessageParam[] = [
            { role: 'system', content: currentConfig.systemInstruction },
            ...history,
            { role: 'user', content: userContent },
          ];

          const stream = streamOpenAIChat(currentConfig.model, openAIMessages);
          let aiResponseText = '';
          for await (const chunk of stream) {
            aiResponseText += chunk;
            setMessages((prev) => prev.map((msg) => msg.id === aiMessageId ? { ...msg, text: aiResponseText } : msg));
          }
      }
    } catch (e) {
        handleApiError(e, 'Ocurrió un error al obtener la respuesta.');
        setMessages((prev) => {
            const filtered = prev.filter(msg => msg.id !== aiMessageId);
            return [
                ...filtered,
                { id: (Date.now() + 2).toString(), sender: Sender.AI, text: 'Lo siento, algo salió mal. Por favor, inténtalo de nuevo.' },
            ];
        });
    } finally {
      setIsLoading(false);
    }
  }, [chat, personality, messages]);

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white font-sans">
      <Header 
        currentPersonality={personality} 
        onPersonalityChange={handlePersonalityChange} 
        isLoading={isLoading} 
      />
      {error && (
        <div className="bg-red-900/50 border-t border-b border-red-600/30 text-red-100 p-3 text-center text-sm">
            <strong>Error:</strong> {error}
        </div>
      )}
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        isImageModel={PERSONALITIES[personality].type === 'image'}
      />
    </div>
  );
};

export default App;
