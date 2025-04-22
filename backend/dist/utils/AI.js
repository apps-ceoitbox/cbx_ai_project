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
const aiInstructions = {
    summarize: "Read the content carefully and summarize it in 3–5 concise bullet points, highlighting the most important ideas.",
    questions: "Based on the content, generate 3–5 engaging and relevant questions that prompt deeper thinking or discussion.",
    insights: "Identify and explain 2–3 key insights or implications that can be drawn from the content. Focus on value and meaning.",
    report: "Write a structured report that includes a title, summary, list of key insights, and thought-provoking questions. Maintain a formal tone and organize it into clear sections."
};
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
    generateResponse(prompt_1) {
        return __awaiter(this, arguments, void 0, function* (prompt, JSON = false) {
            switch (this.apiProvider.name) {
                case "ChatGPT (OpenAI)": { // Done
                    const response = yield this.ai.chat.completions.create({
                        model: this.apiProvider.model,
                        messages: [{ role: "user", content: prompt }],
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                    });
                    if (JSON) {
                        return this.parseResponseToJSON(response.choices[0].message.content);
                    }
                    return this.parseResponse(response.choices[0].message.content);
                }
                case "Claude (Anthropic)": { // Done
                    const response = yield this.ai.messages.create({
                        model: this.apiProvider.model,
                        max_tokens: this.apiProvider.maxTokens,
                        temperature: this.apiProvider.temperature,
                        messages: [{ role: "user", content: prompt }],
                    });
                    if (JSON) {
                        return this.parseResponseToJSON(response.content[0].text);
                    }
                    return this.parseResponse(response.content[0].text);
                }
                case "Gemini (Google)": { // Done
                    const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                    const response = yield model.generateContent(prompt);
                    if (JSON) {
                        return this.parseResponseToJSON(response.response.text());
                    }
                    return this.parseResponse(response.response.text());
                }
                case "Perplexity": { // Done
                    const response = yield this.ai.chat.completions.create({
                        model: "sonar-pro",
                        messages: [{ role: "user", content: prompt }],
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                    });
                    if (JSON) {
                        return this.parseResponseToJSON(response.choices[0].message.content);
                    }
                    return this.parseResponse(response.choices[0].message.content);
                }
                case "Mistral": { // Done
                    const client = new mistralai_1.Mistral({ apiKey: this.apiProvider.apiKey });
                    const chatResponse = yield client.chat.complete({
                        model: this.apiProvider.model || "mistral-large-latest",
                        messages: [{ role: 'user', content: prompt }],
                    });
                    if (JSON) {
                        return this.parseResponseToJSON(chatResponse.choices[0].message.content);
                    }
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
                    if (JSON) {
                        return this.parseResponseToJSON(response.data.choices[0].message.content);
                    }
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
    // async processDocument(files: any[], processingOption: string, documentType: string, goal: string) {
    //     switch (this.apiProvider.name) {
    //         case "Gemini (Google)": {
    //             const model:GenerativeModel = this.ai.getGenerativeModel({ model: this.apiProvider.model });
    //             const response = await model.generateContent([
    //                 ...(files || []).map((file) => ({
    //                     inlineData: {
    //                         mimeType: file.type,
    //                         data: file.base64,
    //                     },
    //                 })),
    //                 `
    //                 Processing Option: ${aiInstructions[processingOption]}
    //                 Document Type: ${documentType}
    //                 Goal: ${goal}
    //                 Give the output in HTML format
    //                 `
    //             ]);
    //             return this.parseResponse(response.response.text());
    //         }
    //     }
    // }
    processDocument(files, processingOption, documentType, goal) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (this.apiProvider.name) {
                case "Gemini (Google)": {
                    const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                    const response = yield model.generateContent([
                        ...(files || []).map((file) => ({
                            inlineData: {
                                mimeType: file.type,
                                data: file.base64,
                            },
                        })),
                        `
                        You are an intelligent document processor. 
                                    
                        Your task is to analyze the provided document(s) and perform the following action:
                                    
                        **Processing Option:** ${aiInstructions[processingOption]}
                        **Document Type:** ${documentType}
                        **User's Goal:** ${goal}
                                    
                        Please extract or generate relevant content based on the user's intent. The final output must be structured and returned in valid **HTML** format. Avoid adding explanations or commentary outside the HTML.
                                    
                        Use appropriate HTML elements like <h1>, <h2>, <p>, <ul>, <li>, etc., based on the content type. Preserve headings, lists, tables, and any structured data wherever applicable.
                      
                        STYLE RULES:
                        - If using any tag like h1, or ul, ol, etc. give its style of h1 explicitly, as the global styles can interfere with the output
                        - All text should use #2c3e50
                        - Accent color is #c0392b (red)
                        - Font: 'Segoe UI', sans-serif
                        - Add spacing (20px+), clean font sizes, and soft box shadows
                        - Table rows should alternate background colors (#f9f9f9, #fff)

                        DO NOT include:
                        - Markdown
                        - JavaScript
                        - External styles
                        - Comments

                        GOAL:
                        - Final HTML should look clean, readable, modern, and styled with inline CSS only.
                        - Content must begin with the <div>, and it should not have any margin or padding as mentioned.
                    
                        `
                    ]);
                    return this.parseResponse(response.response.text());
                }
            }
        });
    }
    parseResponseToJSON(content) {
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
    parseResponse(content) {
        let parsedContent = cleanResponse(content);
        if (parsedContent.startsWith("```")) {
            parsedContent = parsedContent.replace(/```html|```/g, "").trim();
        }
        return parsedContent;
    }
}
exports.AI = AI;
function cleanResponse(response) {
    return response
        .replace(/^\uFEFF/, "") // Remove BOM (Byte Order Mark)
        .replace(/[^\x20-\x7E\n\r\t]/g, "") // Remove non-ASCII characters
        .trim();
}
