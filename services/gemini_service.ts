import { GoogleGenerativeAI, GenerativeModel, type Chat } from '@google/genai';

let genai: GoogleGenerativeAI | undefined;

function getGeminiClient(): GoogleGenerativeAI {
    if (!genai) {
        // Usar variable de entorno en lugar de hardcodear
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("La clave de API de Gemini (GEMINI_API_KEY) no está configurada.");
        }
        genai = new GoogleGenerativeAI(apiKey);
    }
    return genai;
}

export function startChat(systemInstruction: string, modelName: string): Chat {
    try {
        const model: GenerativeModel = getGeminiClient().getGenerativeModel({ 
            model: modelName,
            systemInstruction: systemInstruction,
        });
        
        return model.startChat({
            history: [],
            generationConfig: {
                temperature: 0.7,
                topK: 64,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
        });
    } catch (error) {
        console.error('Error al inicializar chat de Gemini:', error);
        throw new Error('Error al inicializar Gemini. Verifica tu configuración.');
    }
}

export async function generateImage(prompt: string): Promise<string> {
    try {
        const model = getGeminiClient().getGenerativeModel({ 
            model: 'imagen-3.0-generate-002' 
        });
        
        const result = await model.generateContent([{ text: prompt }]);
        const response = await result.response;
        
        // Extraer imagen base64 de la respuesta
        const text = response.text();
        const base64Match = text.match(/data:image\/[^;]+;base64,([^"]+)/);
        
        if (base64Match) {
            return base64Match[1];
        }
        
        throw new Error('No se pudo generar la imagen');
    } catch (error) {
        console.error('Error en generación de imagen:', error);
        throw new Error('Error al generar imagen con Gemini.');
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
        
        const result = await model.generateContent([{ text: prompt }]);
        const response = await result.response;
        
        return response.text();
    } catch (error) {
        console.error('Error en Gemini text generation:', error);
        throw new Error('Error al generar texto con Gemini.');
    }
}