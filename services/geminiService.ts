import { GoogleGenAI, Chat } from "@google/genai";

let ai: GoogleGenAI | undefined;

function getGoogleAI() {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("La clave de API de Google (API_KEY) no está configurada.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}


export function startChat(systemInstruction: string, model: string): Chat {
  return getGoogleAI().chats.create({
    model: model as 'gemini-2.5-flash',
    config: {
        systemInstruction: systemInstruction,
    },
  });
}

export async function generateImage(prompt: string): Promise<string> {
    const response = await getGoogleAI().models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }
    
    throw new Error("No se pudo generar la imagen.");
}
