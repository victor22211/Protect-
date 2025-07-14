function getGemini() {
    if (!gemini) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("La clave de API de Gemini no está configurada.");
        }
        // Tu configuración de Gemini aquí
    }
    return gemini;
}