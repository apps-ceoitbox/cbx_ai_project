import OpenAI from "openai";

export interface ApiProvider {
    name: "ChatGPT (OpenAI)" | "Claude (Anthropic)" | "Gemini (Google)" | "Groq (Groq)" | "Llama (Meta)" | "Deepseek" | "Ollama (Self-hosted)" | "Perplexity" | "Mistral";
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
}


export class AI {
    apiProvider: ApiProvider;
    ai: OpenAI;
    constructor(apiProvider: ApiProvider) {
        this.apiProvider = apiProvider;
        this.ai = new OpenAI({
            apiKey: "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",
            // apiKey: apiProvider.apiKey,
        });
    }

    async generateResponse(prompt: string) {
        switch (this.apiProvider.name) {
            case "ChatGPT (OpenAI)": {
                const response = await this.ai.chat.completions.create({
                    model: "gpt-4-turbo",
                    messages: [{ role: "user", content: prompt }],
                    temperature: this.apiProvider.temperature,
                    max_tokens: this.apiProvider.maxTokens,
                });

                console.log(response.choices[0].message.content);
            }
        }
    }
}   
