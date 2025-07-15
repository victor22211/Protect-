// Configuración avanzada para optimizar las APIs de OpenAI y Gemini
export interface APIConfig {
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  rateLimitDelay: number;
  contextWindowSize: number;
  streamingEnabled: boolean;
  enhancedInstructions: boolean;
}

export const OPENAI_CONFIG: APIConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000,
  rateLimitDelay: 2000,
  contextWindowSize: 16000,
  streamingEnabled: true,
  enhancedInstructions: true,
};

export const GEMINI_CONFIG: APIConfig = {
  maxRetries: 3,
  retryDelay: 1500,
  timeout: 45000,
  rateLimitDelay: 1000,
  contextWindowSize: 32000,
  streamingEnabled: true,
  enhancedInstructions: true,
};

// Configuraciones específicas para mejorar la inteligencia de los modelos
export const ENHANCED_SYSTEM_PROMPTS = {
  reasoning: `
MODO RAZONAMIENTO AVANZADO ACTIVADO:
- Analiza cada pregunta desde múltiples perspectivas
- Proporciona razonamiento paso a paso cuando sea apropiado
- Considera las implicaciones y consecuencias de tus respuestas
- Busca patrones y conexiones profundas en la información
- Mantén un equilibrio entre precisión y claridad
`,
  creativity: `
MODO CREATIVO MEJORADO ACTIVADO:
- Piensa fuera de lo convencional y ofrece perspectivas únicas
- Combina conceptos de manera innovadora
- Usa analogías y metáforas efectivas
- Proporciona soluciones creativas y originales
- Mantén un equilibrio entre creatividad y utilidad práctica
`,
  analysis: `
MODO ANÁLISIS CRÍTICO ACTIVADO:
- Examina la información de manera crítica y objetiva
- Identifica fortalezas y debilidades en argumentos
- Proporciona múltiples interpretaciones cuando sea relevante
- Evalúa la credibilidad y relevancia de la información
- Mantén un enfoque equilibrado y basado en evidencia
`,
  optimization: `
MODO OPTIMIZACIÓN ACTIVADO:
- Busca constantemente la eficiencia y mejora
- Proporciona sugerencias para optimizar procesos
- Considera factores de rendimiento y escalabilidad
- Ofrece alternativas y mejores prácticas
- Mantén un enfoque en resultados medibles
`,
};

// Configuraciones de temperatura y creatividad optimizadas
export const TEMPERATURE_CONFIGS = {
  flash: {
    temperature: 0.8,
    topP: 0.95,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
    maxTokens: 8192,
  },
  gpt4oMini: {
    temperature: 0.9,
    topP: 0.95,
    frequencyPenalty: 0.2,
    presencePenalty: 0.15,
    maxTokens: 16384,
  },
  creative: {
    temperature: 1.0,
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.25,
    maxTokens: 8192,
  },
  developer: {
    temperature: 0.7,
    topP: 0.95,
    frequencyPenalty: 0.05,
    presencePenalty: 0.1,
    maxTokens: 16384,
  },
};

// Utility functions para mejorar la experiencia
export const enhancePrompt = (prompt: string, mode: keyof typeof ENHANCED_SYSTEM_PROMPTS): string => {
  const enhancement = ENHANCED_SYSTEM_PROMPTS[mode];
  return `${enhancement}\n\nConsulta del usuario: ${prompt}`;
};

export const optimizeForPersonality = (prompt: string, personality: string): string => {
  const optimizations = {
    flash: `RESPUESTA RÁPIDA Y PRECISA REQUERIDA: ${prompt}`,
    'gpt4o-mini': `ANÁLISIS COMPLETO Y DETALLADO: ${prompt}`,
    creative: `ENFOQUE CREATIVO E INNOVADOR: ${prompt}`,
    developer: `SOLUCIÓN TÉCNICA PROFESIONAL: ${prompt}`,
  };
  
  return optimizations[personality as keyof typeof optimizations] || prompt;
};

// Configuración para manejo de errores mejorado
export const ERROR_MESSAGES = {
  api_limit: 'Límite de API alcanzado. Reintentando en unos momentos...',
  network_error: 'Error de conexión. Verificando conectividad...',
  invalid_response: 'Respuesta inválida del servidor. Procesando nuevamente...',
  timeout: 'Tiempo de espera agotado. Reiniciando solicitud...',
  unknown: 'Error inesperado. Nuestro sistema está trabajando para resolverlo...',
};

// Configuración de caché para mejorar rendimiento
export const CACHE_CONFIG = {
  maxSize: 1000,
  ttl: 300000, // 5 minutos
  enablePersistence: true,
  compressionEnabled: true,
};

// Configuración de monitoreo y métricas
export const MONITORING_CONFIG = {
  trackResponseTime: true,
  trackTokenUsage: true,
  trackErrorRates: true,
  enableAnalytics: true,
  logLevel: 'info' as const,
};

export default {
  OPENAI_CONFIG,
  GEMINI_CONFIG,
  ENHANCED_SYSTEM_PROMPTS,
  TEMPERATURE_CONFIGS,
  ERROR_MESSAGES,
  CACHE_CONFIG,
  MONITORING_CONFIG,
  enhancePrompt,
  optimizeForPersonality,
};