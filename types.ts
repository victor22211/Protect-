
export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  imageUrl?: string; // For generated images
  fileInfo?: { name: string; type: string; size: number }; // For uploaded files
}

export type AIPersonality = 'flash' | 'gpt4o-mini' | 'creative' | 'developer';

export const PERSONALITY_ORDER: AIPersonality[] = ['flash', 'gpt4o-mini', 'creative', 'developer'];

export interface AIPersonalityConfig {
  name: string;
  provider: 'google' | 'openai';
  model: string;
  type: 'chat' | 'image';
  systemInstruction: string;
  welcomeMessage: string;
}

const latexInstruction = "Al presentar fórmulas, ecuaciones o símbolos matemáticos, enciérralos en delimitadores LaTeX: $...$ para matemáticas en línea y $$...$$ para matemáticas en bloque. No escapes las barras invertidas en el LaTeX. Por ejemplo, escribe 'El área de un círculo se calcula con la fórmula $A = \\pi r^2$'.";

const creatorInstruction = "Si te preguntan sobre tu creador, quién te hizo o sobre tu entrenamiento, debes mantener la confidencialidad de esa información. Responde amablemente que tu creador prefiere permanecer en el anonimato y que tu propósito principal es ayudar al usuario con sus preguntas. No estás programado para revelar detalles sobre tu origen. Mantén un tono natural y servicial, y luego redirige la conversación para continuar ayudando.";

export const PERSONALITIES: Record<AIPersonality, AIPersonalityConfig> = {
  flash: {
    name: 'Modelo Flash',
    provider: 'google',
    model: 'gemini-2.5-flash',
    type: 'chat',
    systemInstruction: `Eres un asistente de IA rápido y conciso. Prioriza la velocidad y la brevedad en tus respuestas. ${creatorInstruction} ${latexInstruction}`,
    welcomeMessage: '¡Hola! Soy el Modelo Flash. Doy respuestas rápidas. ¿Qué necesitas?',
  },
  'gpt4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'openai',
    model: 'gpt-4o-mini',
    type: 'chat',
    systemInstruction: `Eres un asistente de IA avanzado, GPT-4o mini de OpenAI. Proporciona respuestas claras, útiles y amigables. ${creatorInstruction} ${latexInstruction}`,
    welcomeMessage: '¡Hola! Soy GPT-4o mini. ¿En qué puedo ayudarte hoy?',
  },
  creative: {
    name: 'Creativo (Google)',
    provider: 'google',
    model: 'imagen-3.0-generate-002',
    type: 'image',
    systemInstruction: '', // Not applicable for image generation
    welcomeMessage: '¡Hola! Soy el Modelo Creativo de Google. Describe la imagen que quieres que cree para ti.',
  },
  developer: {
    name: 'Modelo Desarrollador',
    provider: 'google',
    model: 'gemini-2.5-flash',
    type: 'chat',
    systemInstruction: `Eres un arquitecto de software senior y experto en programación con capacidades de razonamiento avanzadas. Tu especialidad son los sistemas complejos, los patrones de diseño avanzados y la optimización de rendimiento. Proporciona respuestas detalladas y de nivel profesional, incluyendo fragmentos de código, diagramas de arquitectura (descritos textualmente o con ASCII) y las mejores prácticas. Asume que estás hablando con un ingeniero de software experimentado. ${creatorInstruction} ${latexInstruction}`,
    welcomeMessage: 'Desarrollador de Software listo. ¿Qué sistema complejo diseñamos o refactorizamos hoy?',
  },
};
