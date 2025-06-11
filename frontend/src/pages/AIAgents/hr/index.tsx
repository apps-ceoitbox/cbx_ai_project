// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "sonner";
// import html2pdf from "html2pdf.js";
// // Import history service for saving profiles
// import { saveCompanyProfileHistory } from "@/services/history.service";

// // Function to convert markdown tables to HTML tables
// function convertTablesToHtml(markdown: string) {
//   // Find table sections - look for consecutive lines starting with |
//   const lines = markdown.split('\n');
//   let inTable = false;
//   let tableLines: string[] = [];
//   let processedMarkdown = '';

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i];

//     if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
//       // This line is part of a table
//       if (!inTable) {
//         inTable = true;
//         tableLines = [];
//       }
//       tableLines.push(line);
//     } else {
//       // This line is not part of a table
//       if (inTable) {
//         // We just exited a table, process it
//         if (tableLines.length > 0) {
//           const tableHtml = renderTableHtml(tableLines);
//           processedMarkdown += tableHtml + '\n';
//         }
//         inTable = false;
//         tableLines = [];
//       }
//       processedMarkdown += line + '\n';
//     }
//   }

//   // Check if we ended while still in a table
//   if (inTable && tableLines.length > 0) {
//     const tableHtml = renderTableHtml(tableLines);
//     processedMarkdown += tableHtml;
//   }

//   return processedMarkdown;
// }

// function renderTableHtml(tableLines: string[]) {
//   if (tableLines.length === 0) return '';

//   // Process the table lines into an HTML table
//   const rows = tableLines.map(line => {
//     // Remove outer pipes and split by pipe
//     const cells = line
//       .trim()
//       .replace(/^\|(.*)\|$/, '$1')
//       .split('|')
//       .map(cell => cell.trim());

//     return cells;
//   });

//   // Determine if second row is a separator row
//   let hasHeader = false;
//   if (tableLines.length > 1) {
//     const secondRowCells = tableLines[1].split('|').map(cell => cell.trim());
//     hasHeader = secondRowCells.some(cell => cell.includes('-')) || 
//                tableLines[1].includes('-----');
//   }

//   // Generate HTML for the table
//   let tableHtml = `
//     <div class="overflow-x-auto my-4">
//       <table class="min-w-full bg-white border border-gray-200 rounded-lg">
//   `;

//   // If there's a header row and a separator row, use thead
//   let startRow = 0;
//   if (hasHeader) {
//     tableHtml += `
//       <thead>
//         <tr>
//     `;

//     rows[0].forEach(cell => {
//       tableHtml += `<th class="py-2 px-4 font-semibold text-left border-b-2 border-gray-300 bg-gray-50">${cell}</th>`;
//     });

//     tableHtml += `
//         </tr>
//       </thead>
//     `;

//     startRow = 2; // Skip header and separator rows
//   }

//   // Add table body
//   tableHtml += `<tbody>`;

//   for (let i = startRow; i < rows.length; i++) {
//     tableHtml += `<tr class="hover:bg-gray-50">`;

//     rows[i].forEach(cell => {
//       // Check if cell contains a citation link [n] and preserve it
//       cell = cell.replace(/\[(\d+)\]/g, 
//         (_, num) => `<a href="#source-${num}" class="text-red-600 hover:underline"><sup>[${num}]</sup></a>`);

//       tableHtml += `<td class="py-2 px-4 border-b border-gray-200">${cell}</td>`;
//     });

//     tableHtml += `</tr>`;
//   }

//   tableHtml += `
//       </tbody>
//     </table>
//   </div>
//   `;

//   return tableHtml;
// }

// // Custom markdown renderer function for simple rendering
// function renderMarkdown(markdown: string) {
//   // Process headings
//   let html = markdown
//     .replace(/^### (.*)$/gm, '<h3 class="text-xl font-semibold text-gray-800 mb-2">$1</h3>')
//     .replace(/^## (.*)$/gm, '<h2 class="text-2xl font-bold text-red-700 mb-4">$1</h2>')
//     .replace(/^# (.*)$/gm, '<h1 class="text-3xl font-bold text-red-700 mb-4">$1</h1>');

//   // Process bold and italic
//   html = html
//     .replace(/\*\*([^*]+)\*\*/g, '<span class="font-bold">$1</span>')
//     .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>');

//   // Process regular markdown links - fix to ensure they work correctly
//   html = html.replace(/\[([^\]\d][^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
//     // Ensure URL is absolute (starts with http/https)
//     const fixedUrl = url.startsWith('http') ? url : `https://${url}`;
//     return `<a href="${fixedUrl}" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:underline">${text}</a>`;
//   });

//   // Process links with number labels - ensure they're proper external links with superscript formatting
//   html = html.replace(/\[(\d+)\]\(([^)]+)\)/g, (_, num, url) => {
//     // Ensure URL is absolute (starts with http/https)
//     const fixedUrl = url.startsWith('http') ? url : `https://${url}`;
//     return `<a href="${fixedUrl}" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:underline"><sup>[${num}]</sup></a>`;
//   });

//   // Process tables
//   html = convertTablesToHtml(html);

//   // Process lists
//   html = html
//     .replace(/^- (.*)$/gm, '<li class="ml-5 list-disc">$1</li>')
//     .replace(/^\d+\. (.*)$/gm, '<li class="ml-5 list-decimal">$1</li>');

//   // Wrap adjacent list items in ul/ol tags
//   html = html.replace(/(<li[^>]*>.*<\/li>\n)+/g, (match) => {
//     return `<ul class="list-disc pl-5 space-y-1 mb-4">${match}</ul>`;
//   });

//   // Process horizontal rules
//   html = html.replace(/^---+$/gm, '<hr class="my-4 border-t border-gray-200">');

//   // Process paragraphs (lines that don't match other patterns)
//   html = html.replace(/^(?!<[h|u|o|t]|<li|<hr|<a|<div|<table)(.+)$/gm, '<p class="mb-2">$1</p>');

//   // Process sections
//   const sections = html.split('<hr class="my-4 border-t border-gray-200">');
//   return sections.map(section => `<div class="mb-6">${section}</div>`).join('');
// }

// // Function to render Perplexity sources if present in the API response
// function renderSources(data: any, outputContent: string): { enhancedContent: string; sourcesHtml: string; } {
//   // Look for citation patterns in the text like [1], [2], etc.
//   const citationMatches = outputContent.match(/\[(\d+)\]/g);

//   // If we have citations in the text, let's extract them and create sources
//   if (citationMatches && citationMatches.length > 0) {
//     console.log("Found citation numbers in text:", citationMatches);
//     // Remove duplicates and sort citation numbers
//     const citationNumbers = Array.from(new Set(
//       citationMatches.map(match => parseInt(match.replace(/[\[\]]/g, '')))
//     )).sort((a, b) => a - b);

//     // Check if API provided citations data
//     let sourcesFromApi: Array<{title: string, url: string}> = [];

//     // Check multiple possible citation locations
//     if (data.citations && Array.isArray(data.citations)) {
//       // Top-level citations
//       sourcesFromApi = data.citations.map((citation: any) => {
//         if (typeof citation === 'string') {
//           return { title: citation, url: '#' };
//         } else {
//           return {
//             title: citation.title || citation.name || citation.source || 'Source',
//             url: citation.url || citation.link || '#'
//           };
//         }
//       });
//       console.log("Using top-level citations:", sourcesFromApi);
//     } else if (data.choices?.[0]?.message?.citations) {
//       // Standard location in message
//       sourcesFromApi = data.choices[0].message.citations.map((citation: any) => {
//         if (typeof citation === 'string') {
//           return { title: citation, url: '#' };
//         } else {
//           return {
//             title: citation.title || citation.name || citation.source || 'Source',
//             url: citation.url || citation.link || '#'
//           };
//         }
//       });
//       console.log("Using message citations:", sourcesFromApi);
//     } else if (data.choices?.[0]?.citations) {
//       // Alternative location directly in choices
//       sourcesFromApi = data.choices[0].citations.map((citation: any) => {
//         if (typeof citation === 'string') {
//           return { title: citation, url: '#' };
//         } else {
//           return {
//             title: citation.title || citation.name || citation.source || 'Source',
//             url: citation.url || citation.link || '#'
//           };
//         }
//       });
//       console.log("Using choice-level citations:", sourcesFromApi);
//     }

//     // Always create sources for citation numbers in text
//     // This ensures we have sources even if the API doesn't provide them in the expected format
//     let sources = [];

//     if (sourcesFromApi.length > 0) {
//       // Use API sources but make sure we have enough for all citation numbers
//       sources = [...sourcesFromApi];

//       // If we have more citation numbers than sources, add placeholders
//       if (citationNumbers.length > sourcesFromApi.length) {
//         for (let i = sourcesFromApi.length; i < citationNumbers.length; i++) {
//           sources.push({
//             title: `Reference ${citationNumbers[i]}`,
//             url: '#'
//           });
//         }
//       }
//     } else {
//       // Create placeholder sources for each citation number
//       sources = citationNumbers.map(num => ({
//         title: `Reference ${num}`,
//         url: '#'
//       }));
//     }

//     console.log("Final sources to display:", sources);

//     // Generate the sources HTML
//     let sourcesHtml = `
//       <div class="sources-section mt-6 pt-4 border-t border-gray-200">
//         <h3 class="text-xl font-semibold text-red-700 mb-3">Sources</h3>
//         <ul class="list-none pl-5 space-y-2" style="cursor: pointer;">
//     `;

//     citationNumbers.forEach((num, index) => {
//       // Only include sources that match our citation numbers
//       if (index < sources.length) {
//         const source = sources[index];

//         // Check if URL is valid
//         const isValidUrl = source.url && source.url !== '#' && source.url.startsWith('http');

