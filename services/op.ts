function getOpenAI() {
    if (!openai) {
        const apiKey = process.env.OPENAI_API_KEY;
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