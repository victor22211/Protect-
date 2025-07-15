import React, { useState, useEffect } from 'react';
import type { ChatMessage, Sender, AIPersonality } from './types';
import { PERSONALITIES, PERSONALITY_ORDER } from './types';
import Header from './components/Header';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import { streamChat as streamOpenAI, generateCompletion as generateOpenAI } from './services/openai_service';
import { startChat as startGeminiChat, generateText as generateGeminiText, generateImage as generateGeminiImage } from './services/gemini_service';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState<AIPersonality>('flash');
  const [geminiChatSessions, setGeminiChatSessions] = useState<Map<string, any>>(new Map());
  
  const currentConfig = PERSONALITIES[currentPersonality];

  useEffect(() => {
    // Mensaje de bienvenida inicial
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.AI,
      text: currentConfig.welcomeMessage,
    };
    setMessages([welcomeMessage]);
  }, [currentPersonality]);

  const handleSendMessage = async (message: string, file?: File) => {
    if (!message.trim() && !file) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.User,
      text: message,
      fileInfo: file ? { name: file.name, type: file.type, size: file.size } : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response = '';
      const config = PERSONALITIES[currentPersonality];

      if (config.type === 'image') {
        // Modelo creativo para generación de imágenes
        response = await generateGeminiImage(message);
      } else if (config.provider === 'openai') {
        // Usar OpenAI para GPT-4o Mini
        const conversationHistory = messages
          .filter(msg => msg.sender === Sender.User || msg.sender === Sender.AI)
          .slice(-10) // Mantener solo las últimas 10 conversaciones para contexto
          .map(msg => ({
            role: msg.sender === Sender.User ? 'user' as const : 'assistant' as const,
            content: msg.text,
          }));

        // Agregar instrucciones del sistema
        const systemMessage = {
          role: 'system' as const,
          content: config.systemInstruction,
        };

        const fullConversation = [
          systemMessage,
          ...conversationHistory,
          { role: 'user' as const, content: message },
        ];

        // Usar streaming para respuestas más dinámicas
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: Sender.AI,
          text: '',
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);

        const stream = streamOpenAI(config.model, fullConversation);
        
        for await (const chunk of stream) {
          aiMessage.text += chunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessage.id ? { ...msg, text: aiMessage.text } : msg
            )
          );
        }
        
        return;
      } else {
        // Usar Gemini para modelos Flash y Desarrollador
        const sessionKey = `${currentPersonality}_${config.model}`;
        
        if (!geminiChatSessions.has(sessionKey)) {
          const chatSession = startGeminiChat(config.systemInstruction, config.model);
          setGeminiChatSessions(new Map(geminiChatSessions.set(sessionKey, chatSession)));
        }

        const chatSession = geminiChatSessions.get(sessionKey);
        
        if (chatSession) {
          const result = await chatSession.sendMessage(message);
          response = result.response.text();
        } else {
          // Fallback si no hay sesión de chat
          response = await generateGeminiText(config.model, config.systemInstruction, message);
        }
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.AI,
        text: response,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: Sender.AI,
        text: `❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: Sender.AI,
      text: currentConfig.welcomeMessage,
    };
    setMessages([welcomeMessage]);
    
    // Limpiar sesiones de chat de Gemini
    setGeminiChatSessions(new Map());
  };

  const handlePersonalityChange = (personality: AIPersonality) => {
    setCurrentPersonality(personality);
    // Limpiar sesiones de chat cuando cambia la personalidad
    setGeminiChatSessions(new Map());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
      <div className="flex flex-col h-screen">
        <Header 
          currentPersonality={currentPersonality}
          onPersonalityChange={handlePersonalityChange}
          onClearChat={handleClearChat}
        />
        
        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} />
          {isLoading && <TypingIndicator />}
        </div>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isImageModel={currentConfig.type === 'image'}
        />
      </div>
    </div>
  );
};

export default App;