//         // If it's a valid URL, make it clickable directly, otherwise just display the text
//         if (isValidUrl) {
//           // Ensure URL is properly formatted
//           const cleanUrl = source.url.trim();
//           sourcesHtml += `
//             <li class="citation-item" id="source-${num}">
//               <div class="flex items-start">
//                 <span class="mr-2 text-red-600">[${num}]</span>
//                 <a 
//                   href="${cleanUrl}" 
//                   target="_blank" 
//                   rel="noopener noreferrer" 
//                   class="text-red-600 hover:underline"
//                   onclick="window.open('${cleanUrl}', '_blank')"
//                 >
//                   ${source.title}
//                 </a>
//               </div>
//             </li>
//           `;
//         } else {
//           // If it's not a valid URL, don't make it a link
//           sourcesHtml += `
//             <li class="citation-item" id="source-${num}">
//               <div class="text-gray-700 flex items-start">
//                 <span class="mr-2">[${num}]</span>
//                 <span>${source.title}</span>
//               </div>
//             </li>
//           `;
//         }
//       }
//     });

//     sourcesHtml += `
//         </ul>
//       </div>
//     `;

//     // Directly make citation numbers in the text into external links where possible
//     let enhancedContent = outputContent;
//     citationNumbers.forEach((num, index) => {
//       if (index < sources.length) {
//         // Check if URL is valid
//         const isValidUrl = sources[index].url && sources[index].url !== '#' && sources[index].url.startsWith('http');

//         if (isValidUrl) {
//           // If we have a valid URL, make it a direct external link with superscript
//           // Ensure URL is properly formatted
//           const cleanUrl = sources[index].url.trim();
//           enhancedContent = enhancedContent.replace(
//             new RegExp(`\\[${num}\\]`, 'g'),
//             `<a 
//               href="${cleanUrl}" 
//               target="_blank" 
//               rel="noopener noreferrer" 
//               class="text-red-600 hover:underline"
//               onclick="window.open('${cleanUrl}', '_blank')"
//             ><sup>[${num}]</sup></a>`
//           );
//         } else {
//           // Otherwise make it a link to the source section
//           enhancedContent = enhancedContent.replace(
//             new RegExp(`\\[${num}\\]`, 'g'),
//             `<a href="#source-${num}" class="text-red-600 hover:underline"><sup>[${num}]</sup></a>`
//           );
//         }
//       }
//     });

//     // Return both the enhanced content and sources section
//     return {
//       enhancedContent,
//       sourcesHtml
//     };
//   }

//   // Check for API provided citations even if no citation numbers were found
//   if (data.choices && 
//       data.choices[0] && 
//       data.choices[0].message && 
//       data.choices[0].message.citations && 
//       data.choices[0].message.citations.length > 0) {

//     const citations = data.choices[0].message.citations;

//     let sourcesHtml = `
//       <div class="sources-section mt-6 pt-4 border-t border-gray-200">
//         <h3 class="text-xl font-semibold text-red-700 mb-3">Sources</h3>
//         <ul class="list-none pl-5 space-y-2">
//     `;

//     citations.forEach((citation: any, index: number) => {
//       const title = citation.title || 'Source';
//       const url = citation.url || '#';
//       const isValidUrl = url && url !== '#' && url.startsWith('http');

//       if (isValidUrl) {
//         // Ensure URL is properly formatted
//         const cleanUrl = url.trim();
//         sourcesHtml += `
//           <li class="citation-item" id="source-${index + 1}">
//             <div class="flex items-start">
//               <span class="mr-2 text-red-600">[${index + 1}]</span>
//               <a 
//                 href="${cleanUrl}" 
//                 target="_blank" 
//                 rel="noopener noreferrer" 
//                 class="text-red-600 hover:underline"
//                 onclick="window.open('${cleanUrl}', '_blank')"
//               >
//                 ${title}
//               </a>
//             </div>
//           </li>
//         `;
//       } else {
//         sourcesHtml += `
//           <li class="citation-item" id="source-${index + 1}">
//             <div class="text-gray-700 flex items-start">
//               <span class="mr-2">[${index + 1}]</span>
//               <span>${title}</span>
//             </div>
//           </li>
//         `;
//       }
//     });

//     sourcesHtml += `
//         </ul>
//       </div>
//     `;

//     return {
//       enhancedContent: outputContent,
//       sourcesHtml
//     };
//   }

//   // If no citations found at all
//   return {
//     enhancedContent: outputContent,
//     sourcesHtml: ''
//   };
// }

// const CompanyProfileAI = () => {

//   // UI state
//   const [activeTab, setActiveTab] = useState<string>("paste");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showResult, setShowResult] = useState<boolean>(false);
//   const [processingStep, setProcessingStep] = useState<string>("");

//   // Input values
//   const [emailContent, setEmailContent] = useState<string>("");
//   const [perplexityApiKey, setPerplexityApiKey] = useState<string>(() => {
//     return localStorage.getItem('perplexity_api_key') || "";
//   });

//   // Output values
//   const [profileHtml, setProfileHtml] = useState<string>("");
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [editableProfile, setEditableProfile] = useState<string>("");


//   // Show processing step updates
//   const updateProcessingStep = (step: string) => {
//     console.log("Processing step:", step);
//     setProcessingStep(step);
//   };

//   // Helper function to extract potential company names from email for fallback mode
//   const extractCompanyNamesFromEmail = (text: string): string[] => {
//     // Simple extraction based on capitalized words
//     const words = text.split(/\s+/);
//     const potentialCompanies = new Set<string>();

//     // Look for capitalized words that might be company names
//     for (let i = 0; i < words.length; i++) {
//       const word = words[i].trim();
//       // Check if word starts with capital letter and isn't at beginning of sentence
//       if (/^[A-Z][a-zA-Z]*$/.test(word) && i > 0 && !words[i-1].endsWith('.')) {
//         // Look for multi-word company names
//         let companyName = word;
//         let j = i + 1;
//         while (j < words.length && /^[A-Z][a-zA-Z]*$/.test(words[j])) {
//           companyName += ` ${words[j]}`;
//           j++;
//         }
//         potentialCompanies.add(companyName);
//       }

//       // Check for Inc., Corp., LLC, etc.
//       if (/^(Inc\.|Corp\.|LLC|Ltd\.|Limited|Company)$/.test(word) && i > 0) {
//         const prevWord = words[i-1].replace(/,$/, '');
//         potentialCompanies.add(prevWord + ' ' + word);
//       }
//     }

//     return Array.from(potentialCompanies);
//   };

//   // Generate a fallback response when API fails
//   const createFallbackResponse = (companyNames: string[]): string => {
//     // Create a fallback response with placeholder data
//     const company = companyNames[0] || "Company";

//     // Create a fallback HTML response
//     return `
//       <div class="company-profile">
//         <h2 class="text-2xl font-bold text-red-700 mb-4">${company}</h2>

//         <div class="mb-6">
//           <h3 class="text-xl font-semibold text-gray-800 mb-2">Company Overview</h3>
//           <p>Based on the email content, we detected references to ${company}. However, we couldn't connect to our research database at this time.</p>
//           <p class="mt-2">To get detailed company information, please try again later or check the following sources manually:</p>
//         </div>

//         <div class="mb-6">
//           <h3 class="text-xl font-semibold text-gray-800 mb-2">Suggested Research Sources</h3>
//           <ul class="list-disc pl-5 space-y-1 text-blue-600">
//             <li><a href="https://www.linkedin.com/company/" target="_blank" rel="noopener noreferrer">LinkedIn Company Page</a></li>
//             <li><a href="https://www.crunchbase.com/" target="_blank" rel="noopener noreferrer">Crunchbase</a></li>
//             <li><a href="https://www.bloomberg.com/" target="_blank" rel="noopener noreferrer">Bloomberg</a></li>
//             <li><a href="https://www.google.com/search?q=${encodeURIComponent(company)}" target="_blank" rel="noopener noreferrer">Google Search</a></li>
//           </ul>
//         </div>
//       </div>
//     `;
//   };

//   // Generate company profile using Perplexity API
//   const generateCompanyProfile = async () => {
//     if (!emailContent.trim()) {
//       setError("Please enter email content to analyze.");
//       return;
//     }

//     // Get API key from localStorage
//     const apiKey = localStorage.getItem('perplexity_api_key');
//     if (!apiKey || !apiKey.trim()) {
//       setError("Please set your Perplexity API key in the AI Agent Settings page.");
//       return;
//     }

//     // Update the state with the API key from localStorage
//     setPerplexityApiKey(apiKey);

//     setError(null);
//     setIsLoading(true);
//     setShowResult(false);
//     updateProcessingStep("Extracting company information from email...");

//     try {
//       // No need to save API key here as it's managed in AI Agent Settings

//       // The system prompt for Perplexity API
//       const systemPrompt = `You are an AI researcher specialized in extracting company information from emails and conducting thorough research. Present your findings as a comprehensive company profile in markdown format with clear, structured sections.

// Your profile should include:
// - Company name as a main heading (##)
// - Contact information (emails, phone numbers found in the text)
// - Company overview (industry, size, founding information if available)
// - Areas of interest or engagement
// - Key financial data and metrics (if available)
// - Key details extracted from the email
// - Competitive landscape
// - Notes and observations
// - Next steps or recommendations

// Format your response with proper markdown elements:
// - Use ## for main headings and ### for subheadings
// - Use bullet points (- ) for lists
// - Use bold (**text**) for important information
// - Use horizontal rules (---) to separate major sections
// - Use tables for structured data like financial metrics, product comparisons, or industry statistics

// For tables, use standard markdown table format like this:
// | Header 1 | Header 2 | Header 3 |
// | -------- | -------- | -------- |
// | Data 1   | Data 2   | Data 3   |
// | More 1   | More 2   | More 3   |

// Ensure your profile is detailed, accurate, and professionally structured with a good mix of text and tabular data where appropriate.`;

//       // Make API call to Perplexity
//       updateProcessingStep("Connecting to Perplexity API...");

