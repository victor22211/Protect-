import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

let openai: OpenAI | undefined;

function getOpenAI() {
    if (!openai) {
        // API Key de OpenAI incluida directamente
        const apiKey = "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";
        if (!apiKey) {
            throw new Error("La clave de API de OpenAI (OPENAI_API_KEY) no está configurada.");
        }
        openai = new OpenAI({ 
          apiKey: apiKey,
          // This is required to use the library in a browser environment.
          dangerouslyAllowBrowser: true, 
        });
    }
    return openai;
}

/**
 * Creates a streaming chat completion from the OpenAI API.
 * @param model The model to use (e.g., 'gpt-4o-mini').
 * @param messages The chat history and new prompt.
 * @returns An async iterable that yields a stream of text chunks.
 */
export async function* streamChat(
    model: string,
    messages: ChatCompletionMessageParam[]
): AsyncIterable<string> {
    const stream = await getOpenAI().chat.completions.create({
        model: model,
        messages: messages,
        stream: true,
    });

    for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
            yield chunk.choices[0].delta.content;
        }
    }
}