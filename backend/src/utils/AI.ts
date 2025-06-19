const aiInstructions = {
    summarize: "Read the content carefully and summarize it in 3–5 concise bullet points, highlighting the most important ideas.",
    questions: "Give answers to the questions asked by the user listed below in the goal section",
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
                this.ai = new Anthropic({ apiKey: apiProvider.apiKey })
                break;
            case "Gemini (Google)":
                this.ai = new GoogleGenerativeAI(apiProvider.apiKey);
                break;
            default:
                this.ai = null;
                break;
        }
    }

    async generateResponse(prompt: string, JSON = false, stream = false, streamCallback: (data: string) => void = () => { }) {
        switch (this.apiProvider.name) {
            case "ChatGPT (OpenAI)": { // Done
                if (stream) {
                    const response = await this.ai.chat.completions.create({
                        model: this.apiProvider.model,
                        messages: [{ role: "user", content: prompt }],
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                        stream: true,
                    });

                    let finalText = "";
                    for await (const chunk of response) {
                        const content = chunk.choices?.[0]?.delta?.content;
                        if (content) {
                            streamCallback(content);
                        }
                    }
                    return this.parseResponse(finalText);
                }

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
                if (stream) {
                    const response = await this.ai.messages.create({
                        model: this.apiProvider.model,
                        max_tokens: this.apiProvider.maxTokens,
                        temperature: this.apiProvider.temperature,
                        messages: [{ role: "user", content: prompt }],
                        stream: true,
                    });
                    let finalText = "";
                    for await (const message of response) {
                        if (message.type === "content_block_delta") {
                            finalText += message.delta.text;
                            streamCallback(message.delta.text);
                        }
                    }
                    if (JSON) {
                        return this.parseResponseToJSON(finalText);
                    }
                    return this.parseResponse(finalText);
                }
                const response = await this.ai.messages.create({
                    model: this.apiProvider.model,
                    max_tokens: this.apiProvider.maxTokens,
                    temperature: this.apiProvider.temperature,
                    messages: [{ role: "user", content: prompt }],
                    stream: true,
                });
                let finalText = "";
                for await (const message of response) {
                    if (message.type === "content_block_delta") {
                        finalText += message.delta.text;
                    }
                }
                if (JSON) {
                    return this.parseResponseToJSON(finalText);
                }
                return this.parseResponse(finalText);
            }

            case "Gemini (Google)": { // Done
                if (stream) {
                    const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                    const response = await model.generateContentStream(prompt);
                    let finalText = "";

                    for await (const chunk of response.stream) {
                        const text = chunk.text();
                        if (text) {
                            streamCallback(text);
                        }
                    }
                    return this.parseResponse(finalText);
                }

                const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                const response = await model.generateContent(prompt);
                if (JSON) {
                    return this.parseResponseToJSON(response.response.text());
                }
                return this.parseResponse(response.response.text());
            }

            case "Perplexity": { // Done

                if (stream) {
                    const response = await this.ai.chat.completions.create({
                        model: this.apiProvider.model,
                        messages: [{ role: "user", content: prompt }],
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                        stream: true,
                    });

                    let finalText = "";
                    for await (const chunk of response) {
                        const content = chunk.choices?.[0]?.delta?.content;
                        if (content) {
                            streamCallback(content);
                        }
                    }
                    return this.parseResponse(finalText);
                }

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

                if (stream) {
                    const client = new Mistral({ apiKey: this.apiProvider.apiKey });
                    const chatResponse = await client.chat.complete({
                        model: this.apiProvider.model || "mistral-large-latest",
                        messages: [{ role: 'user', content: prompt }],
                    });
                    if (JSON) {
                        streamCallback(this.parseResponseToJSON(chatResponse.choices[0].message.content as string))
                        return this.parseResponseToJSON(chatResponse.choices[0].message.content as string);
                    }
                    streamCallback(this.parseResponse(chatResponse.choices[0].message.content as string))
                    return this.parseResponse(chatResponse.choices[0].message.content as string);
                }

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

                if (stream) {
                    if (JSON) {
                        streamCallback(this.parseResponseToJSON(response.data.choices[0].message.content as string));
                        return this.parseResponseToJSON(response.data.choices[0].message.content as string);
                    }
                    streamCallback(this.parseResponse(response.data.choices[0].message.content));
                    return this.parseResponse(response.data.choices[0].message.content);
                }

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
    async generateResponseWithContext(context: object[], JSON = false, stream = false, streamCallback: (data: string) => void = () => { }) {
        switch (this.apiProvider.name) {
            case "ChatGPT (OpenAI)": { // Done
                if (stream) {
                    const response = await this.ai.chat.completions.create({
                        model: this.apiProvider.model,
                        messages: context,
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                        stream: true,
                    });

                    let finalText = "";
                    for await (const chunk of response) {
                        const content = chunk.choices?.[0]?.delta?.content;
                        if (content) {
                            streamCallback(content);
                        }
                    }
                    return this.parseResponse(finalText);
                }

                const response = await this.ai.chat.completions.create({
                    model: this.apiProvider.model,
                    messages: context,
                    temperature: this.apiProvider.temperature,
                    max_tokens: this.apiProvider.maxTokens,
                });
                if (JSON) {
                    return this.parseResponseToJSON(response.choices[0].message.content);
                }
                return this.parseResponse(response.choices[0].message.content);
            }

            case "Claude (Anthropic)": { // Done
                if (stream) {
                    const response = await this.ai.messages.create({
                        model: this.apiProvider.model,
                        max_tokens: this.apiProvider.maxTokens,
                        temperature: this.apiProvider.temperature,
                        messages: context,
                        stream: true,
                    });
                    let finalText = "";
                    for await (const message of response) {
                        if (message.type === "content_block_delta") {
                            finalText += message.delta.text;
                            streamCallback(message.delta.text);
                        }
                    }
                    if (JSON) {
                        return this.parseResponseToJSON(finalText);
                    }
                    return this.parseResponse(finalText);
                }
                const response = await this.ai.messages.create({
                    model: this.apiProvider.model,
                    max_tokens: this.apiProvider.maxTokens,
                    temperature: this.apiProvider.temperature,
                    messages: context,
                    stream: true,
                });
                let finalText = "";
                for await (const message of response) {
                    if (message.type === "content_block_delta") {
                        finalText += message.delta.text;
                    }
                }
                if (JSON) {
                    return this.parseResponseToJSON(finalText);
                }
                return this.parseResponse(finalText);
            }

            case "Gemini (Google)": { // Done
                if (stream) {
                    const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                    const response = await model.generateContentStream(context);
                    let finalText = "";

                    for await (const chunk of response.stream) {
                        const text = chunk.text();
                        if (text) {
                            streamCallback(text);
                        }
                    }
                    return this.parseResponse(finalText);
                }

                const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                const response = await model.generateContent(context);
                if (JSON) {
                    return this.parseResponseToJSON(response.response.text());
                }
                return this.parseResponse(response.response.text());
            }

            case "Perplexity": { // Done

                if (stream) {
                    const response = await this.ai.chat.completions.create({
                        model: this.apiProvider.model,
                        messages: context,
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                        stream: true,
                    });

                    let finalText = "";
                    for await (const chunk of response) {
                        const content = chunk.choices?.[0]?.delta?.content;
                        if (content) {
                            streamCallback(content);
                        }
                    }
                    return this.parseResponse(finalText);
                }

                const response = await this.ai.chat.completions.create({
                    model: "sonar-pro",
                    messages: context,
                    temperature: this.apiProvider.temperature,
                    max_tokens: this.apiProvider.maxTokens,
                });
                if (JSON) {
                    return this.parseResponseToJSON(response.choices[0].message.content);
                }
                return this.parseResponse(response.choices[0].message.content);
            }

            case "Mistral": { // Done

                if (stream) {
                    const client = new Mistral({ apiKey: this.apiProvider.apiKey });
                    const chatResponse = await client.chat.complete({
                        model: this.apiProvider.model || "mistral-large-latest",
                        messages: context as any,
                    });
                    if (JSON) {
                        streamCallback(this.parseResponseToJSON(chatResponse.choices[0].message.content as string))
                        return this.parseResponseToJSON(chatResponse.choices[0].message.content as string);
                    }
                    streamCallback(this.parseResponse(chatResponse.choices[0].message.content as string))
                    return this.parseResponse(chatResponse.choices[0].message.content as string);
                }

                const client = new Mistral({ apiKey: this.apiProvider.apiKey });
                const chatResponse = await client.chat.complete({
                    model: this.apiProvider.model || "mistral-large-latest",
                    messages: context as any,
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
                    messages: context,
                    temperature: this.apiProvider.temperature,
                    max_tokens: this.apiProvider.maxTokens,
                };

                const response = await axios.post(url, payload, {
                    headers: {
                        Authorization: `Bearer ${this.apiProvider.apiKey}`
                    },
                });

                if (stream) {
                    if (JSON) {
                        streamCallback(this.parseResponseToJSON(response.data.choices[0].message.content as string));
                        return this.parseResponseToJSON(response.data.choices[0].message.content as string);
                    }
                    streamCallback(this.parseResponse(response.data.choices[0].message.content));
                    return this.parseResponse(response.data.choices[0].message.content);
                }

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

    async processDocumentWithContext(files: any[], processingOption: string, documentType: string, goal: string, promptContent: string, context: { role: string; content: string }[] = []) {
        const newPrompt = `
                    ${promptContent}
                                
                    Your task is to analyze the provided documents and perform the following action:
                    There can be multiple documents, so you need to process all of them.
                                
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


        switch (this.apiProvider.name) {
            case "Gemini (Google)": {
                const model: GenerativeModel = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                const response = await model.generateContent([
                    ...context.map(msg => msg.content),
                    ...(files || []).map((file) => ({
                        inlineData: {
                            mimeType: file.type,
                            data: file.base64,
                        },
                    })),
                    newPrompt
                ]);

                return this.parseResponse(response.response.text());
            }
            case "ChatGPT (OpenAI)": {
                const fileIds = await Promise.all((files || []).map(async (file) => {
                    const buffer = Buffer.from(file.base64, 'base64');
                    const upload = await this.ai.files.create({
                        file: buffer,
                        purpose: 'assistants',
                    });
                    return upload.id;
                }));

                const assistant = await this.ai.assistants.retrieve(this.apiProvider.model); // or create one
                const thread = await this.ai.threads.create();

                // Add context messages first
                for (const message of context) {
                    await this.ai.threads.messages.create(thread.id, message);
                }

                await this.ai.threads.messages.create(thread.id, {
                    role: 'user',
                    content: newPrompt,
                    file_ids: fileIds,
                });

                const run = await this.ai.threads.runs.create(thread.id, {
                    assistant_id: assistant.id,
                });

                let status;
                do {
                    const updatedRun = await this.ai.threads.runs.retrieve(thread.id, run.id);
                    status = updatedRun.status;
                    await new Promise((r) => setTimeout(r, 2000));
                } while (status !== 'completed');

                const messages = await this.ai.threads.messages.list(thread.id);
                return this.parseResponse(messages.data[0].content[0].text.value);
            }
            case "Claude (Anthropic)": {
                const contentParts = [
                    ...context.map(msg => ({
                        type: "text",
                        text: msg.content
                    })),
                    ...(files || []).map((file) => ({
                        type: file.type.includes("image") ? "image" : "document",
                        source: {
                            media_type: file.type,
                            data: file.base64,
                            type: "base64"
                        }
                    })),
                    {
                        type: "text",
                        text: newPrompt
                    }
                ];
                const response = await this.ai.messages.create({
                    model: this.apiProvider.model,
                    max_tokens: this.apiProvider.maxTokens,
                    messages: [{ role: "user", content: contentParts }],
                    stream: true
                });
                let finalText = "";
                for await (const message of response) {
                    if (message.type === "content_block_delta") {
                        finalText += message.delta.text;
                    }
                }
                return this.parseResponse(finalText);
            }
        }
    }

    async processDocument(files: any[], processingOption: string, documentType: string, goal: string, promptContent: string) {
        const newPrompt = `
                    ${promptContent}
                                
                    Your task is to analyze the provided documents and perform the following action:
                    There can be multiple documents, so you need to process all of them.
                                
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
                    newPrompt
                ]);

                return this.parseResponse(response.response.text());
            }
            case "ChatGPT (OpenAI)": {
                const fileIds = await Promise.all((files || []).map(async (file) => {
                    const buffer = Buffer.from(file.base64, 'base64');
                    const upload = await this.ai.files.create({
                        file: buffer,
                        purpose: 'assistants',
                    });
                    return upload.id;
                }));

                const assistant = await this.ai.assistants.retrieve(this.apiProvider.model); // or create one
                const thread = await this.ai.threads.create();

                await this.ai.threads.messages.create(thread.id, {
                    role: 'user',
                    content: newPrompt,
                    file_ids: fileIds,
                });

                const run = await this.ai.threads.runs.create(thread.id, {
                    assistant_id: assistant.id,
                });

                let status;
                do {
                    const updatedRun = await this.ai.threads.runs.retrieve(thread.id, run.id);
                    status = updatedRun.status;
                    await new Promise((r) => setTimeout(r, 2000));
                } while (status !== 'completed');

                const messages = await this.ai.threads.messages.list(thread.id);
                return this.parseResponse(messages.data[0].content[0].text.value);
            }
            case "Claude (Anthropic)": {
                const contentParts = [
                    ...(files || []).map((file) => ({
                        type: file.type.includes("image") ? "image" : "document",
                        source: {
                            media_type: file.type,
                            data: file.base64,
                            type: "base64"
                        }
                    })),
                    {
                        type: "text",
                        text: newPrompt
                    }
                ];
                const response = await this.ai.messages.create({
                    model: this.apiProvider.model,
                    max_tokens: this.apiProvider.maxTokens,
                    messages: [{ role: "user", content: contentParts }],
                    stream: true
                });
                let finalText = "";
                for await (const message of response) {
                    if (message.type === "content_block_delta") {
                        finalText += message.delta.text;
                    }
                }
                return this.parseResponse(finalText);
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