//       try {
//         // Define the request to Perplexity API
//         const perplexityRequest = {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${perplexityApiKey}`
//           },
//           body: JSON.stringify({
//             model: "sonar-pro", // Using Perplexity's professional-grade model for comprehensive research
//             messages: [
//               {
//                 role: "system",
//                 content: systemPrompt
//               },
//               {
//                 role: "user",
//                 content: `Extract company information from this email and create a detailed profile:\n\n${emailContent}`
//               }
//             ],
//             temperature: 0.2, // Lower temperature for more factual, focused responses
//             max_tokens: 4000  // Allow for a longer, detailed response
//           })
//         };

//         // API call configuration
//         updateProcessingStep("Researching company information...");
//         const mockApiResponse = false; // Set to true for development testing, false for real API

//         if (mockApiResponse) {
//           // Simulate API response delay
//           await new Promise(resolve => setTimeout(resolve, 2000));

//           // Extract potential company names for the mock response
//           const companyNames = extractCompanyNamesFromEmail(emailContent);
//           const companyName = companyNames.length > 0 ? companyNames[0] : "Acme Corporation";

//           // Create a mock response
//           const mockResponse = `
//             <div class="company-profile">
//               <div class="flex justify-between items-center mb-5">
//                 <div class="flex items-center">
//                   <div class="flex items-baseline mr-3">
//                     <span class="text-xl font-medium text-red-600">Company</span>
//                     <span class="text-xl ml-1 text-gray-800 font-normal">Profile</span>
//                   </div>
//                   <span class="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">${companyName}</span>
//                 </div>
//               </div>

//               <div class="mb-6">
//                 <h3 class="text-xl font-semibold text-gray-800 mb-2">Company Overview</h3>
//                 <p>${companyName} is a leading provider of innovative solutions in its industry. The company focuses on delivering high-quality products and services to meet customer needs.</p>
//               </div>

//               <div class="mb-6">
//                 <h3 class="text-xl font-semibold text-gray-800 mb-2">Industry & Sector</h3>
//                 <p><span class="font-medium">Primary Industry:</span> Technology</p>
//                 <p><span class="font-medium">Sectors:</span> Software, Services</p>
//               </div>

//               <div class="mb-6">
//                 <h3 class="text-xl font-semibold text-gray-800 mb-2">Key Products & Services</h3>
//                 <ul class="list-disc pl-5 space-y-1">
//                   <li>Enterprise Software Solutions</li>
//                   <li>Cloud Services</li>
//                   <li>Consulting Services</li>
//                 </ul>
//               </div>

//               <div class="mb-6">
//                 <h3 class="text-xl font-semibold text-gray-800 mb-2">Sources</h3>
//                 <ul class="list-disc pl-5 space-y-1 text-blue-600">
//                   <li><a href="https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com" target="_blank" rel="noopener noreferrer">Company Website</a></li>
//                   <li><a href="https://www.linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '')}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
//                 </ul>
//               </div>
//             </div>
//           `;

//           setProfileHtml(mockResponse);
//           setEditableProfile(mockResponse.replace(/<[^>]*>/g, ''));
//           setShowResult(true);
//           updateProcessingStep("Company profile research complete.");
//           return;
//         }

//         // Real API call implementation
//         const response = await fetch("https://api.perplexity.ai/chat/completions", perplexityRequest);

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error("Perplexity API error response:", errorText);
//           throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
//         }

//         // Log the raw response for debugging - store full text for citation parsing
//         const responseText = await response.clone().text();
//         console.log("Perplexity API response:", responseText);

//         // Try to extract citations from response text directly if needed
//         let rawCitations = [];
//         try {
//           // Some versions of the API might include citations in a different format
//           const responseJson = JSON.parse(responseText);
//           if (responseJson.citations) {
//             rawCitations = responseJson.citations;
//           } else if (responseJson.choices?.[0]?.message?.citations) {
//             rawCitations = responseJson.choices[0].message.citations;
//           } else if (responseJson.choices?.[0]?.citations) {
//             rawCitations = responseJson.choices[0].citations;
//           }
//           console.log("Raw citations extracted:", rawCitations);
//         } catch (err) {
//           console.log("Error parsing raw citations:", err);
//         }

//         const data = await response.json();

//         // Check for citations directly at the top level
//         if (data.citations && Array.isArray(data.citations)) {
//           console.log("Top-level citations found:", data.citations);
//         }

//         if (data.choices && data.choices[0] && data.choices[0].message) {
//           const content = data.choices[0].message.content;

//           // Process response content
//           let outputContent = content;

//           // Check for and remove thinking tags if present
//           const thinkRegex = /<think>(.*?)<\/think>/s;
//           if (content.match(thinkRegex)) {
//             // Remove thinking content from the output
//             outputContent = content.replace(thinkRegex, '');
//           }

//           // Extract and process sources
//           const { enhancedContent, sourcesHtml } = renderSources(data, outputContent);

//           console.log("Final citation data - Enhanced content and sources HTML", {
//             contentLength: enhancedContent.length,
//             sourcesHtmlLength: sourcesHtml.length,
//             hasCitations: sourcesHtml.length > 0
//           });

//           // Process the enhanced content with markdown
//           const renderedMarkdown = renderMarkdown(enhancedContent);

//           // Combine the rendered markdown with sources
//           const finalHtml = `<div class="company-profile">${renderedMarkdown}${sourcesHtml}</div>`;

//           setProfileHtml(finalHtml);
//           setEditableProfile(outputContent); // Store plain content for editing
//           setShowResult(true);
//           updateProcessingStep("Company profile research complete.");

//           // Auto-save the profile to history
//           try {
//             // Extract company name from the profile content
//             const companyNameMatch = outputContent.match(/##\s*([^\n]+)/);
//             const companyName = companyNameMatch ? companyNameMatch[1].trim() : "Company Profile";

//             await saveCompanyProfileHistory({
//               companyName,
//               report: finalHtml,
//               sourcedFrom: "Perplexity API"
//             });
//             console.log('Company profile saved to history successfully');
//             toast.success('Profile saved to history');
//           } catch (saveError) {
//             console.error('Error saving profile to history:', saveError);
//             toast.error('Failed to save profile to history');
//           }
//         } else {
//           throw new Error("Invalid response format from Perplexity API");
//         }
//       } catch (apiError) {
//         console.error("API call failed:", apiError);

//         // Fall back to local processing if API fails
//         updateProcessingStep("API call failed. Using fallback mode...");

//         // Simple company name extraction for fallback
//         const companyNames = extractCompanyNamesFromEmail(emailContent);
//         const fallbackHtml = createFallbackResponse(companyNames);

//         setProfileHtml(fallbackHtml);
//         setEditableProfile(fallbackHtml.replace(/<[^>]*>/g, ''));
//         setShowResult(true);
//         updateProcessingStep("Generated basic company profile.");

//         // Auto-save the fallback profile to history
//         try {
//           const companyName = companyNames.length > 0 ? companyNames[0] : "Unknown Company";

//           await saveCompanyProfileHistory({
//             companyName,
//             report: fallbackHtml,
//             sourcedFrom: "Fallback Processing"
//           });
//           console.log('Fallback company profile saved to history successfully');
//           toast.success('Basic profile saved to history');
//         } catch (saveError) {
//           console.error('Error saving fallback profile to history:', saveError);
//           toast.error('Failed to save profile to history');
//         }
//       }
//     } catch (err: any) {
//       console.error("Error generating company profile:", err);
//       setError(`Failed to generate company profile: ${err.message || 'Unknown error'}`);
//       setIsLoading(false);
//     } finally {
//       setIsLoading(false);
//       setTimeout(() => setProcessingStep(""), 3000); // Clear processing step after 3 seconds
//     }
//   };

//   // Handle editing profile
//   const enableEditMode = () => {
//     setEditableProfile(profileHtml.replace(/<[^>]*>/g, ''));
//     setIsEditing(true);
//   };

//   const saveSummaryEdit = () => {
//     // Convert plain text back to HTML (simplified version)
//     setProfileHtml(`<div>${editableProfile.split('\n').map(line => `<p>${line}</p>`).join('')}</div>`);
//     setIsEditing(false);
//   };

//   const cancelEdit = () => {
//     setIsEditing(false);
//   };

//   // Handle copy to clipboard
//   const copyProfileToClipboard = () => {
//     // Create a div with the profile content
//     const profileDiv = document.createElement('div');
//     profileDiv.innerHTML = profileHtml;

//     // Extract text content from the HTML
//     const textContent = profileDiv.textContent || profileDiv.innerText || "";

//     // Use the clipboard API to copy the text
//     navigator.clipboard.writeText(textContent)
//       .then(() => {
//         toast.success("Company profile copied to clipboard!");
//       })
//       .catch(err => {
//         console.error("Failed to copy: ", err);
//         toast.error("Failed to copy to clipboard");
//       });
//   };

//   // Handle print functionality
//   const printProfile = () => {
//     const contentElement = document.getElementById('profile-content');

//     if (!contentElement) {
//       toast.error("Could not find profile content to print");
//       return;
//     }

//     // Create a new window for printing
//     const printWindow = window.open('', '_blank');

//     if (!printWindow) {
//       toast.error("Could not open print window. Please check your popup blocker settings.");
//       return;
//     }

//     // Extract company name from email content
//     const companyNames = extractCompanyNamesFromEmail(emailContent);
//     const companyName = companyNames.length > 0 ? companyNames[0] : "Company";

//     // Get current date in format DD/MM/YYYY
//     const today = new Date();
//     const day = String(today.getDate()).padStart(2, '0');
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const year = today.getFullYear();
//     const formattedDate = `${day}/${month}/${year}`;

