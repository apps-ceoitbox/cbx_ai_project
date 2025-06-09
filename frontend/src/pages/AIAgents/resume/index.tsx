import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Upload, FileText, Briefcase, Brain, CheckCircle, XCircle, ListOrdered, ClipboardPaste } from "lucide-react";
// History service removed
import * as mammoth from 'mammoth';
import { useAxios } from "@/context/AppContext";

// Type declaration for PDF.js
type PDFJSDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getTextContent: () => Promise<{
      items: Array<{ str?: string }>;
    }>;
  }>;
};

type PDFJS = {
  getDocument: (options: { data: ArrayBuffer }) => {
    promise: Promise<PDFJSDocument>;
  };
  GlobalWorkerOptions: {
    workerSrc: string;
  };
};

// Global variable for PDF.js
let pdfjsLib: PDFJS;

// Initialize PDF.js worker
const initPDFJS = () => {
  return new Promise<void>((resolve) => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - PDF.js might be available globally
      if (window.pdfjsLib) {
        // @ts-ignore
        pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        console.log('PDF.js already loaded');
        resolve();
      } else {
        console.log('Loading PDF.js dynamically');
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          // @ts-ignore - PDF.js is now available globally
          pdfjsLib = window.pdfjsLib;
          if (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            console.log('PDF.js loaded successfully');
            resolve();
          } else {
            console.error('Failed to load PDF.js library');
            resolve(); // Resolve anyway to continue execution
          }
        };
        script.onerror = () => {
          console.error('Error loading PDF.js script');
          resolve(); // Resolve anyway to continue execution
        };
        document.head.appendChild(script);
      }
    } else {
      resolve(); // Not in browser environment
    }
  });
};

// Initialize PDF.js on component mount
if (typeof window !== 'undefined') {
  initPDFJS().then(() => {
    console.log('PDF.js initialization complete');
  });
}

// AI Model types
type AIModelType = "gemini" | "openai" | "anthropic" | "groq";


// Resume Analysis interfaces
interface AnalysisResult {
  resumeSummary: {
    name: string;
    skills: string[];
    experience: string;
    education: string;
  };
  jobSummary: {
    title: string;
    requiredSkills: string[];
    responsibilities: string[];
  };
  comparison: {
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    extraSkills: string[];
    suggestions: string[];
  };
}

interface ResumeAnalysis {
  file: File;
  isAnalyzing: boolean;
  result?: AnalysisResult;
  error?: string;
  selected?: boolean;
}


