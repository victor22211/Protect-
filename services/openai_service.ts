import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

let openai: OpenAI | undefined;

function getOpenAI(): OpenAI {
    if (!openai) {
        // API key proporcionada por el usuario
        const apiKey = "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";
        if (!apiKey) {
            throw new Error("La clave de API de OpenAI no está configurada.");
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
            temperature: 0.8,
            max_tokens: 8192,
            top_p: 0.95,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
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
            temperature: 0.8,
            max_tokens: 8192,
            top_p: 0.95,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
        });

        return response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error en OpenAI completion:', error);
        throw new Error('Error al generar respuesta con OpenAI.');
    }
}