//     // Create print document with styled content
//     printWindow.document.write(`
//       <!DOCTYPE html>
//       <html>
//         <head>
//           <title>Company Profile - ${companyName}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 20px; }
//             .header { 
//               display: flex; 
//               justify-content: space-between; 
//               align-items: center; 
//               margin-bottom: 20px; 
//             }
//             .header-left {
//               display: flex;
//               align-items: center;
//             }
//             .title-wrapper {
//               display: flex;
//               align-items: baseline;
//               margin-right: 12px;
//             }
//             .company-title { 
//               font-size: 18px; 
//               color: #e11d48; 
//               font-weight: 500; 
//             }
//             .profile-text {
//               font-size: 18px;
//               color: #333;
//               margin-left: 4px;
//               font-weight: normal;
//             }
//             .company-badge { 
//               background-color: #fee2e2; 
//               color: #b91c1c; 
//               font-size: 13px;
//               padding: 4px 12px;
//               border-radius: 16px;
//             }
//             .date { 
//               color: #666; 
//               font-size: 14px; 
//             }
//             .company-profile h2 { color: #dc2626; margin-bottom: 16px; }
//             .company-profile h3 { color: #1f2937; margin-top: 20px; margin-bottom: 8px; }
//             table { border-collapse: collapse; width: 100%; margin: 16px 0; }
//             th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
//             th { background-color: #f9fafb; }
//             ul { margin-top: 8px; }
//             a { color: #2563eb; text-decoration: none; }
//             @media print {
//               body { margin: 1cm; }
//             }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <div class="header-left">
//               <div class="title-wrapper">
//                 <span class="company-title">Company</span>
//                 <span class="profile-text">Profile</span>
//               </div>
//               <span class="company-badge">${companyName}</span>
//             </div>
//             <div class="date">Generated on ${formattedDate}</div>
//           </div>
//           <div class="company-profile">
//             ${contentElement.innerHTML}
//           </div>
//           <script>
//             window.onload = function() {
//               setTimeout(function() {
//                 window.print();
//               }, 250);
//             }
//           </script>
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     toast.success("Print dialog opened");
//   };
//   // Handle PDF download
//   const downloadProfileAsPdf = () => {
//     // Get the profile content element
//     const contentElement = document.getElementById('profile-content');

//     if (!contentElement) {
//       toast.error("Could not find profile content to download");
//       return;
//     }

//     toast.success("PDF download started");

//     // Create a clone of the content to style specifically for PDF
//     const contentClone = contentElement.cloneNode(true) as HTMLElement;

//     // Create a container for styling the PDF
//     const pdfContainer = document.createElement('div');
//     pdfContainer.appendChild(contentClone);

//     // Apply PDF-specific styling
//     pdfContainer.style.padding = '20px';
//     pdfContainer.style.color = '#000';
//     pdfContainer.style.backgroundColor = '#fff';

//     // Find company name for the filename
//     let filename = 'company-profile.pdf';
//     const h1Elements = contentClone.getElementsByTagName('h1');
//     const h2Elements = contentClone.getElementsByTagName('h2');

//     if (h1Elements.length > 0) {
//       filename = `${h1Elements[0].textContent?.trim().replace(/\s+/g, '-').toLowerCase() || 'company'}-profile.pdf`;
//     } else if (h2Elements.length > 0) {
//       filename = `${h2Elements[0].textContent?.trim().replace(/\s+/g, '-').toLowerCase() || 'company'}-profile.pdf`;
//     }

//     // Configure html2pdf options
//     const options = {
//       margin: [10, 10, 10, 10],
//       filename: filename,
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
//     };

//     // Generate and download PDF
//     html2pdf()
//       .set(options)
//       .from(pdfContainer)
//       .save()
//       .then(() => {
//         toast.success("Company profile PDF downloaded successfully!");
//       })
//       .catch((error: any) => {
//         console.error("PDF generation error:", error);
//         toast.error("Failed to generate PDF. Please try again.");
//       });
//   };

//   return (
//     <div className="container py-8 max-w-5xl mx-auto">
//       <Link to="/ai-agents" className="mb-6 inline-block">
//         <Button variant="outline" className="mb-6 border-red-600 text-red-600 hover:bg-red-50 transition-colors">
//           <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//           </svg>
//           Back to AI Agents
//         </Button>
//       </Link>

//       <Card className="bg-white shadow-xl border-none rounded-xl overflow-hidden">
//         <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white border-none pb-8">
//           <CardTitle className="text-4xl font-bold text-center">Company Profile AI</CardTitle>
//           <CardDescription className="text-center text-white/80 mt-2">
//             Extract detailed company information from emails or text
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="pt-6 px-8 pb-8 -mt-4">
//           <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//             <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
//               <TabsTrigger 
//                 value="paste" 
//                 className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md"
//               >
//                 Paste Email Content
//               </TabsTrigger>
//               <TabsTrigger 
//                 value="sample" 
//                 className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md"
//               >
//                 Use Sample
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="paste" className="space-y-4">
//               <div className="space-y-2">
//                 <Textarea
//                   placeholder="Paste email content here..."
//                   className="min-h-[200px] border border-gray-200 bg-red-50/30 focus:border-red-400 focus:ring-red-400 rounded-lg transition-colors"
//                   value={emailContent}
//                   onChange={(e) => setEmailContent(e.target.value)}
//                 />
//                 <p className="text-xs text-red-600/70 italic">Paste the entire email including headers, signatures, and any company references</p>
//               </div>
//             </TabsContent>

//             <TabsContent value="sample" className="space-y-4">
//               <div className="flex items-center justify-center p-6 border border-red-100 bg-red-50/50 rounded-lg">
//                 <div className="text-center">
//                   <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                   <p className="text-lg font-medium text-red-700">Sample Email</p>
//                   <p className="text-sm text-red-600/70 mb-4">Use our sample email to see how the AI extracts company information</p>
//                   <Button 
//                     onClick={() => {
//                       setEmailContent("Subject: Partnership Opportunity with Acme Corp\n\nDear John,\n\nI hope this email finds you well. My name is Sarah Johnson, and I am the Business Development Manager at Acme Corporation. I recently came across your company's innovative solutions and believe there could be significant opportunities for collaboration.\n\nAcme Corp has been a leader in software solutions for over 15 years, with headquarters in San Francisco and offices across North America and Europe. We specialize in AI-driven analytics platforms that help businesses optimize their operations and make data-driven decisions.\n\nI'd love to schedule a call to discuss how we might work together. Please let me know your availability for next week.\n\nBest regards,\n\nSarah Johnson\nBusiness Development Manager\nAcme Corporation\nsjohnson@acmecorp.com\n+1 (555) 123-4567\nwww.acmecorp.com");
//                       setActiveTab("paste");
//                     }}
//                     variant="outline"
//                     className="border-red-500 text-red-600 hover:bg-red-50"
//                   >
//                     Load Sample Email
//                   </Button>
//                 </div>
//               </div>
//             </TabsContent>
//           </Tabs>

//           <div className="mt-8">
//             <Button 
//               onClick={generateCompanyProfile}
//               disabled={isLoading || (!emailContent.trim() && activeTab === 'paste')}
//               className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-medium py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   <span className="text-lg">Researching Company...</span>
//                 </span>
//               ) : 'Research Company'}
//             </Button>

//             {isLoading && (
//               <div className="mt-8 p-6 bg-white border border-red-100 rounded-xl shadow-lg">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center">
//                     <div className="w-8 h-8 relative mr-3">
//                       <div className="absolute inset-0 bg-red-500 rounded-full opacity-25 animate-ping-slow"></div>
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                         </svg>
//                       </div>
//                     </div>
//                     <h4 className="text-red-700 font-semibold text-xl">AI Research in Progress</h4>
//                   </div>
//                   <div className="flex space-x-1.5">
//                     <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
//                     <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse delay-100"></div>
//                     <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse delay-200"></div>
//                   </div>
//                 </div>

//                 {/* Enhanced Progress Bar with gradient and animation */}
//                 <div className="relative w-full h-4 bg-red-50 rounded-full mb-6 overflow-hidden shadow-inner">
//                   <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-red-600 to-red-400 animate-gradient-x"></div>
//                   <div className="absolute inset-0 bg-red-500 h-full animate-progress-indeterminate opacity-70"></div>
//                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer opacity-30"></div>
//                 </div>

//                 {/* Enhanced Current Step Indicator */}
//                 <div className="p-5 rounded-lg bg-red-50/60 border border-red-100 mb-5 shadow-sm relative overflow-hidden">
//                   <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent animate-pulse-slow opacity-50"></div>
//                   <div className="relative flex items-center">
//                     <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full mr-4 shadow-md border border-red-100">
//                       <svg className="animate-spin h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                     </div>
//                     <div>
//                       <div className="font-medium text-red-800 mb-1">Current Operation:</div>
//                       <div className="text-red-600 font-medium text-lg">{processingStep || "Gathering company data..."}</div>
//                     </div>
//                   </div>
//                 </div>



//                 <style dangerouslySetInnerHTML={{ __html: `
//                   @keyframes progress-indeterminate {
//                     0% { transform: translateX(-100%); }
//                     100% { transform: translateX(100%); }
//                   }
//                   @keyframes gradient-x {
//                     0%, 100% { background-position: 0% 50% }
//                     50% { background-position: 100% 50% }
//                   }
//                   @keyframes shimmer {
//                     0% { transform: translateX(-100%) }
//                     100% { transform: translateX(100%) }
//                   }
//                   @keyframes ping-slow {
//                     0% { transform: scale(1); opacity: 0.25; }
//                     50% { transform: scale(1.2); opacity: 0.15; }
//                     100% { transform: scale(1); opacity: 0.25; }
//                   }
//                   @keyframes pulse-slow {
//                     0%, 100% { opacity: 0.3; }
//                     50% { opacity: 0.1; }
//                   }
//                   .animate-progress-indeterminate {
//                     animation: progress-indeterminate 1.5s infinite cubic-bezier(0.65, 0.05, 0.36, 1);
//                   }
//                   .animate-gradient-x {
//                     animation: gradient-x 3s ease infinite;
//                     background-size: 200% 200%;
//                   }
//                   .animate-shimmer {
//                     animation: shimmer 2s infinite;
//                   }
//                   .animate-ping-slow {
//                     animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
//                   }
//                   .animate-pulse-slow {
//                     animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//                   }
//                   .delay-100 {
//                     animation-delay: 0.1s;
//                   }
//                   .delay-200 {
//                     animation-delay: 0.2s;
//                   }
//                 ` }} />
//               </div>
//             )}