const ResumeAnalyzer = () => {
  const axios = useAxios("admin");
  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  // Input values
  // Initialize API key and model states
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<AIModelType>("gemini");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  // Fetch API settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/aiagentsettings");
        const settings = response.data?.data; // Access the data property of the response

        // Check if settings is an array before using find
        if (Array.isArray(settings)) {
          // Find Resume Analyzer settings
          const resumeAnalyzerSetting = settings.find(setting => setting.name === "ResumeAnalyzer");

          if (resumeAnalyzerSetting) {
            setApiKey(resumeAnalyzerSetting.apikey || "");

            // Store the complete provider object with all its properties
            setSelectedProvider({
              name: resumeAnalyzerSetting.aiProvider?.name || "",
              model: resumeAnalyzerSetting.aiProvider?.model || "gemini"
            });

            setSelectedModel(resumeAnalyzerSetting.aiProvider?.model || "gemini");
            console.log("Loaded settings from backend:", {
              provider: resumeAnalyzerSetting.aiProvider?.name,
              model: resumeAnalyzerSetting.aiProvider?.model,
              apiKey: resumeAnalyzerSetting.apikey ? "[PRESENT]" : "[MISSING]"
            });
            return;
          }
        }

        // Fallback to localStorage if backend settings not found or not in expected format
        const savedApiKey = localStorage.getItem('resume_analyzer_api_key') || "";
        const savedModel = (localStorage.getItem('resume_analyzer_model') as AIModelType) || "gemini";

        setApiKey(savedApiKey);
        setSelectedModel(savedModel);
        setSelectedProvider({
          name: "Unknown", // Default provider name
          model: savedModel
        });

        console.log("Using fallback settings from localStorage");
      } catch (error) {
        console.error("Error fetching Resume Analyzer settings:", error);
        // Fallback to localStorage if API call fails
        const savedApiKey = localStorage.getItem('resume_analyzer_api_key') || "";
        const savedModel = (localStorage.getItem('resume_analyzer_model') as AIModelType) || "gemini";

        setApiKey(savedApiKey);
        setSelectedModel(savedModel);
        setSelectedProvider({
          name: "Unknown", // Default provider name
          model: savedModel
        });

        console.log("Using fallback settings due to error");
      }
    };

    fetchSettings();
  }, []);

  // Files
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFiles, setResumeFiles] = useState<ResumeAnalysis[]>([]);
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const [jobDescText, setJobDescText] = useState<string>('');
  const [activeJobDescTab, setActiveJobDescTab] = useState<'upload' | 'paste'>('upload');

  // Extract text from file (PDF, DOCX, or TXT)
  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      // Handle PDF files
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          // Make sure PDF.js is properly initialized
          if (typeof window !== 'undefined' && !pdfjsLib) {
            console.log('PDF.js not yet loaded, initializing now...');
            await initPDFJS();
          }

          if (typeof window === 'undefined' || !pdfjsLib) {
            console.warn('PDF.js could not be loaded, falling back to simple text extraction');
            throw new Error('PDF.js not loaded');
          }

          console.log('Processing PDF file:', file.name);
          const arrayBuffer = await file.arrayBuffer();
          console.log('PDF arrayBuffer size:', arrayBuffer.byteLength);

          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          console.log('PDF loading task created');

          const pdf = await loadingTask.promise;
          console.log('PDF loaded successfully, pages:', pdf.numPages);

          let text = '';

          // Extract text from each page (up to 10 pages to prevent performance issues)
          const maxPages = Math.min(pdf.numPages, 10);
          for (let i = 1; i <= maxPages; i++) {
            console.log(`Processing PDF page ${i} of ${maxPages}`);
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map((item: any) => item.str || '');
            text += strings.join(' ').trim() + '\n\n';
          }

          if (pdf.numPages > 10) {
            text += '\n[Document truncated to first 10 pages]';
          }

          console.log('PDF text extraction complete');
          return text.trim();
        } catch (error) {
          console.error('Error extracting text from PDF:', error);
          toast.error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
          // Fallback to simple text extraction if PDF parsing fails
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve(e.target?.result?.toString() || '');
            };
            reader.onerror = () => {
              console.error('FileReader error');
              resolve('');
            };
            reader.readAsText(file);
          });
        }
      }

      // Handle DOCX files
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.toLowerCase().endsWith('.docx')) {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          return result.value;
        } catch (error) {
          console.error('Error extracting text from DOCX:', error);
          throw new Error('Failed to extract text from DOCX');
        }
      }

      // Handle DOC files (fallback to binary read)
      if (file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc')) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              const arrayBuffer = e.target.result as ArrayBuffer;
              mammoth.extractRawText({ arrayBuffer })
                .then(result => resolve(result.value))
                .catch(error => {
                  console.error('Error extracting text from DOC:', error);
                  reject(new Error('Failed to extract text from DOC file'));
                });
            } else {
              reject(new Error('Failed to read DOC file'));
            }
          };
          reader.onerror = () => reject(new Error('Error reading DOC file'));
          reader.readAsArrayBuffer(file);
        });
      }

      // Handle plain text files
      if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error('Failed to read text file'));
            }
          };
          reader.onerror = () => reject(new Error('Error reading text file'));
          reader.readAsText(file);
        });
      }

      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('Error in extractTextFromFile:', error);
      throw error;
    }
  };

  // Handle resume file selection
  const handleResumeUpload = async (files: FileList) => {
    const newResumes: ResumeAnalysis[] = [];
    const supportedFormats = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/octet-stream' // For some .doc files
    ];

    const supportedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        const isSupported = supportedFormats.includes(file.type) ||
          supportedExtensions.includes('.' + fileExt);

        if (!isSupported) {
          toast.error(`${file.name}: Unsupported file format. Please upload PDF, DOC, DOCX, or TXT.`);
          continue;
        }

        // Check file size
        if (file.size > maxFileSize) {
          toast.error(`${file.name} is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum file size is 5MB.`);
          continue;
        }

        // Check for duplicate files
        const isDuplicate = resumeFiles.some(
          (resume) => resume.file.name === file.name && resume.file.size === file.size
        );

        if (isDuplicate) {
          toast.warning(`Skipping duplicate file: ${file.name}`);
          continue;
        }

        newResumes.push({
          file,
          result: null,
          isAnalyzing: false
        });

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toast.error(`Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (newResumes.length > 0) {
      setResumeFiles(prev => [...prev, ...newResumes]);
      toast.success(`Added ${newResumes.length} resume${newResumes.length > 1 ? 's' : ''}`);
    }
  };

  // Handle job description file selection
  const handleJobDescUpload = (file: File) => {
    const supportedFormats = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/octet-stream' // For some .doc files
    ];

    const supportedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isSupported = supportedFormats.includes(file.type) ||
        supportedExtensions.includes('.' + fileExt);

      if (!isSupported) {
        toast.error("Unsupported file format. Please upload a PDF, DOC, DOCX, or TXT file.");
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        toast.error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum file size is 5MB.`);
        return;
      }

      // Check for duplicate file
      if (jobDescFile && jobDescFile.name === file.name && jobDescFile.size === file.size) {
        toast.warning(`The file "${file.name}" is already uploaded`);
        return;
      }

      setJobDescFile(file);
      setJobDescText(''); // Clear any pasted text when uploading a file
      toast.success(`"${file.name}" has been uploaded`);

    } catch (error) {
      console.error('Error processing job description file:', error);
      toast.error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle pasted job description
  const handlePasteJobDesc = () => {
    if (!jobDescText.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    // Create a text file from the pasted content
    const blob = new Blob([jobDescText], { type: 'text/plain' });
    const file = new File([blob], 'job-description.txt', { type: 'text/plain' });
    setJobDescFile(file);
    toast.success("Job description pasted successfully");
  };

  // Clear job description
  const clearJobDesc = () => {
    setJobDescFile(null);
    setJobDescText('');
  };

  // Remove a resume from the list
  const removeResume = (index: number) => {
    setResumeFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Function to handle CORS issues with API calls using multiple proxies
  const fetchWithCorsProxy = async (url: string, options: RequestInit): Promise<Response> => {
    const errors: string[] = [];

    // First try direct fetch (might work in some environments)
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      errors.push(`Direct fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // List of CORS proxies to try
    const corsProxies = [
      "https://api.allorigins.win/raw?url=",
      "https://proxy.cors.sh/",
      "https://corsproxy.org/?",
      "https://cors-anywhere.herokuapp.com/",
      "https://thingproxy.freeboard.io/fetch/",
      "https://api.codetabs.com/v1/proxy/?quest=",
      "https://cors-proxy.htmldriven.com/?url="
    ];

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
        errors.push(`${proxy}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    throw new Error(`All CORS proxies failed: ${errors.join(', ')}`);
  };

  // Function to call OpenAI API
  const analyzeWithOpenAI = async (resumeText: string, jobDescription: string): Promise<AnalysisResult> => {
    try {
      // OpenAI API endpoint
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an AI resume analyzer that helps match candidates to job descriptions. Extract key information from the resume, analyze fit against the job, and provide a comprehensive analysis with a match score.'
            },
            {
              role: 'user',
              content: `Analyze this resume against the job description. Resume: ${resumeText}\n\nJob Description: ${jobDescription}\n\nProvide a detailed analysis including:\n1. Resume summary (candidate name, skills, experience, education)\n2. Job summary (title, required skills, responsibilities)\n3. Comparison (match score as a percentage, matched skills, missing skills, extra skills the candidate has, and specific improvement suggestions)\n\nFormat the response as a JSON object with these exact keys: resumeSummary (with nested keys: name, skills as array, experience, education), jobSummary (with nested keys: title, requiredSkills as array, responsibilities as array), comparison (with nested keys: matchScore as number, matchedSkills as array, missingSkills as array, extraSkills as array, suggestions as array)`
            }
          ],
          temperature: 0.5,
          response_format: { type: "json_object" }
        })
      };

      // Use fetchWithCorsProxy to handle CORS issues
      const response = await fetchWithCorsProxy('https://api.openai.com/v1/chat/completions', options);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to analyze with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to call Gemini API with text or direct PDF upload
  // Function to convert a File to a base64 string for Gemini API
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Extract the base64 part after the comma
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  };
  const analyzeWithGemini = async (resumeTextOrFile: string | File, jobDescription: string): Promise<AnalysisResult> => {
    try {
      console.log('Making Gemini API request...');

      let requestBody;

      // Check if the resume is a File object (direct PDF upload) or text
      if (typeof resumeTextOrFile !== 'string' &&
        (resumeTextOrFile.type === 'application/pdf' || resumeTextOrFile.name.toLowerCase().endsWith('.pdf'))) {

        console.log('Using direct PDF upload with Gemini API');

        // Convert the PDF file to base64
        const base64Data = await fileToBase64(resumeTextOrFile);

        requestBody = {
          contents: [
            {
              parts: [
                {
                  text: `Analyze this resume against the following job description and provide a detailed comparison. The resume is attached as a PDF file.\n\nJob Description:\n${jobDescription}\n\nProvide your analysis in the following JSON format exactly:\n{\n  "resumeSummary": {\n    "name": "candidate name",\n    "skills": ["skill1", "skill2"],\n    "experience": "brief experience summary",\n    "education": "education background"\n  },\n  "jobSummary": {\n    "title": "job title",\n    "requiredSkills": ["skill1", "skill2"],\n    "responsibilities": ["responsibility1", "responsibility2"]\n  },\n  "comparison": {\n    "matchScore": 75,\n    "matchedSkills": ["matching skills"],\n    "missingSkills": ["missing skills"],\n    "extraSkills": ["additional skills"],\n    "suggestions": ["improvement suggestions"]\n  }\n}`
                },
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        };
      } else {
        // Use text-based analysis if it's not a PDF or text was already extracted
        const resumeText = typeof resumeTextOrFile === 'string' ? resumeTextOrFile : 'Error: Resume text extraction failed';

        if (resumeText === 'Error: Resume text extraction failed') {
          throw new Error('Failed to extract text from resume');
        }

        const prompt = `
        Please analyze the following resume and job description, then provide a detailed comparison:

        RESUME:
        ${resumeText}

        JOB DESCRIPTION:
        ${jobDescription}

        Please respond in the following JSON format:
        {
          "resumeSummary": {
            "name": "candidate name",
            "skills": ["skill1", "skill2"],
            "experience": "brief experience summary",
            "education": "education background"
          },
          "jobSummary": {
            "title": "job title",
            "requiredSkills": ["skill1", "skill2"],
            "responsibilities": ["responsibility1", "responsibility2"]
          },
          "comparison": {
            "matchScore": 75,
            "matchedSkills": ["matching skills"],
            "missingSkills": ["missing skills"],
            "extraSkills": ["additional skills"],
            "suggestions": ["improvement suggestions"]
          }
        }
        `;

        requestBody = {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        };
      }

      // Make the API request
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      };

      // Determine which Gemini model to use based on selectedModel
      // Default to gemini-2.0-flash if not specified
      let geminiModelName = "gemini-2.0-flash";

      // If selectedModel contains a specific Gemini model version, use that instead
      if (selectedModel.includes("-")) {
        geminiModelName = selectedModel;
      }

      console.log(`Using Gemini model: ${geminiModelName}`);

      // Use fetchWithCorsProxy to handle CORS issues
      const response = await fetchWithCorsProxy(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModelName}:generateContent?key=${apiKey}`, options);

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Check if the response has the expected structure
      // Handle both the old and new Gemini API response formats
      let generatedText = '';

      if (data.candidates && data.candidates[0]) {
        // New Gemini 2.5 format
        if (data.candidates[0].text) {
          generatedText = data.candidates[0].text;
        }
        // Old Gemini format
        else if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
          generatedText = data.candidates[0].content.parts[0].text;
        }
        else {
          console.error('Unexpected API response structure:', data);
          throw new Error('Invalid response structure from Gemini API');
        }
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }

      console.log('Generated text:', generatedText);

      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        console.log('Parsed result:', parsedResult);
        return parsedResult;
      }

      throw new Error('Could not parse AI response - no valid JSON found');
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  // Function to call Anthropic API
  const analyzeWithAnthropic = async (resumeText: string, jobDescription: string): Promise<AnalysisResult> => {
    try {
      // Anthropic API endpoint
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-opus-20240229',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `Analyze this resume against the job description. Resume: ${resumeText}\n\nJob Description: ${jobDescription}\n\nProvide a detailed analysis including:\n1. Resume summary (candidate name, skills, experience, education)\n2. Job summary (title, required skills, responsibilities)\n3. Comparison (match score as a percentage, matched skills, missing skills, extra skills the candidate has, and specific improvement suggestions)\n\nFormat the response as a JSON object with these exact keys: resumeSummary (with nested keys: name, skills as array, experience, education), jobSummary (with nested keys: title, requiredSkills as array, responsibilities as array), comparison (with nested keys: matchScore as number, matchedSkills as array, missingSkills as array, extraSkills as array, suggestions as array)`
            }
          ]
        })
      };

      // Use fetchWithCorsProxy to handle CORS issues
      const response = await fetchWithCorsProxy('https://api.anthropic.com/v1/messages', options);

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Failed to parse Anthropic response');
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(`Failed to analyze with Anthropic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Function to call Groq API
  const analyzeWithGroq = async (resumeText: string, jobDescription: string): Promise<AnalysisResult> => {
    try {
      // Construct a prompt that will work well with the latest Llama 4 model
      const prompt = `Analyze this resume against the job description thoroughly.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed analysis including:
1. Resume summary (candidate name, skills, experience, education)
2. Job summary (title, required skills, responsibilities)
3. Comparison (match score as a percentage, matched skills, missing skills, extra skills the candidate has, and specific improvement suggestions)

Your response MUST be a valid JSON object with these exact keys:
- resumeSummary (with nested keys: name, skills as array, experience, education)
- jobSummary (with nested keys: title, requiredSkills as array, responsibilities as array)
- comparison (with nested keys: matchScore as number, matchedSkills as array, missingSkills as array, extraSkills as array, suggestions as array)`;

      // Groq API endpoint with the latest Llama 4 model
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-4-8b-moe', // Using the latest Llama 4 Mixture of Experts model
          messages: [
            {
              role: 'system',
              content: 'You are an AI resume analyzer that helps match candidates to job descriptions. You extract key information from resumes, analyze fit against job requirements, and provide comprehensive analysis with a match score. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Lower temperature for more consistent outputs
          response_format: { type: "json_object" },
          max_tokens: 4000
        })
      };

      // Use fetchWithCorsProxy to handle CORS issues
      const response = await fetchWithCorsProxy('https://api.groq.com/openai/v1/chat/completions', options);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API error response:', errorData);
        throw new Error(`Groq API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Groq API response:', JSON.stringify(data, null, 2));

      // Parse the JSON response
      try {
        return JSON.parse(data.choices[0].message.content);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        // If direct parsing fails, try to extract JSON from the text
        const content = data.choices[0].message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const result = JSON.parse(jsonMatch[0]);
            if (!result.resumeSummary || !result.jobSummary || !result.comparison) {
              throw new Error('Incomplete response structure');
            }
            return result;
          } catch (extractError) {
            throw new Error('Failed to parse Groq response: ' + (extractError instanceof Error ? extractError.message : 'Unknown error'));
          }
        }
        throw new Error('No valid JSON found in Groq response');
      }
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error(`Failed to analyze with Groq: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Analyze resumes function
  const analyzeResumes = async () => {
    if (resumeFiles.length === 0 || !jobDescFile) {
      toast.error("Please upload at least one resume and a job description");
      return;
    }

    if (!apiKey) {
      toast.error("API key is required for analysis");
      return;
    }

    try {
      setIsLoading(true);
      setProcessingStep("Extracting text from documents...");

      // Extract text from job description
      let jobDescText;
      try {
        jobDescText = await extractTextFromFile(jobDescFile);
        if (!jobDescText || jobDescText.trim() === '') {
          throw new Error('Failed to extract text from job description');
        }
      } catch (error) {
        console.error('Job description extraction error:', error);
        toast.error(`Failed to extract text from job description: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
        return;
      }

      // Process each resume
      for (let i = 0; i < resumeFiles.length; i++) {
        // Set the current resume to analyzing state
        setResumeFiles(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            isAnalyzing: true
          };
          return updated;
        });

        setProcessingStep(`Analyzing resume ${i + 1} of ${resumeFiles.length}...`);

        // Variable to hold resume text or file for direct upload
        let resumeTextOrFile;

        // For Gemini model, we can send the PDF file directly if it's a PDF
        const isPDF = resumeFiles[i].file.type === 'application/pdf' || resumeFiles[i].file.name.toLowerCase().endsWith('.pdf');
        // Check if the provider is Gemini or if the model is any Gemini variant
        const providerName = selectedProvider?.name?.toLowerCase() || '';
        const isGemini = providerName === 'gemini' ||
          providerName.includes('gemini') ||
          selectedModel === 'gemini' ||
          selectedModel.startsWith('gemini-');

        console.log(`Using provider: ${providerName}, model: ${selectedModel}, isPDF: ${isPDF}, isGemini: ${isGemini}`);

        if (isGemini && isPDF) {
          // For Gemini and PDF files, we'll use the file directly
          resumeTextOrFile = resumeFiles[i].file;
          console.log('Using direct PDF upload with Gemini');
        } else {
          // For other models or file types, extract text first
          try {
            resumeTextOrFile = await extractTextFromFile(resumeFiles[i].file);
            if (!resumeTextOrFile || resumeTextOrFile.trim() === '') {
              throw new Error(`Failed to extract text from resume: ${resumeFiles[i].file.name}`);
            }
          } catch (extractError) {
            console.error('Resume text extraction error:', extractError);
            toast.error(`Failed to extract text from resume ${resumeFiles[i].file.name}: ${extractError instanceof Error ? extractError.message : 'Unknown error'}`);

            // Update resume with error
            setResumeFiles(prev => {
              const updated = [...prev];
              updated[i] = {
                ...updated[i],
                isAnalyzing: false,
                error: extractError instanceof Error ? extractError.message : 'Unknown error'
              };
              return updated;
            });

            // Continue to next resume
            continue;
          }
        }

        // Make API call based on selected model
        let result: AnalysisResult;

        try {
          // Determine which provider to use based on selectedProvider.name or fallback to model name
          let providerType = '';

          // First try to get provider from selectedProvider object
          if (selectedProvider && selectedProvider.name) {
            providerType = selectedProvider.name.toLowerCase();
          }
          // Fallback to extracting from model name if provider not available
          else if (selectedModel.includes('-')) {
            providerType = selectedModel.split('-')[0]; // Extract base model name (e.g., 'gemini' from 'gemini-2.5-flash-preview-04-17')
          } else {
            providerType = selectedModel; // Use model name as is if no hyphen
          }

          console.log(`Using provider type: ${providerType}, full model: ${selectedModel}`);

          // Check if the provider type contains 'gemini' to handle cases like 'gemini (google)'
          const isGeminiProvider = providerType === 'gemini' || providerType.includes('gemini');

          if (isGeminiProvider) {
            // Gemini can handle both text and direct PDF upload
            result = await analyzeWithGemini(resumeTextOrFile, jobDescText);
          } else if (providerType === 'openai') {
            // For OpenAI, we must have text
            if (typeof resumeTextOrFile !== 'string') {
              throw new Error('OpenAI requires text extraction from PDF');
            }
            result = await analyzeWithOpenAI(resumeTextOrFile, jobDescText);
          } else if (providerType === 'anthropic') {
            // For Anthropic, we must have text
            if (typeof resumeTextOrFile !== 'string') {
              throw new Error('Anthropic requires text extraction from PDF');
            }
            result = await analyzeWithAnthropic(resumeTextOrFile, jobDescText);
          } else if (providerType === 'groq') {
            // For Groq, we must have text
            if (typeof resumeTextOrFile !== 'string') {
              throw new Error('Groq requires text extraction from PDF');
            }
            result = await analyzeWithGroq(resumeTextOrFile, jobDescText);
          } else {
            throw new Error(`Unsupported provider type: ${providerType} with model: ${selectedModel}`);
          }
        } catch (apiError) {
          console.error(`API error with ${selectedModel}:`, apiError);
          toast.error(`Error with ${selectedModel} API: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);

          // Update resume with error
          setResumeFiles(prev => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              isAnalyzing: false,
              error: apiError instanceof Error ? apiError.message : 'Unknown error'
            };
            return updated;
          });

          // Continue to next resume
          continue;
        }

        // Update resume with result
        setResumeFiles(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            isAnalyzing: false,
            result: result
          };
          return updated;
        });
      }

      // Analysis history functionality removed

      setProcessingStep("Analysis complete");
      setShowResult(true);
      toast.success("Analysis complete!");

    } catch (err) {
      console.error("Analysis error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Unknown error occurred");
      toast.error("Failed to analyze resumes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link to="/ai-agents">
          <Button variant="outline" className="mr-4 border-gray-300 hover:border-red-600 hover:text-red-600">← Back</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900 pb-1 inline-block">Resume Analyzer</span>
        </h1>

        {/* Analysis History button removed */}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="mr-2 h-5 w-5" />
              Upload Documents
            </CardTitle>
            <CardDescription>
              Upload multiple resumes and a job description to analyze and rank candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resume" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resume">Resumes</TabsTrigger>
                <TabsTrigger value="job">Job Description</TabsTrigger>
              </TabsList>

              <TabsContent value="resume" className="space-y-4 mt-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-300 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                  title="Click to upload resumes (PDF, TXT)"
                >
                  <p className="text-sm text-gray-500 mb-2 group-hover:text-red-600">Supported formats: PDF, DOC, DOCX, TXT</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && handleResumeUpload(e.target.files)}
                  />
                  <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Resumes</h3>
                  <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload PDF, DOC, DOCX, or TXT files</p>
                  <p className="text-xs text-gray-400">You can upload multiple resumes for comparison</p>
                </div>

                {resumeFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-3 flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Uploaded Resumes ({resumeFiles.length})
                    </h3>
                    <div className="space-y-2">
                      {resumeFiles.map((resume, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                              <FileText className="h-4 w-4 text-red-700" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-800">{resume.file.name}</p>
                              <p className="text-xs text-gray-500">{(resume.file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {resume.isAnalyzing ? (
                              <div className="text-xs text-blue-600 flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                              </div>
                            ) : resume.error ? (
                              <Badge variant="destructive" className="text-xs">Error</Badge>
                            ) : resume.result ? (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">Analyzed</Badge>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 text-gray-500 hover:text-red-600"
                              onClick={() => removeResume(index)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="job" className="space-y-4 mt-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="border-b">
                    <div className="flex">
                      <button
                        type="button"
                        className={`flex-1 py-2 px-4 text-sm font-medium text-center ${activeJobDescTab === 'upload'
                          ? 'border-b-2 border-purple-600 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setActiveJobDescTab('upload')}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 px-4 text-sm font-medium text-center ${activeJobDescTab === 'paste'
                          ? 'border-b-2 border-purple-600 text-purple-600'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                        onClick={() => setActiveJobDescTab('paste')}
                      >
                        Paste Text
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    {activeJobDescTab === 'upload' ? (
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-300 transition-colors cursor-pointer group"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain';
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files && files.length > 0) {
                              handleJobDescUpload(files[0]);
                            }
                          };
                          input.click();
                        }}
                      >
                        <div className="mx-auto w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Job Description</h3>
                        <p className="text-sm text-gray-500 mb-2">Drag and drop or click to upload a PDF, DOC, DOCX, or TXT file</p>
                        <p className="text-xs text-gray-400">Max file size: 5MB</p>
                        <p className="text-xs text-gray-400">Upload the job description to match against candidate resumes</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="jobDescText" className="block text-sm font-medium text-gray-700">
                            Paste Job Description
                          </label>
                          <textarea
                            id="jobDescText"
                            rows={8}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            placeholder="Paste the job description here..."
                            value={jobDescText}
                            onChange={(e) => setJobDescText(e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={handlePasteJobDesc}
                          disabled={!jobDescText.trim()}
                        >
                          <ClipboardPaste className="mr-2 h-4 w-4" />
                          Use This Job Description
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {jobDescFile && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium mb-3 flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Job Description
                    </h3>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Briefcase className="h-4 w-4 text-purple-700" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">
                            {activeJobDescTab === 'paste' ? 'Pasted Job Description' : jobDescFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activeJobDescTab === 'paste'
                              ? `${jobDescText.split('\n').length} lines, ${jobDescText.length} characters`
                              : `${(jobDescFile.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        onClick={clearJobDesc}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  <p className="font-medium">Error occurred:</p>
                </div>
                <p className="ml-6">{errorMessage}</p>
              </div>
            )}

            <div className="mt-8">
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                disabled={isLoading || resumeFiles.length === 0 || !jobDescFile || !apiKey}
                onClick={analyzeResumes}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Resumes...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    Analyze Resumes
                  </>
                )}
              </Button>

              {processingStep && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{processingStep}</span>
                  </div>
                  <Progress value={isLoading ? 66 : 0} className="h-2 bg-gray-200" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results will be shown here after analysis */}
        {showResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ListOrdered className="mr-2 h-5 w-5" />
                Analysis Results
              </CardTitle>
              <CardDescription>
                Candidate ranking and detailed analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="lg:col-span-3">
                {!showResult ? (
                  <div className="p-8 bg-gray-100 rounded-lg border border-gray-200 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Brain className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Resume Analysis Dashboard</h3>
                    <p className="text-gray-600 mb-4">
                      Upload resumes and a job description, then click "Analyze Resumes" to begin.
                    </p>
                    <div className="space-y-2 max-w-md mx-auto text-left">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <p className="text-gray-600">Extract key information from resumes</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <p className="text-gray-600">Analyze candidate fit against job requirements</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <p className="text-gray-600">Rank candidates based on skill match</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <p className="text-gray-600">Provide AI-powered improvement suggestions</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl font-bold flex items-center">
                            <ListOrdered className="mr-2 h-5 w-5" />
                            Candidate Rankings
                          </CardTitle>
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {resumeFiles.length} Candidates
                          </Badge>
                        </div>
                        <CardDescription>
                          Candidates ranked by match score based on the job requirements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-16 text-center">Rank</TableHead>
                              <TableHead>Candidate</TableHead>
                              <TableHead className="text-center">Match Score</TableHead>
                              <TableHead className="text-center">Matched Skills</TableHead>
                              <TableHead className="text-center">Missing Skills</TableHead>
                              <TableHead className="text-center">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...resumeFiles]
                              .filter(resume => resume.result)
                              .sort((a, b) => {
                                const scoreA = a.result?.comparison.matchScore || 0;
                                const scoreB = b.result?.comparison.matchScore || 0;
                                return scoreB - scoreA;
                              })
                              .map((resume, index) => (
                                <TableRow key={index} className={resume.selected ? "bg-red-50" : ""}>
                                  <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                  <TableCell>
                                    <div className="font-medium">{resume.result?.resumeSummary.name || `Candidate ${index + 1}`}</div>
                                    <div className="text-xs text-gray-500">{resume.file.name}</div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className={`font-bold ${resume.result?.comparison.matchScore || 0 >= 70 ? 'text-green-600' : resume.result?.comparison.matchScore || 0 >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                      {resume.result?.comparison.matchScore}%
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="font-medium">{resume.result?.comparison.matchedSkills.length || 0}</span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="font-medium">{resume.result?.comparison.missingSkills.length || 0}</span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const updatedFiles = resumeFiles.map((r, i) => ({
                                          ...r,
                                          selected: i === resumeFiles.indexOf(resume)
                                        }));
                                        setResumeFiles(updatedFiles);
                                      }}
                                    >
                                      View Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                        <div className="text-center text-sm text-gray-500 mt-4">
                          Ranked by match score (highest first)
                        </div>
                      </CardContent>
                    </Card>

                    {/* Selected candidate details */}
                    {resumeFiles.find(r => r.selected)?.result && (
                      <div className="space-y-6">
                        {/* Main card with score and skills */}
                        <Card className="overflow-hidden">
                          <CardHeader className="pb-0 pt-5">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl font-bold">
                                  {resumeFiles.find(r => r.selected)?.result?.resumeSummary.name || 'Candidate'}
                                </CardTitle>
                              </div>
                              <div className="text-center">
                                <div className="inline-flex flex-col items-center justify-center bg-blue-50 rounded-lg p-3 min-w-24">
                                  <span className="text-3xl font-bold text-blue-600">
                                    {resumeFiles.find(r => r.selected)?.result?.comparison.matchScore}%
                                  </span>
                                  <span className="text-sm text-blue-700">Overall Match</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-5">
                            {/* Skills section */}
                            <div className="space-y-4">
                              {/* Matched Skills */}
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-2">
                                  Matched Skills ({resumeFiles.find(r => r.selected)?.result?.comparison.matchedSkills.length || 0})
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                  {resumeFiles.find(r => r.selected)?.result?.comparison.matchedSkills.map((skill, i) => (
                                    <Badge key={i} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Missing Skills */}
                              {resumeFiles.find(r => r.selected)?.result?.comparison.missingSkills.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Missing Skills ({resumeFiles.find(r => r.selected)?.result?.comparison.missingSkills.length || 0})
                                  </h3>
                                  <div className="flex flex-wrap gap-1">
                                    {resumeFiles.find(r => r.selected)?.result?.comparison.missingSkills.map((skill, i) => (
                                      <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Extra Skills */}
                              {resumeFiles.find(r => r.selected)?.result?.comparison.extraSkills.length > 0 && (
                                <div>
                                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                                    Extra Skills ({resumeFiles.find(r => r.selected)?.result?.comparison.extraSkills.length || 0})
                                  </h3>
                                  <div className="flex flex-wrap gap-1">
                                    {resumeFiles.find(r => r.selected)?.result?.comparison.extraSkills.map((skill, i) => (
                                      <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {/* AI Recruiter Insights */}
                        <Card className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-md flex items-center text-blue-700">
                              <Brain className="h-5 w-5 mr-2" />
                              Recruiter Insights & Interview Tips
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-gray-700 space-y-2">
                              {resumeFiles.find(r => r.selected)?.result?.comparison.suggestions.map((suggestion, i) => (
                                <p key={i}>{suggestion}</p>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500">These insights are designed to help recruiters assess candidate fit and prepare for interviews.</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Resume and Job Summary Cards */}
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Resume Summary */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-md flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Resume Summary
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700">Candidate</h4>
                                <p className="text-sm text-gray-600">{resumeFiles.find(r => r.selected)?.result?.resumeSummary.name}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700">Experience</h4>
                                <p className="text-sm text-gray-600">{resumeFiles.find(r => r.selected)?.result?.resumeSummary.experience}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700">Education</h4>
                                <p className="text-sm text-gray-600">{resumeFiles.find(r => r.selected)?.result?.resumeSummary.education}</p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Job Summary */}
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-md flex items-center">
                                <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                                Job Summary
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700">Position</h4>
                                <p className="text-sm text-gray-600">{resumeFiles.find(r => r.selected)?.result?.jobSummary.title}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700">Key Responsibilities</h4>
                                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                                  {resumeFiles.find(r => r.selected)?.result?.jobSummary.responsibilities.map((resp, i) => (
                                    <li key={i}>{resp}</li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowResult(false);
                        setResumeFiles([]);
                        setJobDescFile(null);
                      }}
                    >
                      Start New Analysis
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
