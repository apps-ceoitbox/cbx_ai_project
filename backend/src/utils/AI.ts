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
            apiKey: apiProvider.apiKey,
        });
    }

    async generateResponse(prompt: string) {
        switch (this.apiProvider.name) {
            case "ChatGPT (OpenAI)": {
                const response = await this.ai.chat.completions.create({
                    model: this.apiProvider.model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: this.apiProvider.temperature,
                    max_tokens: this.apiProvider.maxTokens,
                });

                console.log(response.choices[0].message.content);

                let content = response.choices[0].message.content.trim(); // Remove leading/trailing spaces

                // If response contains backticks, extract only JSON part
                if (content.startsWith("```")) {
                    content = content.replace(/```json|```/g, "").trim();
                }

                return JSON.parse(content)
            }
        }
    }
}   