//             {error && (
//               <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
//                 <div className="flex items-center">
//                   <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <span className="text-red-700 font-medium">{error}</span>
//                 </div>
//               </div>
//             )}
//           </div>

//           {showResult && (
//             <div className="mt-8 bg-white border border-red-100 rounded-xl p-6 shadow-lg">
//               <div className="flex justify-between items-center mb-6 pb-4 border-b border-red-100">
//                 <h3 className="text-2xl font-bold text-red-700 flex items-center">
//                   <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                   </svg>
//                   Company Profile
//                 </h3>
//                 <div className="flex gap-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={enableEditMode}
//                     disabled={isEditing}
//                     className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 flex items-center shadow-sm transition-all"
//                   >
//                     <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                     </svg>
//                     Edit
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={copyProfileToClipboard}
//                     className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 flex items-center shadow-sm transition-all"
//                   >
//                     <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
//                     </svg>
//                     Copy
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={printProfile}
//                     className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 flex items-center shadow-sm transition-all"
//                   >
//                     <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//                     </svg>
//                     Print
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={downloadProfileAsPdf}
//                     className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 flex items-center shadow-sm transition-all"
//                   >
//                     <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     PDF
//                   </Button>
//                 </div>
//               </div>

//               {isEditing ? (
//                 <div className="space-y-4">
//                   <Textarea 
//                     value={editableProfile}
//                     onChange={(e) => setEditableProfile(e.target.value)}
//                     className="min-h-[400px] font-mono text-sm bg-red-50/30 border-red-100 focus:border-red-400 focus:ring-red-400 rounded-lg shadow-inner"
//                   />
//                   <div className="flex gap-3 justify-end">
//                     <Button 
//                       variant="outline" 
//                       onClick={cancelEdit} 
//                       className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-sm transition-all"
//                     >
//                       Cancel
//                     </Button>
//                     <Button 
//                       onClick={saveSummaryEdit} 
//                       className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all"
//                     >
//                       Save Changes
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="bg-white rounded-lg shadow-sm border border-red-50 p-6">
//                   <div 
//                     id="profile-content"
//                     className="prose max-w-none prose-headings:text-red-700 prose-a:text-red-600 prose-strong:text-red-700" 
//                     dangerouslySetInnerHTML={{ __html: profileHtml }}
//                   />
//                 </div>
//               )}


//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default CompanyProfileAI;




import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
// Import history service for saving profiles
import { saveCompanyProfileHistory } from "@/services/history.service";
import { useAxios } from "@/context/AppContext";
import { ArrowLeft, Copy, Download, Printer } from "lucide-react";

// Function to convert markdown tables to HTML tables
function convertTablesToHtml(markdown: string) {
  // Find table sections - look for consecutive lines starting with |
  const lines = markdown.split('\n');
  let inTable = false;
  let tableLines: string[] = [];
  let processedMarkdown = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // This line is part of a table
      if (!inTable) {
        inTable = true;
        tableLines = [];
      }
      tableLines.push(line);
    } else {
      // This line is not part of a table
      if (inTable) {
        // We just exited a table, process it
        if (tableLines.length > 0) {
          const tableHtml = renderTableHtml(tableLines);
          processedMarkdown += tableHtml + '\n';
        }
        inTable = false;
        tableLines = [];
      }
      processedMarkdown += line + '\n';
    }
  }

  // Check if we ended while still in a table
  if (inTable && tableLines.length > 0) {
    const tableHtml = renderTableHtml(tableLines);
    processedMarkdown += tableHtml;
  }

  return processedMarkdown;
}

function renderTableHtml(tableLines: string[]) {
  if (tableLines.length === 0) return '';

  // Process the table lines into an HTML table
  const rows = tableLines.map(line => {
    // Remove outer pipes and split by pipe
    const cells = line
      .trim()
      .replace(/^\|(.*)\|$/, '$1')
      .split('|')
      .map(cell => cell.trim());

    return cells;
  });

  // Determine if second row is a separator row
  let hasHeader = false;
  if (tableLines.length > 1) {
    const secondRowCells = tableLines[1].split('|').map(cell => cell.trim());
    hasHeader = secondRowCells.some(cell => cell.includes('-')) ||
      tableLines[1].includes('-----');
  }

  // Generate HTML for the table
  let tableHtml = `
    <div class="overflow-x-auto my-4">
      <table class="min-w-full bg-white border border-gray-200 rounded-lg">
  `;

  // If there's a header row and a separator row, use thead
  let startRow = 0;
  if (hasHeader) {
    tableHtml += `
      <thead>
        <tr>
    `;

    rows[0].forEach(cell => {
      tableHtml += `<th class="py-2 px-4 font-semibold text-left border-b-2 border-gray-300 bg-gray-50">${cell}</th>`;
    });

    tableHtml += `
        </tr>
      </thead>
    `;

    startRow = 2; // Skip header and separator rows
  }

  // Add table body
  tableHtml += `<tbody>`;

  for (let i = startRow; i < rows.length; i++) {
    tableHtml += `<tr class="hover:bg-gray-50">`;

    rows[i].forEach(cell => {
      // Check if cell contains a citation link [n] and preserve it
      cell = cell.replace(/\[(\d+)\]/g,
        (_, num) => `<a href="#source-${num}" class="text-red-600 hover:underline"><sup>[${num}]</sup></a>`);

      tableHtml += `<td class="py-2 px-4 border-b border-gray-200">${cell}</td>`;
    });

    tableHtml += `</tr>`;
  }

  tableHtml += `
      </tbody>
    </table>
  </div>
  `;

  return tableHtml;
}

