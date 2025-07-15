import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

let openai: OpenAI | undefined;

function getOpenAI(): OpenAI {
    if (!openai) {
        // Usar variable de entorno en lugar de hardcodear
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("La clave de API de OpenAI (OPENAI_API_KEY) no está configurada.");
        }
        openai = new OpenAI({ 
          apiKey: apiKey,
          dangerouslyAllowBrowser: true, 
        });
    }
    return openai;
}

export async function* streamChat(
    model: string,
    messages: ChatCompletionMessageParam[]
): AsyncIterable<string> {
    try {
        const stream = await getOpenAI().chat.completions.create({
            model: model,
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4096,
        });

        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                yield chunk.choices[0].delta.content;
            }
        }
    } catch (error) {
        console.error('Error en OpenAI stream:', error);
        throw new Error('Error al comunicarse con OpenAI. Verifica tu configuración.');
    }
}

export async function generateCompletion(
    model: string,
    messages: ChatCompletionMessageParam[]
): Promise<string> {
    try {
        const response = await getOpenAI().chat.completions.create({
            model: model,
            messages: messages,
            temperature: 0.7,
            max_tokens: 4096,
        });

        return response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error en OpenAI completion:', error);
        throw new Error('Error al generar respuesta con OpenAI.');
    }
}