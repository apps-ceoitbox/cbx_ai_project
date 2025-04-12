"use strict";
// import OpenAI from "openai";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI = void 0;
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
const mistralai_1 = require("@mistralai/mistralai");
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = __importDefault(require("axios"));
class AI {
    constructor(apiProvider) {
        this.apiProvider = apiProvider;
        switch (apiProvider.name) {
            case "ChatGPT (OpenAI)":
                this.ai = new openai_1.default({ apiKey: apiProvider.apiKey });
                break;
            case "Ollama (Self-hosted)":
                // this.ai = new OpenAI({ apiKey: apiProvider.apiKey, baseURL: "https://api.llama-api.com/chat/completions" });
                break;
            case "Perplexity":
                this.ai = new openai_1.default({ apiKey: apiProvider.apiKey, baseURL: "https://api.perplexity.ai" });
                break;
            case "Claude (Anthropic)":
                this.ai = new sdk_1.default({ apiKey: apiProvider.apiKey });
                break;
            case "Gemini (Google)":
                this.ai = new generative_ai_1.GoogleGenerativeAI(apiProvider.apiKey);
                break;
            default:
                this.ai = null;
                break;
        }
    }
    generateResponse(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.apiProvider.name) {
                case "ChatGPT (OpenAI)": { // Done
                    const response = yield this.ai.chat.completions.create({
                        model: this.apiProvider.model,
                        messages: [{ role: "user", content: prompt }],
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                    });
                    return this.parseResponse(response.choices[0].message.content);
                }
                case "Claude (Anthropic)": { // Done
                    const response = yield this.ai.messages.create({
                        model: this.apiProvider.model,
                        max_tokens: this.apiProvider.maxTokens,
                        temperature: this.apiProvider.temperature,
                        messages: [{ role: "user", content: prompt }],
                    });
                    return this.parseResponse(response.content[0].text);
                }
                case "Gemini (Google)": { // Done
                    const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                    const response = yield model.generateContent(prompt);
                    return this.parseResponse(response.response.text());
                }
                case "Perplexity": { // Done
                    const response = yield this.ai.chat.completions.create({
                        model: "sonar-pro",
                        messages: [{ role: "user", content: prompt }],
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                    });
                    return this.parseResponse(response.choices[0].message.content);
                }
                case "Mistral": { // Done
                    const client = new mistralai_1.Mistral({ apiKey: this.apiProvider.apiKey });
                    const chatResponse = yield client.chat.complete({
                        model: this.apiProvider.model || "mistral-large-latest",
                        messages: [{ role: 'user', content: prompt }],
                    });
                    return this.parseResponse(chatResponse.choices[0].message.content);
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
                    const response = yield axios_1.default.post(url, payload, {
                        headers: {
                            Authorization: `Bearer ${this.apiProvider.apiKey}`
                        },
                    });
                    console.log(response.data);
                    return this.parseResponse(response.data.choices[0].message.content);
                }
                // **********************
                case "Deepseek": {
                    return {
                        error: "Deepseek is not supported yet"
                    };
                }
                case "Groq (Groq)": {
                    return {
                        error: "Groq is not supported yet"
                    };
                }
            }
        });
    }
    parseResponse(content) {
        let parsedContent = cleanResponse(content);
        if (parsedContent.startsWith("```")) {
            parsedContent = parsedContent.replace(/```json|```/g, "").trim();
        }
        // Try parsing as JSON
        try {
            return JSON.parse(parsedContent);
        }
        catch (error) {
            console.log(error);
            console.log(parsedContent);
        }
    }
}
exports.AI = AI;
function cleanResponse(response) {
    return response
        .replace(/^\uFEFF/, "") // Remove BOM (Byte Order Mark)
        .replace(/[^\x20-\x7E\n\r\t]/g, "") // Remove non-ASCII characters
        .trim();
}
