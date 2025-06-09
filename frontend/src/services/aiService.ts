// // This service handles integration with various AI models for generating summaries
// import {
//   directZoomVttFetch,
//   extractVttUrlFromZoomRecording as importedExtractVttUrl,
//   parseVttFile,
// } from "./vttParser";

// /**
//  * Sends the transcript to the selected AI model and gets a formatted summary
//  */
// // model: "Perplexity" | "ChatGPT (OpenAI)" | "Claude (Anthropic)" | "Gemini (Google)" | "Mistral" | "Ollama (Self-hosted)" = "gemini"
// export async function generateMeetingSummary(
//   transcript: string,
//   apiKey: string,
//   model,
//   // model: "gemini" | "openai" | "anthropic" | "groq" = "gemini"
//   aiModel
// ): Promise<string> {
//   try {
//     if (!apiKey) {
//       throw new Error("API key is required");
//     }

//     if (!transcript || transcript.trim().length < 10) {
//       throw new Error(
//         "Transcript is too short to generate a meaningful summary"
//       );
//     }

//     console.log(`Generating summary using ${model} model...`);

//     const prompt = generatePrompt(transcript);

//     // Choose the appropriate API based on the model
//     switch (model) {
//       case "Gemini (Google)":
//         return await generateWithGemini(prompt, apiKey, aiModel);
//       case "ChatGPT (OpenAI)":
//         return await generateWithOpenAI(prompt, apiKey, aiModel);
//       case "Claude (Anthropic)":
//         return await generateWithAnthropic(prompt, apiKey, aiModel);
//       // case "groq":
//       //   return await generateWithGroq(prompt, apiKey);
//       default:
//         throw new Error("Invalid model selected");
//     }
//   } catch (error) {
//     console.error("Error generating summary:", error);
//     throw new Error(
//       `Error generating summary: ${
//         error instanceof Error ? error.message : "Unknown error"
//       }`
//     );
//   }
// }

// /**
//  * Extracts and processes a transcript from a Zoom meeting URL
//  * Uses multiple methods and fallbacks to get the VTT content
//  */
// export async function extractTranscriptFromZoomUrl(
//   zoomUrl: string
// ): Promise<string> {
//   try {
//     console.log("Extracting transcript from Zoom URL:", zoomUrl);

//     // First try the direct method that matches the HTML file approach
//     try {
//       console.log("Trying direct Zoom VTT fetch method first");
//       const transcript = await directZoomVttFetch(zoomUrl);

//       if (transcript) {
//         console.log("Direct method successful");
//         return transcript;
//       }
//     } catch (directError) {
//       console.warn(
//         "Direct method failed, trying standard method:",
//         directError
//       );
//     }

//     // Fall back to standard method if direct method fails
//     try {
//       // Step 1: Extract VTT URL from Zoom Recording
//       const vttUrl = await importedExtractVttUrl(zoomUrl);

//       if (!vttUrl) {
//         throw new Error(
//           "Failed to extract VTT file URL from the Zoom recording"
//         );
//       }

//       console.log("VTT URL extracted:", vttUrl);

//       // Step 2: Parse VTT file to get transcript
//       const transcript = await parseVttFile(vttUrl);

//       if (!transcript) {
//         throw new Error("Failed to parse VTT file");
//       }

//       return transcript;
//     } catch (parseError) {
//       console.error("Standard VTT extraction failed:", parseError);
//       throw parseError;
//     }
//   } catch (error) {
//     console.error("Failed to extract transcript from Zoom URL:", error);

//     // Provide more specific guidance based on error type
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error";
//     if (
//       errorMessage.includes("Failed to fetch") ||
//       errorMessage.includes("CORS")
//     ) {
//       throw new Error(
//         "Unable to process this Zoom URL due to browser security restrictions (CORS). Please switch to the 'Upload VTT' tab and follow the instructions to download and upload the transcript file directly."
//       );
//     } else {
//       throw error;
//     }
//   }
// }

// // Local extractVttUrlFromZoomRecording implementation has been removed
// // Now using the imported function from vttParser.ts

// /**
//  * Fetch VTT content from a URL using multiple methods and proxies
//  */
// async function fetchVttContent(vttUrl: string): Promise<string> {
//   console.log(
//     "Attempting to fetch VTT content with multiple methods and fallbacks"
//   );

//   // List of CORS proxies to try
//   const corsProxies = [
//     `https://corsproxy.io/?${encodeURIComponent(vttUrl)}`,
//     `https://api.allorigins.win/raw?url=${encodeURIComponent(vttUrl)}`,
//     `https://proxy.cors.sh/${vttUrl}`,
//     `https://corsproxy.org/?${encodeURIComponent(vttUrl)}`,
//     `https://cors-anywhere.herokuapp.com/${vttUrl}`,
//     `https://thingproxy.freeboard.io/fetch/${vttUrl}`,
//     `https://api.codetabs.com/v1/proxy/?quest=${vttUrl}`,
//     `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(vttUrl)}`,
//   ];