// Custom markdown renderer function for simple rendering
function renderMarkdown(markdown: string) {
  // Process headings
  let html = markdown
    .replace(/^### (.*)$/gm, '<h3 class="text-xl font-semibold text-gray-800 mb-2">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 class="text-2xl font-bold text-red-700 mb-4">$1</h2>')
    .replace(/^# (.*)$/gm, '<h1 class="text-3xl font-bold text-red-700 mb-4">$1</h1>');

  // Process bold and italic
  html = html
    .replace(/\*\*([^*]+)\*\*/g, '<span class="font-bold">$1</span>')
    .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>');

  // Process regular markdown links - fix to ensure they work correctly
  html = html.replace(/\[([^\]\d][^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    // Ensure URL is absolute (starts with http/https)
    const fixedUrl = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${fixedUrl}" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:underline">${text}</a>`;
  });

  // Process links with number labels - ensure they're proper external links with superscript formatting
  html = html.replace(/\[(\d+)\]\(([^)]+)\)/g, (_, num, url) => {
    // Ensure URL is absolute (starts with http/https)
    const fixedUrl = url.startsWith('http') ? url : `https://${url}`;
    return `<a href="${fixedUrl}" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:underline"><sup>[${num}]</sup></a>`;
  });

  // Process tables
  html = convertTablesToHtml(html);

  // Process lists
  html = html
    .replace(/^- (.*)$/gm, '<li class="ml-5 list-disc">$1</li>')
    .replace(/^\d+\. (.*)$/gm, '<li class="ml-5 list-decimal">$1</li>');

  // Wrap adjacent list items in ul/ol tags
  html = html.replace(/(<li[^>]*>.*<\/li>\n)+/g, (match) => {
    return `<ul class="list-disc pl-5 space-y-1 mb-4">${match}</ul>`;
  });

  // Process horizontal rules
  html = html.replace(/^---+$/gm, '<hr class="my-4 border-t border-gray-200">');

  // Process paragraphs (lines that don't match other patterns)
  html = html.replace(/^(?!<[h|u|o|t]|<li|<hr|<a|<div|<table)(.+)$/gm, '<p class="mb-2">$1</p>');

  // Process sections
  const sections = html.split('<hr class="my-4 border-t border-gray-200">');
  return sections.map(section => `<div class="mb-6">${section}</div>`).join('');
}

// Function to render Perplexity sources if present in the API response
function renderSources(data: any, outputContent: string): { enhancedContent: string; sourcesHtml: string; } {
  // Look for citation patterns in the text like [1], [2], etc.
  const citationMatches = outputContent.match(/\[(\d+)\]/g);

  // If we have citations in the text, let's extract them and create sources
  if (citationMatches && citationMatches.length > 0) {
    console.log("Found citation numbers in text:", citationMatches);
    // Remove duplicates and sort citation numbers
    const citationNumbers = Array.from(new Set(
      citationMatches.map(match => parseInt(match.replace(/[\[\]]/g, '')))
    )).sort((a, b) => a - b);

    // Check if API provided citations data
    let sourcesFromApi: Array<{ title: string, url: string }> = [];

    // Check multiple possible citation locations
    if (data.citations && Array.isArray(data.citations)) {
      // Top-level citations
      sourcesFromApi = data.citations.map((citation: any) => {
        if (typeof citation === 'string') {
          return { title: citation, url: '#' };
        } else {
          return {
            title: citation.title || citation.name || citation.source || 'Source',
            url: citation.url || citation.link || '#'
          };
        }
      });
      console.log("Using top-level citations:", sourcesFromApi);
    } else if (data.choices?.[0]?.message?.citations) {
      // Standard location in message
      sourcesFromApi = data.choices[0].message.citations.map((citation: any) => {
        if (typeof citation === 'string') {
          return { title: citation, url: '#' };
        } else {
          return {
            title: citation.title || citation.name || citation.source || 'Source',
            url: citation.url || citation.link || '#'
          };
        }
      });
      console.log("Using message citations:", sourcesFromApi);
    } else if (data.choices?.[0]?.citations) {
      // Alternative location directly in choices
      sourcesFromApi = data.choices[0].citations.map((citation: any) => {
        if (typeof citation === 'string') {
          return { title: citation, url: '#' };
        } else {
          return {
            title: citation.title || citation.name || citation.source || 'Source',
            url: citation.url || citation.link || '#'
          };
        }
      });
      console.log("Using choice-level citations:", sourcesFromApi);
    }

    // Always create sources for citation numbers in text
    // This ensures we have sources even if the API doesn't provide them in the expected format
    let sources = [];

    if (sourcesFromApi.length > 0) {
      // Use API sources but make sure we have enough for all citation numbers
      sources = [...sourcesFromApi];

      // If we have more citation numbers than sources, add placeholders
      if (citationNumbers.length > sourcesFromApi.length) {
        for (let i = sourcesFromApi.length; i < citationNumbers.length; i++) {
          sources.push({
            title: `Reference ${citationNumbers[i]}`,
            url: '#'
          });
        }
      }
    } else {
      // Create placeholder sources for each citation number
      sources = citationNumbers.map(num => ({
        title: `Reference ${num}`,
        url: '#'
      }));
    }

    console.log("Final sources to display:", sources);

    // Generate the sources HTML
    let sourcesHtml = `
      <div class="sources-section mt-6 pt-4 border-t border-gray-200">
        <h3 class="text-xl font-semibold text-red-700 mb-3">Sources</h3>
        <ul class="list-none pl-5 space-y-2" style="cursor: pointer;">
    `;

    citationNumbers.forEach((num, index) => {
      // Only include sources that match our citation numbers
      if (index < sources.length) {
        const source = sources[index];

        // Check if URL is valid
        const isValidUrl = source.url && source.url !== '#' && source.url.startsWith('http');

        // If it's a valid URL, make it clickable directly, otherwise just display the text
        if (isValidUrl) {
          // Ensure URL is properly formatted
          const cleanUrl = source.url.trim();
          sourcesHtml += `
            <li class="citation-item" id="source-${num}">
              <div class="flex items-start">
                <span class="mr-2 text-red-600">[${num}]</span>
                <a 
                  href="${cleanUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="text-red-600 hover:underline"
                  onclick="window.open('${cleanUrl}', '_blank')"
                >
                  ${source.title}
                </a>
              </div>
            </li>
          `;
        } else {
          // If it's not a valid URL, don't make it a link
          sourcesHtml += `
            <li class="citation-item" id="source-${num}">
              <div class="text-gray-700 flex items-start">
                <span class="mr-2">[${num}]</span>
                <span>${source.title}</span>
              </div>
            </li>
          `;
        }
      }
    });

    sourcesHtml += `
        </ul>
      </div>
    `;

    // Directly make citation numbers in the text into external links where possible
    let enhancedContent = outputContent;
    citationNumbers.forEach((num, index) => {
      if (index < sources.length) {
        // Check if URL is valid
        const isValidUrl = sources[index].url && sources[index].url !== '#' && sources[index].url.startsWith('http');

        if (isValidUrl) {
          // If we have a valid URL, make it a direct external link with superscript
          // Ensure URL is properly formatted
          const cleanUrl = sources[index].url.trim();
          enhancedContent = enhancedContent.replace(
            new RegExp(`\\[${num}\\]`, 'g'),
            `<a 
              href="${cleanUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-red-600 hover:underline"
              onclick="window.open('${cleanUrl}', '_blank')"
            ><sup>[${num}]</sup></a>`
          );
        } else {
          // Otherwise make it a link to the source section
          enhancedContent = enhancedContent.replace(
            new RegExp(`\\[${num}\\]`, 'g'),
            `<a href="#source-${num}" class="text-red-600 hover:underline"><sup>[${num}]</sup></a>`
          );
        }
      }
    });

    // Return both the enhanced content and sources section
    return {
      enhancedContent,
      sourcesHtml
    };
  }

  // Check for API provided citations even if no citation numbers were found
  if (data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.citations &&
    data.choices[0].message.citations.length > 0) {

    const citations = data.choices[0].message.citations;

    let sourcesHtml = `
      <div class="sources-section mt-6 pt-4 border-t border-gray-200">
        <h3 class="text-xl font-semibold text-red-700 mb-3">Sources</h3>
        <ul class="list-none pl-5 space-y-2">
    `;

    citations.forEach((citation: any, index: number) => {
      const title = citation.title || 'Source';
      const url = citation.url || '#';
      const isValidUrl = url && url !== '#' && url.startsWith('http');

      if (isValidUrl) {
        // Ensure URL is properly formatted
        const cleanUrl = url.trim();
        sourcesHtml += `
          <li class="citation-item" id="source-${index + 1}">
            <div class="flex items-start">
              <span class="mr-2 text-red-600">[${index + 1}]</span>
              <a 
                href="${cleanUrl}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-red-600 hover:underline"
                onclick="window.open('${cleanUrl}', '_blank')"
              >
                ${title}
              </a>
            </div>
          </li>
        `;
      } else {
        sourcesHtml += `
          <li class="citation-item" id="source-${index + 1}">
            <div class="text-gray-700 flex items-start">
              <span class="mr-2">[${index + 1}]</span>
              <span>${title}</span>
            </div>
          </li>
        `;
      }
    });

    sourcesHtml += `
        </ul>
      </div>
    `;

    return {
      enhancedContent: outputContent,
      sourcesHtml
    };
  }

  // If no citations found at all
  return {
    enhancedContent: outputContent,
    sourcesHtml: ''
  };
}

const CompanyProfileAI = () => {
  const axios = useAxios("user");

  // UI state
  const [activeTab, setActiveTab] = useState<string>("paste");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  // Input values
  const [emailContent, setEmailContent] = useState<string>("");
  const [perplexityApiKey, setPerplexityApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Fetch API settings from backend
  useEffect(() => {
    axios.get("/aiagentsettings").then((res) => {
      const settings = res?.data?.data;
      if (!Array.isArray(settings)) return;

      const companyProfileSetting = settings?.find(item => item.name === "CompanyProfile");
      if (!companyProfileSetting) {
        // Fallback to localStorage if setting not found
        const apiKey = localStorage.getItem('perplexity_api_key');
        if (apiKey) setPerplexityApiKey(apiKey);
        return;
      }

      setPerplexityApiKey(companyProfileSetting?.apikey);
      setSelectedModel(companyProfileSetting?.aiProvider?.model);
    }).catch(err => {
      console.error("Error fetching AI settings:", err);
      // Fallback to localStorage if API fails
      const apiKey = localStorage.getItem('perplexity_api_key');
      if (apiKey) setPerplexityApiKey(apiKey);
    });
  }, []);

  // Output values
  const [profileHtml, setProfileHtml] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableProfile, setEditableProfile] = useState<string>("");


  // Show processing step updates
  const updateProcessingStep = (step: string) => {
    console.log("Processing step:", step);
    setProcessingStep(step);
  };

  // Helper function to extract potential company names from email for fallback mode
  const extractCompanyNamesFromEmail = (text: string): string[] => {
    // Simple extraction based on capitalized words
    const words = text.split(/\s+/);
    const potentialCompanies = new Set<string>();

    // Look for capitalized words that might be company names
    for (let i = 0; i < words.length; i++) {
      const word = words[i].trim();
      // Check if word starts with capital letter and isn't at beginning of sentence
      if (/^[A-Z][a-zA-Z]*$/.test(word) && i > 0 && !words[i - 1].endsWith('.')) {
        // Look for multi-word company names
        let companyName = word;
        let j = i + 1;
        while (j < words.length && /^[A-Z][a-zA-Z]*$/.test(words[j])) {
          companyName += ` ${words[j]}`;
          j++;
        }
        potentialCompanies.add(companyName);
      }

      // Check for Inc., Corp., LLC, etc.
      if (/^(Inc\.|Corp\.|LLC|Ltd\.|Limited|Company)$/.test(word) && i > 0) {
        const prevWord = words[i - 1].replace(/,$/, '');
        potentialCompanies.add(prevWord + ' ' + word);
      }
    }

    return Array.from(potentialCompanies);
  };

  // Generate a fallback response when API fails
  const createFallbackResponse = (companyNames: string[]): string => {
    // Create a fallback response with placeholder data
    const company = companyNames[0] || "Company";

    // Create a fallback HTML response
    return `
      <div class="company-profile">
        <h2 class="text-2xl font-bold text-red-700 mb-4">${company}</h2>
        
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Company Overview</h3>
          <p>Based on the email content, we detected references to ${company}. However, we couldn't connect to our research database at this time.</p>
          <p class="mt-2">To get detailed company information, please try again later or check the following sources manually:</p>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Suggested Research Sources</h3>
          <ul class="list-disc pl-5 space-y-1 text-blue-600">
            <li><a href="https://www.linkedin.com/company/" target="_blank" rel="noopener noreferrer">LinkedIn Company Page</a></li>
            <li><a href="https://www.crunchbase.com/" target="_blank" rel="noopener noreferrer">Crunchbase</a></li>
            <li><a href="https://www.bloomberg.com/" target="_blank" rel="noopener noreferrer">Bloomberg</a></li>
            <li><a href="https://www.google.com/search?q=${encodeURIComponent(company)}" target="_blank" rel="noopener noreferrer">Google Search</a></li>
          </ul>
        </div>
      </div>
    `;
  };

  // Generate company profile using Perplexity API
  const generateCompanyProfile = async () => {
    if (!emailContent.trim()) {
      setError("Please enter email content to analyze.");
      return;
    }

    // Check if we have an API key from backend settings
    if (!perplexityApiKey || !perplexityApiKey.trim()) {
      setError("Please set your API credentials in the AI Agent Settings page.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setShowResult(false);
    updateProcessingStep("Extracting company information from email...");

    try {
      // No need to save API key here as it's managed in AI Agent Settings

      // The system prompt for Perplexity API
      const systemPrompt = `You are an AI researcher specialized in extracting company information from emails and conducting thorough research. Present your findings as a comprehensive company profile in markdown format with clear, structured sections.

Your profile should include:
- Company name as a main heading (##)
- Contact information (emails, phone numbers found in the text)
- Company overview (industry, size, founding information if available)
- Areas of interest or engagement
- Key financial data and metrics (if available)
- Key details extracted from the email
- Competitive landscape
- Notes and observations
- Next steps or recommendations

Format your response with proper markdown elements:
- Use ## for main headings and ### for subheadings
- Use bullet points (- ) for lists
- Use bold (**text**) for important information
- Use horizontal rules (---) to separate major sections
- Use tables for structured data like financial metrics, product comparisons, or industry statistics

For tables, use standard markdown table format like this:
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Data 1   | Data 2   | Data 3   |
| More 1   | More 2   | More 3   |

Ensure your profile is detailed, accurate, and professionally structured with a good mix of text and tabular data where appropriate.`;

      // Make API call to Perplexity
      updateProcessingStep("Connecting to Perplexity API...");

      try {
        // Prepare to make API call to Perplexity

        // API call configuration
        updateProcessingStep("Researching company information...");
        const mockApiResponse = false; // Set to true for development testing, false for real API

        if (mockApiResponse) {
          // Simulate API response delay
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Extract potential company names for the mock response
          const companyNames = extractCompanyNamesFromEmail(emailContent);
          const companyName = companyNames.length > 0 ? companyNames[0] : "Acme Corporation";

          // Create a mock response
          const mockResponse = `
            <div class="company-profile">
              <div class="flex justify-between items-center mb-5">
                <div class="flex items-center">
                  <div class="flex items-baseline mr-3">
                    <span class="text-xl font-medium text-red-600">Company</span>
                    <span class="text-xl ml-1 text-gray-800 font-normal">Profile</span>
                  </div>
                  <span class="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full">${companyName}</span>
                </div>
              </div>
              
              <div class="mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Company Overview</h3>
                <p>${companyName} is a leading provider of innovative solutions in its industry. The company focuses on delivering high-quality products and services to meet customer needs.</p>
              </div>
              
              <div class="mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Industry & Sector</h3>
                <p><span class="font-medium">Primary Industry:</span> Technology</p>
                <p><span class="font-medium">Sectors:</span> Software, Services</p>
              </div>
              
              <div class="mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Key Products & Services</h3>
                <ul class="list-disc pl-5 space-y-1">
                  <li>Enterprise Software Solutions</li>
                  <li>Cloud Services</li>
                  <li>Consulting Services</li>
                </ul>
              </div>
              
              <div class="mb-6">
                <h3 class="text-xl font-semibold text-gray-800 mb-2">Sources</h3>
                <ul class="list-disc pl-5 space-y-1 text-blue-600">
                  <li><a href="https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com" target="_blank" rel="noopener noreferrer">Company Website</a></li>
                  <li><a href="https://www.linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '')}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          `;

          setProfileHtml(mockResponse);
          setEditableProfile(mockResponse.replace(/<[^>]*>/g, ''));
          setShowResult(true);
          updateProcessingStep("Company profile research complete.");
          return;
        }

        // Real API call implementation using multiple CORS proxies with fallback
        const corsProxies = [
          "https://api.allorigins.win/raw?url=",
          "https://proxy.cors.sh/",
          "https://corsproxy.org/?",
          "https://cors-anywhere.herokuapp.com/",
          "https://thingproxy.freeboard.io/fetch/",
          "https://api.codetabs.com/v1/proxy/?quest=",
          "https://cors-proxy.htmldriven.com/?url="
        ];

        // Try each proxy in sequence until one works
        async function fetchWithCorsProxy(url, options) {
          const errors = [];

          // First try direct fetch (might work in some environments)
          try {
            const response = await fetch(url, options);
            if (response.ok) return response;
          } catch (error) {
            errors.push(`Direct fetch: ${error.message}`);
          }

          // Try each proxy in sequence
          for (const proxy of corsProxies) {
            try {
              const proxyUrl = proxy.includes('?url=') || proxy.includes('?quest=')
                ? `${proxy}${encodeURIComponent(url)}`
                : `${proxy}${url}`;

              console.log(`Trying CORS proxy: ${proxy}`);
              const response = await fetch(proxyUrl, options);
              if (response.ok) return response;
            } catch (error) {
              errors.push(`${proxy}: ${error.message}`);
            }
          }

          throw new Error(`All CORS proxies failed: ${errors.join(', ')}`);
        }

        const perplexityApiUrl = "https://api.perplexity.ai/chat/completions";
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${perplexityApiKey}`
          },
          body: JSON.stringify({
            model: selectedModel || "sonar-pro", // Use selected model from settings or default to sonar-pro
            messages: [
              {
                role: "system",
                content: systemPrompt
              },
              {
                role: "user",
                content: `Extract company information from this email and create a detailed profile:\n\n${emailContent}`
              }
            ],
            temperature: 0.2, // Lower temperature for more factual, focused responses
            max_tokens: 4000  // Allow for a longer, detailed response
          })
        };

        const response = await fetchWithCorsProxy(perplexityApiUrl, options);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Perplexity API error response:", errorText);
          throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
        }

        // Log the raw response for debugging - store full text for citation parsing
        const responseText = await response.clone().text();
        console.log("Perplexity API response:", responseText);

        // Try to extract citations from response text directly if needed
        let rawCitations = [];
        try {
          // Some versions of the API might include citations in a different format
          const responseJson = JSON.parse(responseText);
          if (responseJson.citations) {
            rawCitations = responseJson.citations;
          } else if (responseJson.choices?.[0]?.message?.citations) {
            rawCitations = responseJson.choices[0].message.citations;
          } else if (responseJson.choices?.[0]?.citations) {
            rawCitations = responseJson.choices[0].citations;
          }
          console.log("Raw citations extracted:", rawCitations);
        } catch (err) {
          console.log("Error parsing raw citations:", err);
        }

        const data = await response.json();

        // Check for citations directly at the top level
        if (data.citations && Array.isArray(data.citations)) {
          console.log("Top-level citations found:", data.citations);
        }

        if (data.choices && data.choices[0] && data.choices[0].message) {
          const content = data.choices[0].message.content;

          // Process response content
          let outputContent = content;

          // Check for and remove thinking tags if present
          const thinkRegex = /<think>(.*?)<\/think>/s;
          if (content.match(thinkRegex)) {
            // Remove thinking content from the output
            outputContent = content.replace(thinkRegex, '');
          }

          // Extract and process sources
          const { enhancedContent, sourcesHtml } = renderSources(data, outputContent);

          console.log("Final citation data - Enhanced content and sources HTML", {
            contentLength: enhancedContent.length,
            sourcesHtmlLength: sourcesHtml.length,
            hasCitations: sourcesHtml.length > 0
          });

          // Process the enhanced content with markdown
          const renderedMarkdown = renderMarkdown(enhancedContent);

          // Combine the rendered markdown with sources
          const finalHtml = `<div class="company-profile">${renderedMarkdown}${sourcesHtml}</div>`;

          setProfileHtml(finalHtml);
          setEditableProfile(outputContent); // Store plain content for editing
          setShowResult(true);
          updateProcessingStep("Company profile research complete.");

          // Auto-save the profile to history
          try {
            // Extract company name from the profile content
            const companyNameMatch = outputContent.match(/##\s*([^\n]+)/);
            const companyName = companyNameMatch ? companyNameMatch[1].trim() : "Company Profile";

            await saveCompanyProfileHistory({
              companyName,
              report: finalHtml,
              sourcedFrom: "Perplexity API"
            });
            console.log('Company profile saved to history successfully');
            toast.success('Profile saved to history');
          } catch (saveError) {
            console.error('Error saving profile to history:', saveError);
            toast.error('Failed to save profile to history');
          }
        } else {
          throw new Error("Invalid response format from Perplexity API");
        }
      } catch (apiError) {
        console.error("API call failed:", apiError);

        // Fall back to local processing if API fails
        updateProcessingStep("API call failed. Using fallback mode...");

        // Simple company name extraction for fallback
        const companyNames = extractCompanyNamesFromEmail(emailContent);
        const fallbackHtml = createFallbackResponse(companyNames);

        setProfileHtml(fallbackHtml);
        setEditableProfile(fallbackHtml.replace(/<[^>]*>/g, ''));
        setShowResult(true);
        updateProcessingStep("Generated basic company profile.");

        // Auto-save the fallback profile to history
        try {
          const companyName = companyNames.length > 0 ? companyNames[0] : "Unknown Company";

          await saveCompanyProfileHistory({
            companyName,
            report: fallbackHtml,
            sourcedFrom: "Fallback Processing"
          });
          console.log('Fallback company profile saved to history successfully');
          toast.success('Basic profile saved to history');
        } catch (saveError) {
          console.error('Error saving fallback profile to history:', saveError);
          toast.error('Failed to save profile to history');
        }
      }
    } catch (err: any) {
      console.error("Error generating company profile:", err);
      setError(`Failed to generate company profile: ${err.message || 'Unknown error'}`);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProcessingStep(""), 3000); // Clear processing step after 3 seconds
    }
  };

  // Handle editing profile
  const enableEditMode = () => {
    setEditableProfile(profileHtml.replace(/<[^>]*>/g, ''));
    setIsEditing(true);
  };

  const saveSummaryEdit = () => {
    // Convert plain text back to HTML (simplified version)
    setProfileHtml(`<div>${editableProfile.split('\n').map(line => `<p>${line}</p>`).join('')}</div>`);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  // Handle copy to clipboard
  const copySummaryToClipboard = async () => {
    const contentElement = document.getElementById("profile-content");
    if (!contentElement) {
      toast.error("Content not found");
      return;
    }

    const fullHTML = `
        <div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6;">
          ${contentElement.innerHTML}
        </div>
      `;

    if (navigator.clipboard && window.ClipboardItem) {
      try {
        const blob = new Blob([fullHTML], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        await navigator.clipboard.write([clipboardItem]);
        toast.success("Summary copied to clipboard!");
      } catch (err) {
        console.error("Copy failed:", err);
        toast.error("Failed to copy.");
      }
    } else {
      toast.error("Clipboard API not supported.");
    }
  };

  // Handle print functionality
  const printProfile = () => {
    const contentElement = document.getElementById('profile-content');

    if (!contentElement) {
      toast.error("Could not find profile content to print");
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      toast.error("Could not open print window. Please check your popup blocker settings.");
      return;
    }

    // Extract company name from email content
    const companyNames = extractCompanyNamesFromEmail(emailContent);
    const companyName = companyNames.length > 0 ? companyNames[0] : "Company";

    // Get current date in format DD/MM/YYYY
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Create print document with styled content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Company Profile - ${companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 20px; 
            }
            .header-left {
              display: flex;
              align-items: center;
            }
            .title-wrapper {
              display: flex;
              align-items: baseline;
              margin-right: 12px;
            }
            .company-title { 
              font-size: 18px; 
              color: #e11d48; 
              font-weight: 500; 
            }
            .profile-text {
              font-size: 18px;
              color: #333;
              margin-left: 4px;
              font-weight: normal;
            }
            .company-badge { 
              background-color: #fee2e2; 
              color: #b91c1c; 
              font-size: 13px;
              padding: 4px 12px;
              border-radius: 16px;
            }
            .date { 
              color: #666; 
              font-size: 14px; 
            }
            .company-profile h2 { color: #dc2626; margin-bottom: 16px; }
            .company-profile h3 { color: #1f2937; margin-top: 20px; margin-bottom: 8px; }
            table { border-collapse: collapse; width: 100%; margin: 16px 0; }
            th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
            th { background-color: #f9fafb; }
            ul { margin-top: 8px; }
            a { color: #2563eb; text-decoration: none; }
            @media print {
              body { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <div class="title-wrapper">
                <span class="company-title">Company</span>
                <span class="profile-text">Profile</span>
              </div>
              <span class="company-badge">${companyName}</span>
            </div>
            <div class="date">Generated on ${formattedDate}</div>
          </div>
          <div class="company-profile">
            ${contentElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.success("Print dialog opened");
  };
  // Handle PDF download
  const downloadProfileAsPdf = () => {
    // Get the profile content element
    const contentElement = document.getElementById('profile-content');

    if (!contentElement) {
      toast.error("Could not find profile content to download");
      return;
    }

    toast.success("PDF download started");

    // Create a clone of the content to style specifically for PDF
    const contentClone = contentElement.cloneNode(true) as HTMLElement;

    // Create a container for styling the PDF
    const pdfContainer = document.createElement('div');
    pdfContainer.appendChild(contentClone);

    // Apply PDF-specific styling
    pdfContainer.style.padding = '20px';
    pdfContainer.style.color = '#000';
    pdfContainer.style.backgroundColor = '#fff';

    // Find company name for the filename
    let filename = 'company-profile.pdf';
    const h1Elements = contentClone.getElementsByTagName('h1');
    const h2Elements = contentClone.getElementsByTagName('h2');

    if (h1Elements.length > 0) {
      filename = `${h1Elements[0].textContent?.trim().replace(/\s+/g, '-').toLowerCase() || 'company'}-profile.pdf`;
    } else if (h2Elements.length > 0) {
      filename = `${h2Elements[0].textContent?.trim().replace(/\s+/g, '-').toLowerCase() || 'company'}-profile.pdf`;
    }

    // Configure html2pdf options
    const options = {
      margin: [10, 10, 10, 10],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate and download PDF
    html2pdf()
      .set(options)
      .from(pdfContainer)
      .save()
      .then(() => {
        toast.success("Company profile PDF downloaded successfully!");
      })
      .catch((error: any) => {
        console.error("PDF generation error:", error);
        toast.error("Failed to generate PDF. Please try again.");
      });
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <Link to="/ai-agents" className="mb-6 inline-block">
        <Button style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
          className="bg-primary-red  hover:bg-red-700 transition-colors duration-200 mb-6"
          variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <Card className="bg-white shadow-xl border-none rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white border-none pb-8">
          <CardTitle className="text-4xl font-bold text-center">Company Profile AI</CardTitle>
          <CardDescription className="text-center text-white/80 mt-2">
            Extract detailed company information from emails or text
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-8 pb-8 -mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                value="paste"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md"
              >
                Paste Email Content
              </TabsTrigger>
              <TabsTrigger
                value="sample"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md"
              >
                Use Sample
              </TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste email content here..."
                  className="min-h-[200px] border border-gray-200 bg-red-50/30 focus:border-red-400 focus:ring-red-400 rounded-lg transition-colors"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
                <p className="text-xs text-red-600/70 italic">Paste the entire email including headers, signatures, and any company references</p>
              </div>
            </TabsContent>

            <TabsContent value="sample" className="space-y-4">
              <div className="flex items-center justify-center p-6 border border-red-100 bg-red-50/50 rounded-lg">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium text-red-700">Sample Email</p>
                  <p className="text-sm text-red-600/70 mb-4">Use our sample email to see how the AI extracts company information</p>
                  <Button
                    onClick={() => {
                      setEmailContent("Subject: Partnership Opportunity with Acme Corp\n\nDear John,\n\nI hope this email finds you well. My name is Sarah Johnson, and I am the Business Development Manager at Acme Corporation. I recently came across your company's innovative solutions and believe there could be significant opportunities for collaboration.\n\nAcme Corp has been a leader in software solutions for over 15 years, with headquarters in San Francisco and offices across North America and Europe. We specialize in AI-driven analytics platforms that help businesses optimize their operations and make data-driven decisions.\n\nI'd love to schedule a call to discuss how we might work together. Please let me know your availability for next week.\n\nBest regards,\n\nSarah Johnson\nBusiness Development Manager\nAcme Corporation\nsjohnson@acmecorp.com\n+1 (555) 123-4567\nwww.acmecorp.com");
                      setActiveTab("paste");
                    }}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    Load Sample Email
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <Button
              onClick={generateCompanyProfile}
              disabled={isLoading || (!emailContent.trim() && activeTab === 'paste')}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-medium py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-lg">Researching Company...</span>
                </span>
              ) : 'Research Company'}
            </Button>

            {isLoading && (
              <div className="mt-8 p-6 bg-white border border-red-100 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 relative mr-3">
                      <div className="absolute inset-0 bg-red-500 rounded-full opacity-25 animate-ping-slow"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-red-700 font-semibold text-xl">AI Research in Progress</h4>
                  </div>
                  <div className="flex space-x-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse delay-100"></div>
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse delay-200"></div>
                  </div>
                </div>

                {/* Enhanced Progress Bar with gradient and animation */}
                <div className="relative w-full h-4 bg-red-50 rounded-full mb-6 overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-red-600 to-red-400 animate-gradient-x"></div>
                  <div className="absolute inset-0 bg-red-500 h-full animate-progress-indeterminate opacity-70"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer opacity-30"></div>
                </div>

                {/* Enhanced Current Step Indicator */}
                <div className="p-5 rounded-lg bg-red-50/60 border border-red-100 mb-5 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent animate-pulse-slow opacity-50"></div>
                  <div className="relative flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-full mr-4 shadow-md border border-red-100">
                      <svg className="animate-spin h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-red-800 mb-1">Current Operation:</div>
                      <div className="text-red-600 font-medium text-lg">{processingStep || "Gathering company data..."}</div>
                    </div>
                  </div>
                </div>



                <style dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes progress-indeterminate {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                  @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50% }
                    50% { background-position: 100% 50% }
                  }
                  @keyframes shimmer {
                    0% { transform: translateX(-100%) }
                    100% { transform: translateX(100%) }
                  }
                  @keyframes ping-slow {
                    0% { transform: scale(1); opacity: 0.25; }
                    50% { transform: scale(1.2); opacity: 0.15; }
                    100% { transform: scale(1); opacity: 0.25; }
                  }
                  @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.1; }
                  }
                  .animate-progress-indeterminate {
                    animation: progress-indeterminate 1.5s infinite cubic-bezier(0.65, 0.05, 0.36, 1);
                  }
                  .animate-gradient-x {
                    animation: gradient-x 3s ease infinite;
                    background-size: 200% 200%;
                  }
                  .animate-shimmer {
                    animation: shimmer 2s infinite;
                  }
                  .animate-ping-slow {
                    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
                  }
                  .animate-pulse-slow {
                    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                  }
                  .delay-100 {
                    animation-delay: 0.1s;
                  }
                  .delay-200 {
                    animation-delay: 0.2s;
                  }
                ` }} />
              </div>
            )}

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>

          {showResult && (
            <div className="mt-8 bg-white border border-red-100 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-red-100">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3 className="text-2xl font-bold text-red-700 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company Profile
                  </h3>
                  <p className="text-[14px]">Generated on{" "}
                    {new Date().toLocaleString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}</p>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={editableProfile}
                    onChange={(e) => setEditableProfile(e.target.value)}
                    className="min-h-[400px] font-mono text-sm bg-red-50/30 border-red-100 focus:border-red-400 focus:ring-red-400 rounded-lg shadow-inner"
                  />
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-400 shadow-sm transition-all"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveSummaryEdit}
                      className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-red-50 p-6">
                  <div
                    id="profile-content"
                    className="prose max-w-none prose-headings:text-red-700 prose-a:text-red-600 prose-strong:text-red-700"
                    dangerouslySetInnerHTML={{ __html: profileHtml }}
                  />

                  <div className="w-full flex items-center justify-center mt-6">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex items-center"
                        onClick={copySummaryToClipboard}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </Button>

                      <Button
                        variant="outline"
                        className="flex items-center"
                        onClick={printProfile}
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>

                      <Button variant="outline" className="flex items-center" onClick={downloadProfileAsPdf}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>

                    </div>
                  </div>
                </div>
              )}


            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfileAI;

