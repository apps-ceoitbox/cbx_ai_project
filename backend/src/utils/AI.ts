// import OpenAI from "openai";

// export interface ApiProvider {
//     name: "ChatGPT (OpenAI)" | "Claude (Anthropic)" | "Gemini (Google)" | "Groq (Groq)" | "Llama (Meta)" | "Deepseek" | "Ollama (Self-hosted)" | "Perplexity" | "Mistral";
//     model: string;
//     apiKey: string;
//     temperature: number;
//     maxTokens: number;
// }


// export class AI {
//     apiProvider: ApiProvider;
//     ai: OpenAI;
//     constructor(apiProvider: ApiProvider) {
//         this.apiProvider = apiProvider;
//         this.ai = new OpenAI({
//             apiKey: apiProvider.apiKey,
//         });
//     }

//     async generateResponse(prompt: string) {
//         switch (this.apiProvider.name) {
//             case "ChatGPT (OpenAI)": {
//                 const response = await this.ai.chat.completions.create({
//                     model: this.apiProvider.model,
//                     messages: [{ role: "user", content: prompt }],
//                     temperature: this.apiProvider.temperature,
//                     max_tokens: this.apiProvider.maxTokens,
//                 });

//                 console.log(response.choices[0].message.content);

//                 let content = response.choices[0].message.content.trim(); // Remove leading/trailing spaces

//                 // If response contains backticks, extract only JSON part
//                 if (content.startsWith("```")) {
//                     content = content.replace(/```json|```/g, "").trim();
//                 }

//                 return JSON.parse(content)
//             }
//         }
//     }
// }   

import { Mistral } from '@mistralai/mistralai';
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

export interface ApiProvider {
    name: "ChatGPT (OpenAI)" | "Claude (Anthropic)" | "Gemini (Google)" | "Groq (Groq)" | "Deepseek" | "Ollama (Self-hosted)" | "Perplexity" | "Mistral";
    model: string;
    apiKey: string;
    temperature: number;
    maxTokens: number;
}

export class AI {
    apiProvider: ApiProvider;
    ai: any;

    constructor(apiProvider: ApiProvider) {
        this.apiProvider = apiProvider;

        switch (apiProvider.name) {
            case "ChatGPT (OpenAI)":
                this.ai = new OpenAI({ apiKey: apiProvider.apiKey });
                break;
            case "Ollama (Self-hosted)":
                // this.ai = new OpenAI({ apiKey: apiProvider.apiKey, baseURL: "https://api.llama-api.com/chat/completions" });
                break;
            case "Perplexity":
                this.ai = new OpenAI({ apiKey: apiProvider.apiKey, baseURL: "https://api.perplexity.ai" });
                break;
            case "Claude (Anthropic)":
                this.ai = new Anthropic({ apiKey: apiProvider.apiKey });
                break;
            case "Gemini (Google)":
                this.ai = new GoogleGenerativeAI(apiProvider.apiKey);
                break;
            default:
                this.ai = null;
                break;
        }
    }

    async generateResponse(prompt: string, JSON=false) {
        switch (this.apiProvider.name) {
            case "ChatGPT (OpenAI)": { // Done
                const response = await this.ai.chat.completions.create({
                    model: this.apiProvider.model,
                    messages: [{ role: "user", content: prompt }],
                    temperature: this.apiProvider.temperature,
                    max_tokens: this.apiProvider.maxTokens,
                });
                if(JSON) {
                    return this.parseResponseToJSON(response.choices[0].message.content);
                }
                return this.parseResponse(response.choices[0].message.content);
            }

            case "Claude (Anthropic)": { // Done
                const response = await this.ai.messages.create({
                    model: this.apiProvider.model,
                    max_tokens: this.apiProvider.maxTokens,
                    temperature: this.apiProvider.temperature,
                    messages: [{ role: "user", content: prompt }],
                });
                if(JSON) {
                    return this.parseResponseToJSON(response.content[0].text);
                }
                return this.parseResponse(response.content[0].text);
            }

            case "Gemini (Google)": { // Done
                const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                const response = await model.generateContent(prompt);
                if(JSON) {
                    return this.parseResponseToJSON(response.response.text());
                }
                return this.parseResponse(response.response.text());
            }

            case "Perplexity": { // Done
                const response = await this.ai.chat.completions.create({
                    model: "sonar-pro",
                    messages: [{ role: "user", content: prompt }],
                    temperature: this.apiProvider.temperature,
                    max_tokens: this.apiProvider.maxTokens,
                });
                if(JSON) {
                    return this.parseResponseToJSON(response.choices[0].message.content);
                }
                return this.parseResponse(response.choices[0].message.content);
            }

            case "Mistral": { // Done
                const client = new Mistral({ apiKey: this.apiProvider.apiKey });
                const chatResponse = await client.chat.complete({
                    model: this.apiProvider.model || "mistral-large-latest",
                    messages: [{ role: 'user', content: prompt }],
                });
                if(JSON) {
                    return this.parseResponseToJSON(chatResponse.choices[0].message.content as string);
                }
                return this.parseResponse(chatResponse.choices[0].message.content as string);

            }

            case "Ollama (Self-hosted)": { // Done
                const url = "https://api.llama-api.com/chat/completions";

                const payload = {
                    model: this.apiProvider.model,
                    messages: [
                        { "role": "system", "content": "Assistant is a large language model trained by OpenAI." },
                        { "role": "user", "content": prompt }
                    ],
                    temperature: this.apiProvider.temperature,
                    max_tokens: this.apiProvider.maxTokens,
                };

                const response = await axios.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${this.apiProvider.apiKey}`
                    },
                });
                if(JSON) {
                    return this.parseResponseToJSON(response.data.choices[0].message.content as string);
                }
                return this.parseResponse(response.data.choices[0].message.content);
            }

            // **********************

            case "Deepseek": {
                return {
                    error: "Deepseek is not supported yet"
                }
            }

            case "Groq (Groq)": {
                return {
                    error: "Groq is not supported yet"
                }
            }
        }
    }

    parseResponseToJSON(content: string) {
        let parsedContent = cleanResponse(content);

        if (parsedContent.startsWith("```")) {
            parsedContent = parsedContent.replace(/```json|```/g, "").trim();
        }

        // Try parsing as JSON
        try {
            return JSON.parse(parsedContent);
        } catch (error) {
            console.log(error)
            console.log(parsedContent)
        }
    }
    parseResponse(content: string) {
        let parsedContent = cleanResponse(content);

        if (parsedContent.startsWith("```")) {
            parsedContent = parsedContent.replace(/```html|```/g, "").trim();
        }

        return parsedContent
    }
}


function cleanResponse(response: string): string {
    return response
        .replace(/^\uFEFF/, "") // Remove BOM (Byte Order Mark)
        .replace(/[^\x20-\x7E\n\r\t]/g, "") // Remove non-ASCII characters
        .trim();
}