//   // Custom headers for direct fetch attempts
//   const customHeaders = {
//     Accept: "text/vtt,text/plain,*/*",
//     Origin: window.location.origin,
//     "X-Requested-With": "XMLHttpRequest",
//   };

//   // Fetch options for direct attempts
//   const fetchOptions = {
//     method: "GET",
//     headers: customHeaders,
//     mode: "cors" as RequestMode,
//     cache: "no-cache" as RequestCache,
//   };

//   // Try direct fetch with different options and URL variations
//   const failedAttempts: Error[] = [];

//   // First try: Direct fetch with proper headers
//   try {
//     console.log("Attempting direct fetch with custom headers");
//     const response = await fetch(vttUrl, fetchOptions);

//     if (response.ok) {
//       const text = await response.text();
//       if (
//         text &&
//         text.length > 20 &&
//         (text.includes("-->") || text.includes("WEBVTT"))
//       ) {
//         console.log("Direct fetch successful");
//         return text;
//       }
//       failedAttempts.push(
//         new Error("Response didn't contain valid VTT content")
//       );
//     } else {
//       failedAttempts.push(new Error(`HTTP error: ${response.status}`));
//     }
//   } catch (error) {
//     console.log("Direct fetch failed:", error);
//     failedAttempts.push(error as Error);
//   }

//   // Second try: Try no-cors mode
//   try {
//     console.log("Attempting fetch with no-cors mode");
//     const response = await fetch(vttUrl, {
//       ...fetchOptions,
//       mode: "no-cors",
//     });

//     // With no-cors, we can't actually read the response content due to CORS restrictions
//     console.log("No-cors fetch completed but likely can't access content");
//   } catch (error) {
//     console.log("No-cors fetch failed:", error);
//   }

//   // Third try: Try with alternative VTT URL constructions
//   const alternativeUrls = [
//     `https://zoom.us/rec/transcript?type=transcript&id=${
//       vttUrl.split("fid=")[1]?.split("&")[0]
//     }`,
//     `https://zoom.us/rec/play/${
//       vttUrl.split("fid=")[1]?.split("&")[0]
//     }/transcript.vtt`,
//   ];

//   for (const altUrl of alternativeUrls) {
//     try {
//       console.log("Trying alternative URL format:", altUrl);
//       const response = await fetch(altUrl, fetchOptions);

//       if (response.ok) {
//         const text = await response.text();
//         if (
//           text &&
//           text.length > 20 &&
//           (text.includes("-->") || text.includes("WEBVTT"))
//         ) {
//           console.log("Alternative URL format fetch successful");
//           return text;
//         }
//       }
//     } catch (error) {
//       console.log("Alternative URL fetch failed:", error);
//     }
//   }

//   // Fourth try: Attempt with each CORS proxy
//   for (const proxyUrl of corsProxies) {
//     try {
//       console.log("Trying CORS proxy:", proxyUrl);
//       const response = await fetch(proxyUrl, {
//         method: "GET",
//         headers: {
//           "X-Requested-With": "XMLHttpRequest",
//         },
//       });

//       if (response.ok) {
//         const text = await response.text();
//         if (
//           text &&
//           text.length > 20 &&
//           (text.includes("-->") || text.includes("WEBVTT"))
//         ) {
//           console.log("Proxy fetch successful");
//           return text;
//         }
//         failedAttempts.push(
//           new Error(`Proxy ${proxyUrl} returned invalid content`)
//         );
//       } else {
//         failedAttempts.push(
//           new Error(`Proxy ${proxyUrl} HTTP error: ${response.status}`)
//         );
//       }
//     } catch (error) {
//       console.log(`Proxy ${proxyUrl} fetch failed:`, error);
//       failedAttempts.push(error as Error);
//     }
//   }

//   // If all attempts failed
//   console.error("All VTT fetch attempts failed:", failedAttempts);
//   throw new Error(
//     "Could not fetch VTT content after multiple attempts. Browser security restrictions might be blocking access."
//   );
// }

// /**
//  * Process VTT content and extract transcript text
//  */
// function processVttToTranscript(vttContent: string): string {
//   try {
//     console.log("Processing VTT content, length:", vttContent.length);

//     if (!vttContent || vttContent.trim().length === 0) {
//       throw new Error("VTT content is empty");
//     }

//     // Check if the content starts with WEBVTT to confirm it's in the right format
//     if (!vttContent.trim().startsWith("WEBVTT")) {
//       console.log(
//         "Warning: Content doesn't start with WEBVTT header. Will attempt to process anyway."
//       );
//     }

//     // Clean up potential formatting issues
//     let cleanedVtt = vttContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

//     // Split the VTT content into lines
//     const lines = cleanedVtt.split("\n");
//     console.log("Number of lines:", lines.length);

//     // Standard VTT parsing
//     let transcript = "";
//     let currentText = "";
//     let isInTextBlock = false;
//     let hasFoundTimestamp = false;

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i].trim();

