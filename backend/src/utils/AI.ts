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

const aiInstructions = {
    summarize: "Read the content carefully and summarize it in 3–5 concise bullet points, highlighting the most important ideas.",
    questions: "Based on the content, generate 3–5 engaging and relevant questions that prompt deeper thinking or discussion.",
    insights: "Identify and explain 2–3 key insights or implications that can be drawn from the content. Focus on value and meaning.",
    report: "Write a structured report that includes a title, summary, list of key insights, and thought-provoking questions. Maintain a formal tone and organize it into clear sections."
  };
  

import { Mistral } from '@mistralai/mistralai';
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
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

    async generateResponse(prompt: string, JSON = false) {
        switch (this.apiProvider.name) {
            case "ChatGPT (OpenAI)": { // Done
                const response = await this.ai.chat.completions.create({
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
                const response = await this.ai.messages.create({
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
                const response = await model.generateContent(prompt);
                if (JSON) {
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
                if (JSON) {
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
                if (JSON) {
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
                if (JSON) {
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

    async processDocument(files: any[], processingOption: string, documentType: string, goal: string) {
        switch (this.apiProvider.name) {
            case "Gemini (Google)": {
                const model: GenerativeModel = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                const response = await model.generateContent([
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