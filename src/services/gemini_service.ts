import { GoogleGenerativeAI, GenerativeModel, type ChatSession } from '@google/generative-ai';

let genai: GoogleGenerativeAI | undefined;

function getGeminiClient(): GoogleGenerativeAI {
    if (!genai) {
        // API key proporcionada por el usuario
        const apiKey = "AIzaSyBdUlE00dJlgo74jhzGqs1zJlS7cyCjXv4";
        if (!apiKey) {
            throw new Error("La clave de API de Gemini no está configurada.");
        }
        genai = new GoogleGenerativeAI(apiKey);
    }
    return genai;
}

export function startChat(systemInstruction: string, modelName: string): ChatSession {
    try {
        const model: GenerativeModel = getGeminiClient().getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemInstruction,
        });
        
        return model.startChat({
            history: [],
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
                candidateCount: 1,
                stopSequences: [],
            },
        });
    } catch (error) {
        console.error('Error al inicializar chat de Gemini:', error);
        throw new Error('Error al inicializar Gemini. Verifica tu configuración.');
    }
}

export async function generateImage(prompt: string): Promise<string> {
    try {
        // Nota: Gemini no soporta generación de imágenes directamente
        // Esta función retorna una descripción detallada de la imagen solicitada
        const model = getGeminiClient().getGenerativeModel({ 
            model: 'gemini-1.5-flash' 
        });
        
        const enhancedPrompt = `Crea una descripción extremadamente detallada y vivida de esta imagen para que un artista pueda recrearla perfectamente: ${prompt}. 
        
        Incluye todos los detalles posibles: colores exactos, texturas, iluminación, composición, estilo artístico, elementos en primer plano y fondo, emociones transmitidas, perspectiva, proporciones, materiales, efectos visuales, y cualquier elemento que haría única esta imagen.
        
        Estructura la descripción como si fuera para un generador de imágenes AI profesional.`;
        
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        
        return response.text();
    } catch (error) {
        console.error('Error en generación de descripción de imagen:', error);
        throw new Error('Error al generar descripción de imagen con Gemini.');
    }
}

export async function generateText(
    modelName: string,
    systemInstruction: string,
    prompt: string
): Promise<string> {
    try {
        const model = getGeminiClient().getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemInstruction,
        });
        
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
                candidateCount: 1,
            },
        });
        
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error en Gemini text generation:', error);
        throw new Error('Error al generar texto con Gemini.');
    }
}