//       // Skip empty lines, headers and notes
//       if (line === "" || line === "WEBVTT" || line.startsWith("NOTE")) {
//         continue;
//       }

//       // Check if line contains timestamp (contains "-->")
//       if (line.includes("-->")) {
//         hasFoundTimestamp = true;
//         isInTextBlock = true;
//         // If we've collected text from a previous cue, add it to transcript
//         if (currentText) {
//           transcript += currentText + " ";
//           currentText = "";
//         }
//         continue;
//       }

//       // If we're in a text block and not a cue number
//       if (isInTextBlock && !/^\d+$/.test(line)) {
//         // Remove any speaker labels like "Speaker: " or "[Speaker Name]: "
//         let textLine = line;
//         const speakerMatch = line.match(/^.*?[:]\s*(.*)/);
//         if (speakerMatch && speakerMatch[1]) {
//           textLine = speakerMatch[1];
//         }

//         currentText += textLine + " ";

//         // Check if we're at the end of a cue block (next line is empty or contains a timestamp)
//         if (
//           i + 1 >= lines.length ||
//           lines[i + 1].trim() === "" ||
//           lines[i + 1].includes("-->") ||
//           /^\d+$/.test(lines[i + 1].trim())
//         ) {
//           isInTextBlock = false;
//         }
//       }
//     }

//     // Add the last text block if there is one
//     if (currentText) {
//       transcript += currentText;
//     }

//     // Trim and ensure the transcript has content
//     transcript = transcript.trim();
//     console.log("Extracted transcript length:", transcript.length);

//     // If standard parsing didn't work, try fallback extraction - just take everything that looks like text
//     if (!hasFoundTimestamp || transcript.length < 10) {
//       console.log(
//         "Standard parsing insufficient, using fallback extraction..."
//       );
//       let fallbackTranscript = "";

//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].trim();

//         // Skip obvious non-content lines
//         if (
//           line === "" ||
//           line === "WEBVTT" ||
//           line.startsWith("NOTE") ||
//           line.includes("-->") ||
//           /^\d+$/.test(line) ||
//           /^\d{2}:\d{2}:\d{2}/.test(line)
//         ) {
//           continue;
//         }

//         // If it looks like text content rather than metadata, include it
//         if (
//           line.length > 3 &&
//           line.split(" ").length > 1 &&
//           !/^STYLE|^REGION|^Kind:|^Language:/.test(line)
//         ) {
//           // Remove any speaker labels
//           let textLine = line;
//           const speakerMatch = line.match(/^.*?[:]\s*(.*)/);
//           if (speakerMatch && speakerMatch[1]) {
//             textLine = speakerMatch[1];
//           }

//           fallbackTranscript += textLine + " ";
//         }
//       }

//       fallbackTranscript = fallbackTranscript.trim();

//       // Use whichever method produced more content
//       if (fallbackTranscript.length > transcript.length) {
//         transcript = fallbackTranscript;
//       }
//     }

//     // Final cleanup - fix spacing issues
//     const cleanedTranscript = transcript
//       .replace(/\s+/g, " ") // Remove extra spaces
//       .replace(/(\w)\.(\w)/g, "$1. $2") // Add space after periods between words
//       .replace(/ ([,.!?:;]) /g, "$1 ") // Remove space before punctuation
//       .replace(/\s([,.!?:;])/g, "$1") // Remove space before punctuation (another pattern)
//       .trim();

//     // Ensure the transcript has substantial content
//     if (cleanedTranscript.length < 10) {
//       console.error("Extracted transcript is too short:", cleanedTranscript);
//       throw new Error(
//         "Couldn't extract meaningful transcript from VTT content. Please check the file format."
//       );
//     }

//     return cleanedTranscript;
//   } catch (error) {
//     console.error("Error processing VTT:", error);
//     throw new Error(`Failed to process VTT: ${(error as Error).message}`);
//   }
// }

// /**
//  * Generate a summary using Google's Gemini API
//  */
// async function generateWithGemini(
//   prompt: string,
//   apiKey: string,
//   aiModel: string
// ): Promise<string> {
//   // Using gemini-2.0-flash model
//   const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent`;

