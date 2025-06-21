"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI = void 0;
exports.estimateTokens = estimateTokens;
const aiInstructions = {
    summarize: "Read the content carefully and summarize it in 3–5 concise bullet points, highlighting the most important ideas.",
    questions: "Give answers to the questions asked by the user listed below in the goal section",
    insights: "Identify and explain 2–3 key insights or implications that can be drawn from the content. Focus on value and meaning.",
    report: "Write a structured report that includes a title, summary, list of key insights, and thought-provoking questions. Maintain a formal tone and organize it into clear sections."
};
const styleInstructions = `
You are an AI document assistant. Always reply in valid HTML only, using these style rules:
- All text should use #2c3e50
- Accent color is #c0392b (red)
- Font: 'Segoe UI', sans-serif
- Add spacing (20px+), clean font sizes, and soft box shadows
- Table rows should alternate background colors (#f9f9f9, #fff)
- Any HTML tag used (like h1, p, table, etc.) must have its CSS explicitly defined inline, including font size, font weight, colors, padding, margins, etc. — do not rely on browser defaults.
- DO NOT include Markdown, JavaScript, external styles, or comments.
- The final HTML should look clean, readable, modern, and styled with inline CSS only.
- Content must begin with the <div> container as mentioned.
`;
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
        return __awaiter(this, arguments, void 0, function* (prompt, JSON = false, stream = false, streamCallback = () => { }) {
            var _a, e_1, _b, _c, _d, e_2, _e, _f, _g, e_3, _h, _j, _k, e_4, _l, _m, _o, e_5, _p, _q;
            var _r, _s, _t, _u, _v, _w;
            switch (this.apiProvider.name) {
                case "ChatGPT (OpenAI)": { // Done
                    if (stream) {
                        const response = yield this.ai.chat.completions.create({
                            model: this.apiProvider.model,
                            messages: [{ role: "user", content: prompt }],
                            temperature: this.apiProvider.temperature,
                            max_tokens: this.apiProvider.maxTokens,
                            stream: true,
                        });
                        let finalText = "";
                        try {
                            for (var _x = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _x = true) {
                                _c = response_1_1.value;
                                _x = false;
                                const chunk = _c;
                                const content = (_t = (_s = (_r = chunk.choices) === null || _r === void 0 ? void 0 : _r[0]) === null || _s === void 0 ? void 0 : _s.delta) === null || _t === void 0 ? void 0 : _t.content;
                                if (content) {
                                    streamCallback(content);
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (!_x && !_a && (_b = response_1.return)) yield _b.call(response_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        return this.parseResponse(finalText);
                    }
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
                    if (stream) {
                        const response = yield this.ai.messages.create({
                            model: this.apiProvider.model,
                            max_tokens: this.apiProvider.maxTokens,
                            temperature: this.apiProvider.temperature,
                            messages: [{ role: "user", content: prompt }],
                            stream: true,
                        });
                        let finalText = "";
                        try {
                            for (var _y = true, response_2 = __asyncValues(response), response_2_1; response_2_1 = yield response_2.next(), _d = response_2_1.done, !_d; _y = true) {
                                _f = response_2_1.value;
                                _y = false;
                                const message = _f;
                                if (message.type === "content_block_delta") {
                                    finalText += message.delta.text;
                                    streamCallback(message.delta.text);
                                }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (!_y && !_d && (_e = response_2.return)) yield _e.call(response_2);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        if (JSON) {
                            return this.parseResponseToJSON(finalText);
                        }
                        return this.parseResponse(finalText);
                    }
                    const response = yield this.ai.messages.create({
                        model: this.apiProvider.model,
                        max_tokens: this.apiProvider.maxTokens,
                        temperature: this.apiProvider.temperature,
                        messages: [{ role: "user", content: prompt }],
                        stream: true,
                    });
                    let finalText = "";
                    try {
                        for (var _z = true, response_3 = __asyncValues(response), response_3_1; response_3_1 = yield response_3.next(), _g = response_3_1.done, !_g; _z = true) {
                            _j = response_3_1.value;
                            _z = false;
                            const message = _j;
                            if (message.type === "content_block_delta") {
                                finalText += message.delta.text;
                            }
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (!_z && !_g && (_h = response_3.return)) yield _h.call(response_3);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    if (JSON) {
                        return this.parseResponseToJSON(finalText);
                    }
                    return this.parseResponse(finalText);
                }
                case "Gemini (Google)": { // Done
                    if (stream) {
                        const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                        const response = yield model.generateContentStream(prompt);
                        let finalText = "";
                        try {
                            for (var _0 = true, _1 = __asyncValues(response.stream), _2; _2 = yield _1.next(), _k = _2.done, !_k; _0 = true) {
                                _m = _2.value;
                                _0 = false;
                                const chunk = _m;
                                const text = chunk.text();
                                if (text) {
                                    streamCallback(text);
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (!_0 && !_k && (_l = _1.return)) yield _l.call(_1);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        return this.parseResponse(finalText);
                    }
                    const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                    const response = yield model.generateContent(prompt);
                    if (JSON) {
                        return this.parseResponseToJSON(response.response.text());
                    }
                    return this.parseResponse(response.response.text());
                }
                case "Perplexity": { // Done
                    if (stream) {
                        const response = yield this.ai.chat.completions.create({
                            model: this.apiProvider.model,
                            messages: [{ role: "user", content: prompt }],
                            temperature: this.apiProvider.temperature,
                            max_tokens: this.apiProvider.maxTokens,
                            stream: true,
                        });
                        let finalText = "";
                        try {
                            for (var _3 = true, response_4 = __asyncValues(response), response_4_1; response_4_1 = yield response_4.next(), _o = response_4_1.done, !_o; _3 = true) {
                                _q = response_4_1.value;
                                _3 = false;
                                const chunk = _q;
                                const content = (_w = (_v = (_u = chunk.choices) === null || _u === void 0 ? void 0 : _u[0]) === null || _v === void 0 ? void 0 : _v.delta) === null || _w === void 0 ? void 0 : _w.content;
                                if (content) {
                                    streamCallback(content);
                                }
                            }
                        }
                        catch (e_5_1) { e_5 = { error: e_5_1 }; }
                        finally {
                            try {
                                if (!_3 && !_o && (_p = response_4.return)) yield _p.call(response_4);
                            }
                            finally { if (e_5) throw e_5.error; }
                        }
                        return this.parseResponse(finalText);
                    }
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
                    if (stream) {
                        const client = new mistralai_1.Mistral({ apiKey: this.apiProvider.apiKey });
                        const chatResponse = yield client.chat.complete({
                            model: this.apiProvider.model || "mistral-large-latest",
                            messages: [{ role: 'user', content: prompt }],
                        });
                        if (JSON) {
                            streamCallback(this.parseResponseToJSON(chatResponse.choices[0].message.content));
                            return this.parseResponseToJSON(chatResponse.choices[0].message.content);
                        }
                        streamCallback(this.parseResponse(chatResponse.choices[0].message.content));
                        return this.parseResponse(chatResponse.choices[0].message.content);
                    }
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
                    if (stream) {
                        if (JSON) {
                            streamCallback(this.parseResponseToJSON(response.data.choices[0].message.content));
                            return this.parseResponseToJSON(response.data.choices[0].message.content);
                        }
                        streamCallback(this.parseResponse(response.data.choices[0].message.content));
                        return this.parseResponse(response.data.choices[0].message.content);
                    }
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
    generateResponseWithContext(context_1) {
        return __awaiter(this, arguments, void 0, function* (context, JSON = false, stream = false, streamCallback = () => { }) {
            var _a, e_6, _b, _c, _d, e_7, _e, _f, _g, e_8, _h, _j, _k, e_9, _l, _m, _o, e_10, _p, _q;
            var _r, _s, _t, _u, _v, _w;
            switch (this.apiProvider.name) {
                case "ChatGPT (OpenAI)": { // Done
                    if (stream) {
                        const response = yield this.ai.chat.completions.create({
                            model: this.apiProvider.model,
                            messages: [{ role: 'system', content: styleInstructions }, ...context],
                            temperature: this.apiProvider.temperature,
                            max_tokens: this.apiProvider.maxTokens,
                            stream: true,
                        });
                        let finalText = "";
                        try {
                            for (var _x = true, response_5 = __asyncValues(response), response_5_1; response_5_1 = yield response_5.next(), _a = response_5_1.done, !_a; _x = true) {
                                _c = response_5_1.value;
                                _x = false;
                                const chunk = _c;
                                const content = (_t = (_s = (_r = chunk.choices) === null || _r === void 0 ? void 0 : _r[0]) === null || _s === void 0 ? void 0 : _s.delta) === null || _t === void 0 ? void 0 : _t.content;
                                if (content) {
                                    streamCallback(content);
                                }
                            }
                        }
                        catch (e_6_1) { e_6 = { error: e_6_1 }; }
                        finally {
                            try {
                                if (!_x && !_a && (_b = response_5.return)) yield _b.call(response_5);
                            }
                            finally { if (e_6) throw e_6.error; }
                        }
                        return this.parseResponse(finalText);
                    }
                    const response = yield this.ai.chat.completions.create({
                        model: this.apiProvider.model,
                        messages: [{ role: 'system', content: styleInstructions }, ...context],
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
                        const filteredContext = context.filter(msg => msg.role !== 'system');
                        const response = yield this.ai.messages.create({
                            model: this.apiProvider.model,
                            max_tokens: this.apiProvider.maxTokens,
                            temperature: this.apiProvider.temperature,
                            system: styleInstructions,
                            messages: filteredContext,
                            stream: true
                        });
                        let finalText = "";
                        try {
                            for (var _y = true, response_6 = __asyncValues(response), response_6_1; response_6_1 = yield response_6.next(), _d = response_6_1.done, !_d; _y = true) {
                                _f = response_6_1.value;
                                _y = false;
                                const message = _f;
                                if (message.type === "content_block_delta") {
                                    finalText += message.delta.text;
                                    streamCallback(message.delta.text);
                                }
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (!_y && !_d && (_e = response_6.return)) yield _e.call(response_6);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        if (JSON) {
                            return this.parseResponseToJSON(finalText);
                        }
                        return this.parseResponse(finalText);
                    }
                    const response = yield this.ai.messages.create({
                        model: this.apiProvider.model,
                        max_tokens: this.apiProvider.maxTokens,
                        temperature: this.apiProvider.temperature,
                        system: styleInstructions,
                        messages: context,
                        stream: true,
                    });
                    let finalText = "";
                    try {
                        for (var _z = true, response_7 = __asyncValues(response), response_7_1; response_7_1 = yield response_7.next(), _g = response_7_1.done, !_g; _z = true) {
                            _j = response_7_1.value;
                            _z = false;
                            const message = _j;
                            if (message.type === "content_block_delta") {
                                finalText += message.delta.text;
                            }
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (!_z && !_g && (_h = response_7.return)) yield _h.call(response_7);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                    if (JSON) {
                        return this.parseResponseToJSON(finalText);
                    }
                    return this.parseResponse(finalText);
                }
                case "Gemini (Google)": { // Done
                    if (stream) {
                        const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                        const response = yield model.generateContentStream([
                            ...context.map(msg => msg.content),
                            styleInstructions
                        ]);
                        let finalText = "";
                        try {
                            for (var _0 = true, _1 = __asyncValues(response.stream), _2; _2 = yield _1.next(), _k = _2.done, !_k; _0 = true) {
                                _m = _2.value;
                                _0 = false;
                                const chunk = _m;
                                const text = chunk.text();
                                if (text) {
                                    streamCallback(text);
                                }
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (!_0 && !_k && (_l = _1.return)) yield _l.call(_1);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        return this.parseResponse(finalText);
                    }
                    const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                    const response = yield model.generateContent([
                        styleInstructions,
                        ...context.map(msg => msg.content)
                    ]);
                    if (JSON) {
                        return this.parseResponseToJSON(response.response.text());
                    }
                    return this.parseResponse(response.response.text());
                }
                case "Perplexity": { // Done
                    if (stream) {
                        const response = yield this.ai.chat.completions.create({
                            model: this.apiProvider.model,
                            messages: [{ role: 'system', content: styleInstructions }, ...context],
                            temperature: this.apiProvider.temperature,
                            max_tokens: this.apiProvider.maxTokens,
                            stream: true,
                        });
                        let finalText = "";
                        try {
                            for (var _3 = true, response_8 = __asyncValues(response), response_8_1; response_8_1 = yield response_8.next(), _o = response_8_1.done, !_o; _3 = true) {
                                _q = response_8_1.value;
                                _3 = false;
                                const chunk = _q;
                                const content = (_w = (_v = (_u = chunk.choices) === null || _u === void 0 ? void 0 : _u[0]) === null || _v === void 0 ? void 0 : _v.delta) === null || _w === void 0 ? void 0 : _w.content;
                                if (content) {
                                    streamCallback(content);
                                }
                            }
                        }
                        catch (e_10_1) { e_10 = { error: e_10_1 }; }
                        finally {
                            try {
                                if (!_3 && !_o && (_p = response_8.return)) yield _p.call(response_8);
                            }
                            finally { if (e_10) throw e_10.error; }
                        }
                        return this.parseResponse(finalText);
                    }
                    const response = yield this.ai.chat.completions.create({
                        model: "sonar-pro",
                        messages: [{ role: 'system', content: styleInstructions }, ...context],
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
                        const client = new mistralai_1.Mistral({ apiKey: this.apiProvider.apiKey });
                        const chatResponse = yield client.chat.complete({
                            model: this.apiProvider.model || "mistral-large-latest",
                            messages: [{ role: 'system', content: styleInstructions }, ...context],
                        });
                        if (JSON) {
                            streamCallback(this.parseResponseToJSON(chatResponse.choices[0].message.content));
                            return this.parseResponseToJSON(chatResponse.choices[0].message.content);
                        }
                        streamCallback(this.parseResponse(chatResponse.choices[0].message.content));
                        return this.parseResponse(chatResponse.choices[0].message.content);
                    }
                    const client = new mistralai_1.Mistral({ apiKey: this.apiProvider.apiKey });
                    const chatResponse = yield client.chat.complete({
                        model: this.apiProvider.model || "mistral-large-latest",
                        messages: [{ role: 'system', content: styleInstructions }, ...context],
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
                            { "role": "user", "content": styleInstructions },
                            ...context.map(msg => ({
                                role: msg.role,
                                content: msg.content
                            }))
                        ],
                        temperature: this.apiProvider.temperature,
                        max_tokens: this.apiProvider.maxTokens,
                    };
                    const response = yield axios_1.default.post(url, payload, {
                        headers: {
                            Authorization: `Bearer ${this.apiProvider.apiKey}`
                        },
                    });
                    if (stream) {
                        if (JSON) {
                            streamCallback(this.parseResponseToJSON(response.data.choices[0].message.content));
                            return this.parseResponseToJSON(response.data.choices[0].message.content);
                        }
                        streamCallback(this.parseResponse(response.data.choices[0].message.content));
                        return this.parseResponse(response.data.choices[0].message.content);
                    }
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
    processDocumentWithContext(files_1, processingOption_1, documentType_1, goal_1, promptContent_1) {
        return __awaiter(this, arguments, void 0, function* (files, processingOption, documentType, goal, promptContent, context = [], stream = false, streamCallback = () => { }) {
            var _a, e_11, _b, _c, _d, e_12, _e, _f, _g, e_13, _h, _j, _k, e_14, _l, _m, _o, e_15, _p, _q;
            var _r, _s, _t;
            const styleInstructions = '...style instructions...';
            if (processingOption === "chat") {
                // Use context as the only messages (chat mode), but always append style instructions
                const contextWithStyle = [...context, { role: 'system', content: styleInstructions }];
                switch (this.apiProvider.name) {
                    case "Gemini (Google)": {
                        const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                        if (stream) {
                            const response = yield model.generateContentStream(contextWithStyle.map(msg => msg.content));
                            let finalText = "";
                            try {
                                for (var _u = true, _v = __asyncValues(response.stream), _w; _w = yield _v.next(), _a = _w.done, !_a; _u = true) {
                                    _c = _w.value;
                                    _u = false;
                                    const chunk = _c;
                                    const text = chunk.text();
                                    if (text) {
                                        streamCallback(text);
                                        finalText += text;
                                    }
                                }
                            }
                            catch (e_11_1) { e_11 = { error: e_11_1 }; }
                            finally {
                                try {
                                    if (!_u && !_a && (_b = _v.return)) yield _b.call(_v);
                                }
                                finally { if (e_11) throw e_11.error; }
                            }
                            return this.parseResponse(finalText);
                        }
                        const response = yield model.generateContent(contextWithStyle.map(msg => msg.content));
                        return this.parseResponse(response.response.text());
                    }
                    case "ChatGPT (OpenAI)": {
                        if (stream) {
                            const response = yield this.ai.chat.completions.create({
                                model: this.apiProvider.model,
                                messages: contextWithStyle,
                                temperature: this.apiProvider.temperature,
                                max_tokens: this.apiProvider.maxTokens,
                                stream: true,
                            });
                            let finalText = "";
                            try {
                                for (var _x = true, response_9 = __asyncValues(response), response_9_1; response_9_1 = yield response_9.next(), _d = response_9_1.done, !_d; _x = true) {
                                    _f = response_9_1.value;
                                    _x = false;
                                    const chunk = _f;
                                    const content = (_t = (_s = (_r = chunk.choices) === null || _r === void 0 ? void 0 : _r[0]) === null || _s === void 0 ? void 0 : _s.delta) === null || _t === void 0 ? void 0 : _t.content;
                                    if (content) {
                                        streamCallback(content);
                                        finalText += content;
                                    }
                                }
                            }
                            catch (e_12_1) { e_12 = { error: e_12_1 }; }
                            finally {
                                try {
                                    if (!_x && !_d && (_e = response_9.return)) yield _e.call(response_9);
                                }
                                finally { if (e_12) throw e_12.error; }
                            }
                            return this.parseResponse(finalText);
                        }
                        const response = yield this.ai.chat.completions.create({
                            model: this.apiProvider.model,
                            messages: contextWithStyle,
                            temperature: this.apiProvider.temperature,
                            max_tokens: this.apiProvider.maxTokens,
                        });
                        return this.parseResponse(response.choices[0].message.content);
                    }
                    case "Claude (Anthropic)": {
                        const contentParts = contextWithStyle.map(msg => ({
                            type: "text",
                            text: msg.content
                        }));
                        const response = yield this.ai.messages.create({
                            model: this.apiProvider.model,
                            max_tokens: this.apiProvider.maxTokens,
                            messages: [{ role: "user", content: contentParts }],
                            stream: true
                        });
                        let finalText = "";
                        try {
                            for (var _y = true, response_10 = __asyncValues(response), response_10_1; response_10_1 = yield response_10.next(), _g = response_10_1.done, !_g; _y = true) {
                                _j = response_10_1.value;
                                _y = false;
                                const message = _j;
                                if (message.type === "content_block_delta") {
                                    finalText += message.delta.text;
                                    if (stream) {
                                        streamCallback(message.delta.text);
                                    }
                                }
                            }
                        }
                        catch (e_13_1) { e_13 = { error: e_13_1 }; }
                        finally {
                            try {
                                if (!_y && !_g && (_h = response_10.return)) yield _h.call(response_10);
                            }
                            finally { if (e_13) throw e_13.error; }
                        }
                        return this.parseResponse(finalText);
                    }
                }
            }
            else {
                // Initial document analysis (not chat mode)
                const newPrompt = `
                    ${promptContent}
                                
                    Your task is to analyze the provided documents and perform the following action:
                    There can be multiple documents, so you need to process all of them.
                                
                    **Processing Option:** ${aiInstructions[processingOption]}
                    **Document Type:** ${documentType}
                    **User's Goal:** ${goal}
                                
                    Please extract or generate relevant content based on the user's intent. The final output must be structured and returned in valid **HTML** format. Avoid adding explanations or commentary outside the HTML.
                                
                    Based on the information above, generate a clean and modern HTML layout using the following structure and rules:
  
                    🔧 STRUCTURE:
                    - Wrap everything inside:
                    <div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-size: 16px; line-height: 1.6;">
                        ...content...
                    </div>
                    
                    💡 STYLE RULES:
                    - All text should use #2c3e50
                    - Accent color is #c0392b (red)
                    - Font: 'Segoe UI', sans-serif
                    - Add spacing (20px+), clean font sizes, and soft box shadows
                    - Table rows should alternate background colors (#f9f9f9, #fff)
                    - Any HTML tag used (like h1, p, table, etc.) must have its CSS explicitly defined inline, including font size, font weight, colors, padding, margins, etc. — do not rely on browser defaults.

                    🚫 DO NOT include:
                    - Markdown
                    - JavaScript
                    - External styles
                    - Comments
                    
                    🎯 GOAL:
                    - Final HTML should look clean, readable, modern, and styled with inline CSS only.
                    - Include a graph/chart as a chart using Svg, where needed.
                    - There charts should not have extra white space around them.
                    - Make sure the charts should always take 100% width, not more than that.
                    - Make sure that the html you generate is long and detailed.
                    - Content must begin with the <div> container as mentioned.
                    `;
                switch (this.apiProvider.name) {
                    case "Gemini (Google)": {
                        const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                        if (stream) {
                            const response = yield model.generateContentStream([
                                ...context.map(msg => msg.content),
                                ...(files || []).map((file) => ({
                                    inlineData: {
                                        mimeType: file.type,
                                        data: file.base64,
                                    },
                                })),
                                styleInstructions,
                                newPrompt
                            ]);
                            let finalText = "";
                            try {
                                for (var _z = true, _0 = __asyncValues(response.stream), _1; _1 = yield _0.next(), _k = _1.done, !_k; _z = true) {
                                    _m = _1.value;
                                    _z = false;
                                    const chunk = _m;
                                    const text = chunk.text();
                                    if (text) {
                                        streamCallback(text);
                                        finalText += text;
                                    }
                                }
                            }
                            catch (e_14_1) { e_14 = { error: e_14_1 }; }
                            finally {
                                try {
                                    if (!_z && !_k && (_l = _0.return)) yield _l.call(_0);
                                }
                                finally { if (e_14) throw e_14.error; }
                            }
                            return this.parseResponse(finalText);
                        }
                        const response = yield model.generateContent([
                            ...context.map(msg => msg.content),
                            ...(files || []).map((file) => ({
                                inlineData: {
                                    mimeType: file.type,
                                    data: file.base64,
                                },
                            })),
                            styleInstructions,
                            newPrompt
                        ]);
                        return this.parseResponse(response.response.text());
                    }
                    case "ChatGPT (OpenAI)": {
                        const fileIds = yield Promise.all((files || []).map((file) => __awaiter(this, void 0, void 0, function* () {
                            const buffer = Buffer.from(file.base64, 'base64');
                            const upload = yield this.ai.files.create({
                                file: buffer,
                                purpose: 'assistants',
                            });
                            return upload.id;
                        })));
                        const assistant = yield this.ai.assistants.retrieve(this.apiProvider.model);
                        const thread = yield this.ai.threads.create();
                        // Add context messages first
                        for (const message of context) {
                            yield this.ai.threads.messages.create(thread.id, message);
                        }
                        yield this.ai.threads.messages.create(thread.id, {
                            role: 'user',
                            content: newPrompt,
                            file_ids: fileIds,
                        });
                        const run = yield this.ai.threads.runs.create(thread.id, {
                            assistant_id: assistant.id,
                        });
                        if (stream) {
                            let status;
                            do {
                                const updatedRun = yield this.ai.threads.runs.retrieve(thread.id, run.id);
                                status = updatedRun.status;
                                if (status === 'completed') {
                                    const messages = yield this.ai.threads.messages.list(thread.id);
                                    const content = messages.data[0].content[0].text.value;
                                    streamCallback(content);
                                    return this.parseResponse(content);
                                }
                                yield new Promise((r) => setTimeout(r, 2000));
                            } while (status !== 'completed');
                        }
                        let status;
                        do {
                            const updatedRun = yield this.ai.threads.runs.retrieve(thread.id, run.id);
                            status = updatedRun.status;
                            yield new Promise((r) => setTimeout(r, 2000));
                        } while (status !== 'completed');
                        const messages = yield this.ai.threads.messages.list(thread.id);
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
                        const response = yield this.ai.messages.create({
                            model: this.apiProvider.model,
                            max_tokens: this.apiProvider.maxTokens,
                            messages: [{ role: "user", content: contentParts }],
                            stream: true
                        });
                        let finalText = "";
                        try {
                            for (var _2 = true, response_11 = __asyncValues(response), response_11_1; response_11_1 = yield response_11.next(), _o = response_11_1.done, !_o; _2 = true) {
                                _q = response_11_1.value;
                                _2 = false;
                                const message = _q;
                                if (message.type === "content_block_delta") {
                                    finalText += message.delta.text;
                                    if (stream) {
                                        streamCallback(message.delta.text);
                                    }
                                }
                            }
                        }
                        catch (e_15_1) { e_15 = { error: e_15_1 }; }
                        finally {
                            try {
                                if (!_2 && !_o && (_p = response_11.return)) yield _p.call(response_11);
                            }
                            finally { if (e_15) throw e_15.error; }
                        }
                        return this.parseResponse(finalText);
                    }
                }
            }
        });
    }
    processDocument(files_1, processingOption_1, documentType_1, goal_1, promptContent_1) {
        return __awaiter(this, arguments, void 0, function* (files, processingOption, documentType, goal, promptContent, stream = false, streamCallback = () => { }) {
            var _a, e_16, _b, _c, _d, e_17, _e, _f;
            const newPrompt = `
                    ${promptContent}
                                
                    Your task is to analyze the provided documents and perform the following action:
                    There can be multiple documents, so you need to process all of them.
                                
                    **Processing Option:** ${aiInstructions[processingOption]}
                    **Document Type:** ${documentType}
                    **User's Goal:** ${goal}
                                
                    Please extract or generate relevant content based on the user's intent. The final output must be structured and returned in valid **HTML** format. Avoid adding explanations or commentary outside the HTML.
                                
                    Based on the information above, generate a clean and modern HTML layout using the following structure and rules:
  
                    🔧 STRUCTURE:
                    - Wrap everything inside:
                    <div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-size: 16px; line-height: 1.6;">
                        ...content...
                    </div>
                    
                    💡 STYLE RULES:
                    - All text should use #2c3e50
                    - Accent color is #c0392b (red)
                    - Font: 'Segoe UI', sans-serif
                    - Add spacing (20px+), clean font sizes, and soft box shadows
                    - Table rows should alternate background colors (#f9f9f9, #fff)
                    - Any HTML tag used (like h1, p, table, etc.) must have its CSS explicitly defined inline, including font size, font weight, colors, padding, margins, etc. — do not rely on browser defaults.

                    🚫 DO NOT include:
                    - Markdown
                    - JavaScript
                    - External styles
                    - Comments
                    
                    🎯 GOAL:
                    - Final HTML should look clean, readable, modern, and styled with inline CSS only.
                    - Include a graph/chart as a chart using Svg, where needed.
                    - There charts should not have extra white space around them.
                    - Make sure the charts should always take 100% width, not more than that.
                    - Make sure that the html you generate is long and detailed.
                    - Content must begin with the <div> container as mentioned.
                    `;
            switch (this.apiProvider.name) {
                case "Gemini (Google)": {
                    const model = this.ai.getGenerativeModel({ model: this.apiProvider.model });
                    if (stream) {
                        const response = yield model.generateContentStream([
                            ...(files || []).map((file) => ({
                                inlineData: {
                                    mimeType: file.type,
                                    data: file.base64,
                                },
                            })),
                            styleInstructions,
                            newPrompt
                        ]);
                        let finalText = "";
                        try {
                            for (var _g = true, _h = __asyncValues(response.stream), _j; _j = yield _h.next(), _a = _j.done, !_a; _g = true) {
                                _c = _j.value;
                                _g = false;
                                const chunk = _c;
                                const text = chunk.text();
                                if (text) {
                                    streamCallback(text);
                                    finalText += text;
                                }
                            }
                        }
                        catch (e_16_1) { e_16 = { error: e_16_1 }; }
                        finally {
                            try {
                                if (!_g && !_a && (_b = _h.return)) yield _b.call(_h);
                            }
                            finally { if (e_16) throw e_16.error; }
                        }
                        return this.parseResponse(finalText);
                    }
                    const response = yield model.generateContent([
                        ...(files || []).map((file) => ({
                            inlineData: {
                                mimeType: file.type,
                                data: file.base64,
                            },
                        })),
                        styleInstructions,
                        newPrompt
                    ]);
                    return this.parseResponse(response.response.text());
                }
                case "ChatGPT (OpenAI)": {
                    const fileIds = yield Promise.all((files || []).map((file) => __awaiter(this, void 0, void 0, function* () {
                        const buffer = Buffer.from(file.base64, 'base64');
                        const upload = yield this.ai.files.create({
                            file: buffer,
                            purpose: 'assistants',
                        });
                        return upload.id;
                    })));
                    const assistant = yield this.ai.assistants.retrieve(this.apiProvider.model);
                    const thread = yield this.ai.threads.create();
                    yield this.ai.threads.messages.create(thread.id, {
                        role: 'user',
                        content: newPrompt,
                        file_ids: fileIds,
                    });
                    const run = yield this.ai.threads.runs.create(thread.id, {
                        assistant_id: assistant.id,
                    });
                    if (stream) {
                        let status;
                        do {
                            const updatedRun = yield this.ai.threads.runs.retrieve(thread.id, run.id);
                            status = updatedRun.status;
                            if (status === 'completed') {
                                const messages = yield this.ai.threads.messages.list(thread.id);
                                const content = messages.data[0].content[0].text.value;
                                streamCallback(content);
                                return this.parseResponse(content);
                            }
                            yield new Promise((r) => setTimeout(r, 2000));
                        } while (status !== 'completed');
                    }
                    let status;
                    do {
                        const updatedRun = yield this.ai.threads.runs.retrieve(thread.id, run.id);
                        status = updatedRun.status;
                        yield new Promise((r) => setTimeout(r, 2000));
                    } while (status !== 'completed');
                    const messages = yield this.ai.threads.messages.list(thread.id);
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
                    const response = yield this.ai.messages.create({
                        model: this.apiProvider.model,
                        max_tokens: this.apiProvider.maxTokens,
                        messages: [{ role: "user", content: contentParts }],
                        stream: true,
                    });
                    let finalText = "";
                    try {
                        for (var _k = true, response_12 = __asyncValues(response), response_12_1; response_12_1 = yield response_12.next(), _d = response_12_1.done, !_d; _k = true) {
                            _f = response_12_1.value;
                            _k = false;
                            const chunk = _f;
                            if (chunk.type === "content_block_delta") {
                                finalText += chunk.delta.text;
                                if (stream) {
                                    streamCallback(chunk.delta.text);
                                }
                            }
                        }
                    }
                    catch (e_17_1) { e_17 = { error: e_17_1 }; }
                    finally {
                        try {
                            if (!_k && !_d && (_e = response_12.return)) yield _e.call(response_12);
                        }
                        finally { if (e_17) throw e_17.error; }
                    }
                    return this.parseResponse(finalText);
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
/**
 * Estimates the number of tokens that will be used for AI API calls
 * @param {string} prompt - The input prompt text
 * @param {string} generatedContent - The generated/expected output content
 * @param {Object} options - Configuration options
 * @param {number} options.charsPerToken - Average characters per token (default: 4)
 * @param {number} options.overhead - Additional tokens for API overhead (default: 10)
 * @param {boolean} options.includeSystemTokens - Whether to include system message overhead (default: true)
 * @returns {Object} Token usage breakdown
 */
function estimateTokens(prompt, generatedContent = '', options = {}) {
    const { charsPerToken = 4, overhead = 10, includeSystemTokens = true } = options;
    // Calculate input tokens (prompt)
    const inputTokens = Math.ceil(prompt.length / charsPerToken);
    // Calculate output tokens (generated content)
    const outputTokens = Math.ceil(generatedContent.length / charsPerToken);
    // System tokens (typical overhead for API calls)
    const systemTokens = includeSystemTokens ? 20 : 0;
    // Additional overhead for formatting, special tokens, etc.
    const overheadTokens = overhead;
    // Total tokens
    const totalTokens = inputTokens + outputTokens + systemTokens + overheadTokens;
    return {
        inputTokens,
        outputTokens,
        systemTokens,
        overheadTokens,
        totalTokens,
        breakdown: {
            prompt: inputTokens,
            generated: outputTokens,
            system: systemTokens,
            overhead: overheadTokens
        }
    };
}