//   const response = await fetch(apiUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "x-goog-api-key": apiKey,
//     },
//     body: JSON.stringify({
//       contents: [
//         {
//           parts: [
//             {
//               text: prompt,
//             },
//           ],
//         },
//       ],
//       generationConfig: {
//         temperature: 0.5,
//         maxOutputTokens: 4096,
//       },
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(
//       `Gemini API error: ${errorData.error?.message || response.statusText}`
//     );
//   }

//   const data = await response.json();

//   // Extract the text content from the response
//   let summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

//   // Clean up the response
//   return cleanupSummary(summary);
// }

// /**
//  * Generate a summary using OpenAI's API (GPT-4o-mini)
//  */
// async function generateWithOpenAI(
//   prompt: string,
//   apiKey: string,
//   aiModel: string
// ): Promise<string> {
//   const apiUrl = "https://api.openai.com/v1/chat/completions";

//   const response = await fetch(apiUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model: aiModel,
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an expert meeting summarizer that provides clear, professional summaries with accurate timestamps.",
//         },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.5,
//       max_tokens: 4000,
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(
//       `OpenAI API error: ${errorData.error?.message || response.statusText}`
//     );
//   }

//   const data = await response.json();

//   // Extract the text content from the response
//   let summary = data.choices?.[0]?.message?.content || "";

//   // Clean up the response
//   return cleanupSummary(summary);
// }

// /**
//  * Generate a summary using Anthropic's API (Claude 3.7 Sonnet)
//  */
// async function generateWithAnthropic(
//   prompt: string,
//   apiKey: string,
//   aiModel: string
// ): Promise<string> {
//   const apiUrl = "https://api.anthropic.com/v1/messages";

//   const response = await fetch(apiUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-API-Key": apiKey,
//       "anthropic-version": "2023-06-01",
//     },
//     body: JSON.stringify({
//       model: aiModel,
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.5,
//       max_tokens: 4000,
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(
//       `Anthropic API error: ${errorData.error?.message || response.statusText}`
//     );
//   }

//   const data = await response.json();

//   // Extract the text content from the response
//   let summary = data.content?.[0]?.text || "";

//   // Clean up the response
//   return cleanupSummary(summary);
// }

// /**
//  * Generate a summary using Groq's API (Meta Llama 4 Scout)
//  */
// async function generateWithGroq(
//   prompt: string,
//   apiKey: string
// ): Promise<string> {
//   const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

//   const response = await fetch(apiUrl, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model: "meta-llama/llama-4-scout-17b-16e-instruct",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are an expert meeting summarizer that provides clear, professional summaries with accurate timestamps.",
//         },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.5,
//       max_tokens: 4000,
//     }),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(
//       `Groq API error: ${errorData.error?.message || response.statusText}`
//     );
//   }

//   const data = await response.json();

//   // Extract the text content from the response
//   let summary = data.choices?.[0]?.message?.content || "";

//   // Clean up the response
//   return cleanupSummary(summary);
// }

// /**
//  * Generate a prompt for summarizing a meeting transcript
//  */
// function generatePrompt(transcript: string): string {
//   return `
//     You are an expert meeting summarizer. Please create a comprehensive, detailed, and professional summary
//     of the following meeting transcript. Your summary should be:

//     1. Well-structured and organized with clear sections
//     2. Include key points, action items, and decisions made
//     3. Maintain a professional tone
//     4. Highlight important deadlines or follow-ups
//     5. Include a "Meeting Topics with Timestamps" section with ACCURATE timestamps extracted from the transcript
//     6. Meeting Title

//     Format your response as HTML with visually appealing styling:
//     - Main heading: <h1 style="color: #0E72ED; font-size: 1.8rem; border-bottom: 2px solid #0E72ED; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">Meeting Summary</h1>
//     - Section headings: <h2 style="color: #9b87f5; font-size: 1.5rem; margin-top: 1.5rem; border-bottom: 1px solid #E5DEFF; padding-bottom: 0.3rem;">Section Name</h2>
//     - Subsections: <h3 style="color: #0E72ED; font-size: 1.2rem; margin-top: 1rem;">Subsection Name</h3>
//     - Meeting Topics section: <h2 style="color: #9b87f5; font-size: 1.5rem; margin-top: 1.5rem; border-bottom: 1px solid #E5DEFF; padding-bottom: 0.3rem;">Meeting Topics with Timestamps</h2>
//     - For each topic with timestamp:
//         <div style="margin-bottom: 1.2rem; padding: 0.6rem; background-color: #F9F8FF; border-radius: 0.3rem; border-left: 3px solid #9b87f5;">
//           <span style="color: #0E72ED; font-weight: bold; font-family: monospace; background-color: #E8F4FE; padding: 0.2rem 0.4rem; border-radius: 0.2rem; margin-right: 0.5rem;">00:00:00</span>
//           <span style="font-weight: 500;">Topic description</span>
//         </div>
//     - Paragraphs: <p style="margin-bottom: 1rem; line-height: 1.6;">Content</p>
//     - Bullet points: <ul style="margin-bottom: 1rem; padding-left: 1.5rem;"><li style="margin-bottom: 0.5rem;">Point</li></ul>
//     - Important notes: <div style="background-color: #E5DEFF; border-left: 4px solid #9b87f5; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;">Important note</div>
//     - Action items: <div style="background-color: #E8F4FE; border-left: 4px solid #0E72ED; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;"><span style="font-weight: bold; color: #0E72ED;">Action Item: </span>Description</div>
//     - Decisions: <div style="background-color: #E8FCEF; border-left: 4px solid #10B981; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;"><span style="font-weight: bold; color: #10B981;">Decision: </span>Description</div>

//     IMPORTANT INSTRUCTIONS FOR TIMESTAMPS:
//     1. Carefully extract REAL timestamps from the transcript. Do not make up or estimate timestamps.
//     2. If the transcript includes timestamps (e.g., [00:05:30]), use these exact timestamps.
//     3. Include timestamps for at least 5-8 key discussion topics to provide a helpful timeline.
//     4. Present timestamps in the format HH:MM:SS or MM:SS if less than an hour.
//     5. Organize topics chronologically according to when they appear in the transcript.
//     6. Each timestamp entry should clearly describe the specific topic being discussed at that time.

//     IMPORTANT: DO NOT include markdown code blocks or any triple backticks in your response. Provide clean HTML only.

//     Always include these sections:
//     1. Meeting Title
//     2. Executive Summary
//     3. Key Discussion Points
//     4. Meeting Topics with Timestamps (with ACCURATE timestamps from the transcript)
//     5. Action Items
//     6. Decisions Made
//     7. Follow-ups and Next Steps

//     Here's the transcript to summarize:

//     ${transcript}
//   `;
// }

// /**
//  * Clean up the summary to remove markdown code blocks and other unwanted formatting
//  */
// function cleanupSummary(summary: string): string {
//   // Remove markdown code block indicators if present
//   let cleaned = summary.replace(/```html/g, "").replace(/```/g, "");

//   // Remove extraneous whitespace
//   cleaned = cleaned.trim();

//   // If the summary starts with any common markdown indicators, remove them
//   cleaned = cleaned.replace(/^<html>|^<body>/i, "");

//   return cleaned;
// }

// This service handles integration with various AI models for generating summaries
import {
  directZoomVttFetch,
  extractVttUrlFromZoomRecording as importedExtractVttUrl,
  parseVttFile,
} from "./vttParser";

/**
 * Sends the transcript to the selected AI model and gets a formatted summary
 */
// model: "Perplexity" | "ChatGPT (OpenAI)" | "Claude (Anthropic)" | "Gemini (Google)" | "Mistral" | "Ollama (Self-hosted)" = "gemini"
export async function generateMeetingSummary(
  transcript: string,
  apiKey: string,
  model,
  // model: "gemini" | "openai" | "anthropic" | "groq" = "gemini"
  aiModel
): Promise<string> {
  try {
    if (!apiKey) {
      throw new Error("API key is required");
    }

    if (!transcript || transcript.trim().length < 10) {
      throw new Error(
        "Transcript is too short to generate a meaningful summary"
      );
    }

    console.log(`Generating summary using ${model} model...`);

    const prompt = generatePrompt(transcript);

    // Choose the appropriate API based on the model
    switch (model) {
      case "Gemini (Google)":
        return await generateWithGemini(prompt, apiKey, aiModel);
      case "ChatGPT (OpenAI)":
        return await generateWithOpenAI(prompt, apiKey, aiModel);
      case "Claude (Anthropic)":
        return await generateWithAnthropic(prompt, apiKey, aiModel);
      // case "groq":
      //   return await generateWithGroq(prompt, apiKey);
      default:
        throw new Error("Invalid model selected");
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error(
      `Error generating summary: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extracts and processes a transcript from a Zoom meeting URL
 * Uses multiple methods and fallbacks to get the VTT content
 */
export async function extractTranscriptFromZoomUrl(
  zoomUrl: string
): Promise<string> {
  try {
    console.log("Extracting transcript from Zoom URL:", zoomUrl);

    // First try the direct method that matches the HTML file approach
    try {
      console.log("Trying direct Zoom VTT fetch method first");
      const transcript = await directZoomVttFetch(zoomUrl);

      if (transcript) {
        console.log("Direct method successful");
        return transcript;
      }
    } catch (directError) {
      console.warn(
        "Direct method failed, trying standard method:",
        directError
      );
    }

    // Fall back to standard method if direct method fails
    try {
      // Step 1: Extract VTT URL from Zoom Recording
      const vttUrl = await importedExtractVttUrl(zoomUrl);

      if (!vttUrl) {
        throw new Error(
          "Failed to extract VTT file URL from the Zoom recording"
        );
      }

      console.log("VTT URL extracted:", vttUrl);

      // Step 2: Parse VTT file to get transcript
      const transcript = await parseVttFile(vttUrl);

      if (!transcript) {
        throw new Error("Failed to parse VTT file");
      }

      return transcript;
    } catch (parseError) {
      console.error("Standard VTT extraction failed:", parseError);
      throw parseError;
    }
  } catch (error) {
    console.error("Failed to extract transcript from Zoom URL:", error);

    // Provide more specific guidance based on error type
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (
      errorMessage.includes("Failed to fetch") ||
      errorMessage.includes("CORS")
    ) {
      throw new Error(
        "Unable to process this Zoom URL due to browser security restrictions (CORS). Please switch to the 'Upload VTT' tab and follow the instructions to download and upload the transcript file directly."
      );
    } else {
      throw error;
    }
  }
}

// Local extractVttUrlFromZoomRecording implementation has been removed
// Now using the imported function from vttParser.ts

/**
 * Fetch VTT content from a URL using multiple methods and proxies
 */
async function fetchVttContent(vttUrl: string): Promise<string> {
  console.log(
    "Attempting to fetch VTT content with multiple methods and fallbacks"
  );

  // List of CORS proxies to try
  const corsProxies = [
    `https://corsproxy.io/?${encodeURIComponent(vttUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(vttUrl)}`,
    `https://proxy.cors.sh/${vttUrl}`,
    `https://corsproxy.org/?${encodeURIComponent(vttUrl)}`,
    `https://cors-anywhere.herokuapp.com/${vttUrl}`,
    `https://thingproxy.freeboard.io/fetch/${vttUrl}`,
    `https://api.codetabs.com/v1/proxy/?quest=${vttUrl}`,
    `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(vttUrl)}`,
  ];

  // Custom headers for direct fetch attempts
  const customHeaders = {
    Accept: "text/vtt,text/plain,*/*",
    Origin: window.location.origin,
    "X-Requested-With": "XMLHttpRequest",
  };

  // Fetch options for direct attempts
  const fetchOptions = {
    method: "GET",
    headers: customHeaders,
    mode: "cors" as RequestMode,
    cache: "no-cache" as RequestCache,
  };

  // Try direct fetch with different options and URL variations
  const failedAttempts: Error[] = [];

  // First try: Direct fetch with proper headers
  try {
    console.log("Attempting direct fetch with custom headers");
    const response = await fetch(vttUrl, fetchOptions);

    if (response.ok) {
      const text = await response.text();
      if (
        text &&
        text.length > 20 &&
        (text.includes("-->") || text.includes("WEBVTT"))
      ) {
        console.log("Direct fetch successful");
        return text;
      }
      failedAttempts.push(
        new Error("Response didn't contain valid VTT content")
      );
    } else {
      failedAttempts.push(new Error(`HTTP error: ${response.status}`));
    }
  } catch (error) {
    console.log("Direct fetch failed:", error);
    failedAttempts.push(error as Error);
  }

  // Second try: Try no-cors mode
  try {
    console.log("Attempting fetch with no-cors mode");
    const response = await fetch(vttUrl, {
      ...fetchOptions,
      mode: "no-cors",
    });

    // With no-cors, we can't actually read the response content due to CORS restrictions
    console.log("No-cors fetch completed but likely can't access content");
  } catch (error) {
    console.log("No-cors fetch failed:", error);
  }

  // Third try: Try with alternative VTT URL constructions
  const alternativeUrls = [
    `https://zoom.us/rec/transcript?type=transcript&id=${
      vttUrl.split("fid=")[1]?.split("&")[0]
    }`,
    `https://zoom.us/rec/play/${
      vttUrl.split("fid=")[1]?.split("&")[0]
    }/transcript.vtt`,
  ];

  for (const altUrl of alternativeUrls) {
    try {
      console.log("Trying alternative URL format:", altUrl);
      const response = await fetch(altUrl, fetchOptions);

      if (response.ok) {
        const text = await response.text();
        if (
          text &&
          text.length > 20 &&
          (text.includes("-->") || text.includes("WEBVTT"))
        ) {
          console.log("Alternative URL format fetch successful");
          return text;
        }
      }
    } catch (error) {
      console.log("Alternative URL fetch failed:", error);
    }
  }

  // Fourth try: Attempt with each CORS proxy
  for (const proxyUrl of corsProxies) {
    try {
      console.log("Trying CORS proxy:", proxyUrl);
      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (response.ok) {
        const text = await response.text();
        if (
          text &&
          text.length > 20 &&
          (text.includes("-->") || text.includes("WEBVTT"))
        ) {
          console.log("Proxy fetch successful");
          return text;
        }
        failedAttempts.push(
          new Error(`Proxy ${proxyUrl} returned invalid content`)
        );
      } else {
        failedAttempts.push(
          new Error(`Proxy ${proxyUrl} HTTP error: ${response.status}`)
        );
      }
    } catch (error) {
      console.log(`Proxy ${proxyUrl} fetch failed:`, error);
      failedAttempts.push(error as Error);
    }
  }

  // If all attempts failed
  console.error("All VTT fetch attempts failed:", failedAttempts);
  throw new Error(
    "Could not fetch VTT content after multiple attempts. Browser security restrictions might be blocking access."
  );
}

/**
 * Process VTT content and extract transcript text
 */
function processVttToTranscript(vttContent: string): string {
  try {
    console.log("Processing VTT content, length:", vttContent.length);

    if (!vttContent || vttContent.trim().length === 0) {
      throw new Error("VTT content is empty");
    }

    // Check if the content starts with WEBVTT to confirm it's in the right format
    if (!vttContent.trim().startsWith("WEBVTT")) {
      console.log(
        "Warning: Content doesn't start with WEBVTT header. Will attempt to process anyway."
      );
    }

    // Clean up potential formatting issues
    let cleanedVtt = vttContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Split the VTT content into lines
    const lines = cleanedVtt.split("\n");
    console.log("Number of lines:", lines.length);

    // Standard VTT parsing
    let transcript = "";
    let currentText = "";
    let isInTextBlock = false;
    let hasFoundTimestamp = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines, headers and notes
      if (line === "" || line === "WEBVTT" || line.startsWith("NOTE")) {
        continue;
      }

      // Check if line contains timestamp (contains "-->")
      if (line.includes("-->")) {
        hasFoundTimestamp = true;
        isInTextBlock = true;
        // If we've collected text from a previous cue, add it to transcript
        if (currentText) {
          transcript += currentText + " ";
          currentText = "";
        }
        continue;
      }

      // If we're in a text block and not a cue number
      if (isInTextBlock && !/^\d+$/.test(line)) {
        // Remove any speaker labels like "Speaker: " or "[Speaker Name]: "
        let textLine = line;
        const speakerMatch = line.match(/^.*?[:]\s*(.*)/);
        if (speakerMatch && speakerMatch[1]) {
          textLine = speakerMatch[1];
        }

        currentText += textLine + " ";

        // Check if we're at the end of a cue block (next line is empty or contains a timestamp)
        if (
          i + 1 >= lines.length ||
          lines[i + 1].trim() === "" ||
          lines[i + 1].includes("-->") ||
          /^\d+$/.test(lines[i + 1].trim())
        ) {
          isInTextBlock = false;
        }
      }
    }

    // Add the last text block if there is one
    if (currentText) {
      transcript += currentText;
    }

    // Trim and ensure the transcript has content
    transcript = transcript.trim();
    console.log("Extracted transcript length:", transcript.length);

    // If standard parsing didn't work, try fallback extraction - just take everything that looks like text
    if (!hasFoundTimestamp || transcript.length < 10) {
      console.log(
        "Standard parsing insufficient, using fallback extraction..."
      );
      let fallbackTranscript = "";

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip obvious non-content lines
        if (
          line === "" ||
          line === "WEBVTT" ||
          line.startsWith("NOTE") ||
          line.includes("-->") ||
          /^\d+$/.test(line) ||
          /^\d{2}:\d{2}:\d{2}/.test(line)
        ) {
          continue;
        }

        // If it looks like text content rather than metadata, include it
        if (
          line.length > 3 &&
          line.split(" ").length > 1 &&
          !/^STYLE|^REGION|^Kind:|^Language:/.test(line)
        ) {
          // Remove any speaker labels
          let textLine = line;
          const speakerMatch = line.match(/^.*?[:]\s*(.*)/);
          if (speakerMatch && speakerMatch[1]) {
            textLine = speakerMatch[1];
          }

          fallbackTranscript += textLine + " ";
        }
      }

      fallbackTranscript = fallbackTranscript.trim();

      // Use whichever method produced more content
      if (fallbackTranscript.length > transcript.length) {
        transcript = fallbackTranscript;
      }
    }

    // Final cleanup - fix spacing issues
    const cleanedTranscript = transcript
      .replace(/\s+/g, " ") // Remove extra spaces
      .replace(/(\w)\.(\w)/g, "$1. $2") // Add space after periods between words
      .replace(/ ([,.!?:;]) /g, "$1 ") // Remove space before punctuation
      .replace(/\s([,.!?:;])/g, "$1") // Remove space before punctuation (another pattern)
      .trim();

    // Ensure the transcript has substantial content
    if (cleanedTranscript.length < 10) {
      console.error("Extracted transcript is too short:", cleanedTranscript);
      throw new Error(
        "Couldn't extract meaningful transcript from VTT content. Please check the file format."
      );
    }

    return cleanedTranscript;
  } catch (error) {
    console.error("Error processing VTT:", error);
    throw new Error(`Failed to process VTT: ${(error as Error).message}`);
  }
}

/**
 * Generate a summary using Google's Gemini API
 */
async function generateWithGemini(
  prompt: string,
  apiKey: string,
  aiModel: string
): Promise<string> {
  // Using gemini-2.0-flash model
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Gemini API error: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  // Extract the text content from the response
  let summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Clean up the response
  return cleanupSummary(summary);
}

/**
 * Generate a summary using OpenAI's API (GPT-4o-mini)
 */
async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  aiModel: string
): Promise<string> {
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: aiModel,
      messages: [
        {
          role: "system",
          content:
            "You are an expert meeting summarizer that provides clear, professional summaries with accurate timestamps.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `OpenAI API error: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  // Extract the text content from the response
  let summary = data.choices?.[0]?.message?.content || "";

  // Clean up the response
  return cleanupSummary(summary);
}

/**
 * Generate a summary using Anthropic's API (Claude 3.7 Sonnet)
 */
async function generateWithAnthropic(
  prompt: string,
  apiKey: string,
  aiModel: string
): Promise<string> {
  const apiUrl = "https://api.anthropic.com/v1/messages";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: aiModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Anthropic API error: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  // Extract the text content from the response
  let summary = data.content?.[0]?.text || "";

  // Clean up the response
  return cleanupSummary(summary);
}

/**
 * Generate a summary using Groq's API (Meta Llama 4 Scout)
 */
async function generateWithGroq(
  prompt: string,
  apiKey: string
): Promise<string> {
  const apiUrl = "https://api.groq.com/openai/v1/chat/completions";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an expert meeting summarizer that provides clear, professional summaries with accurate timestamps.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Groq API error: ${errorData.error?.message || response.statusText}`
    );
  }

  const data = await response.json();

  // Extract the text content from the response
  let summary = data.choices?.[0]?.message?.content || "";

  // Clean up the response
  return cleanupSummary(summary);
}

/**
 * Generate a prompt for summarizing a meeting transcript
 */
function generatePrompt(transcript: string): string {
  return `
    You are an expert meeting summarizer. Please create a comprehensive, detailed, and professional summary 
    of the following meeting transcript. Your summary should be:
    
    1. Well-structured and organized with clear sections
    2. Include key points, action items, and decisions made
    3. Maintain a professional tone
    4. Highlight important deadlines or follow-ups
    5. Include a "Meeting Topics with Timestamps" section with ACCURATE timestamps extracted from the transcript
    6. Meeting Title
    
    Format your response as HTML with visually appealing styling:
    - Main heading: <h1 style="color: #0E72ED; font-size: 1.8rem; border-bottom: 2px solid #0E72ED; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">Meeting Summary</h1>
    - Section headings: <h2 style="color: #9b87f5; font-size: 1.5rem; margin-top: 1.5rem; border-bottom: 1px solid #E5DEFF; padding-bottom: 0.3rem;">Section Name</h2>
    - Subsections: <h3 style="color: #0E72ED; font-size: 1.2rem; margin-top: 1rem;">Subsection Name</h3>
    - Meeting Topics section: <h2 style="color: #9b87f5; font-size: 1.5rem; margin-top: 1.5rem; border-bottom: 1px solid #E5DEFF; padding-bottom: 0.3rem;">Meeting Topics with Timestamps</h2>
    - For each topic with timestamp: 
        <div style="margin-bottom: 1.2rem; padding: 0.6rem; background-color: #F9F8FF; border-radius: 0.3rem; border-left: 3px solid #9b87f5;">
          <span style="color: #0E72ED; font-weight: bold; font-family: monospace; background-color: #E8F4FE; padding: 0.2rem 0.4rem; border-radius: 0.2rem; margin-right: 0.5rem;">00:00:00</span>
          <span style="font-weight: 500;">Topic description</span>
        </div>
    - Paragraphs: <p style="margin-bottom: 1rem; line-height: 1.6;">Content</p>
    - Bullet points: <ul style="margin-bottom: 1rem; padding-left: 1.5rem;"><li style="margin-bottom: 0.5rem;">Point</li></ul>
    - Important notes: <div style="background-color: #E5DEFF; border-left: 4px solid #9b87f5; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;">Important note</div>
    - Action items: <div style="background-color: #E8F4FE; border-left: 4px solid #0E72ED; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;"><span style="font-weight: bold; color: #0E72ED;">Action Item: </span>Description</div>
    - Decisions: <div style="background-color: #E8FCEF; border-left: 4px solid #10B981; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;"><span style="font-weight: bold; color: #10B981;">Decision: </span>Description</div>
    
    IMPORTANT INSTRUCTIONS FOR TIMESTAMPS:
    1. Carefully extract REAL timestamps from the transcript. Do not make up or estimate timestamps.
    2. If the transcript includes timestamps (e.g., [00:05:30]), use these exact timestamps.
    3. Include timestamps for at least 5-8 key discussion topics to provide a helpful timeline.
    4. Present timestamps in the format HH:MM:SS or MM:SS if less than an hour.
    5. Organize topics chronologically according to when they appear in the transcript.
    6. Each timestamp entry should clearly describe the specific topic being discussed at that time.
    
    IMPORTANT: DO NOT include markdown code blocks or any triple backticks in your response. Provide clean HTML only.
    
    Always include these sections:
    1. Meeting Title
    2. Executive Summary
    3. Key Discussion Points
    4. Meeting Topics with Timestamps (with ACCURATE timestamps from the transcript)
    5. Action Items
    6. Decisions Made
    7. Follow-ups and Next Steps
    
    Here's the transcript to summarize:
    
    ${transcript}
  `;
}

/**
 * Clean up the summary to remove markdown code blocks and other unwanted formatting
 */
function cleanupSummary(summary: string): string {
  // Remove markdown code block indicators if present
  let cleaned = summary.replace(/```html/g, "").replace(/```/g, "");

  // Remove extraneous whitespace
  cleaned = cleaned.trim();

  // If the summary starts with any common markdown indicators, remove them
  cleaned = cleaned.replace(/^<html>|^<body>/i, "");

  return cleaned;
}
