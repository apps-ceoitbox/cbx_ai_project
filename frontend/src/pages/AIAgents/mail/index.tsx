import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Send, CheckCircle, Mail, Mic, MicOff } from "lucide-react";
import { saveMailSenderHistory } from "@/services/history.service";

// TypeScript definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event & { error: any }) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// Sample email prompt templates
const emailPromptTemplates = [
  {
    name: "Words to Inspire",
    prompt: "Send an email to [mail1@example.com] and [mail2@example.com] separately. Include a motivational quote by Elon Musk that encourages innovation and persistence."
  },
  {
    name: "Meeting Request",
    prompt: "Send an email to [colleague@company.com] to schedule a meeting next week to discuss the quarterly report. Suggest 3 possible time slots: Monday at 10am, Tuesday at 2pm, or Thursday at 11am. From CEOITBOX"
  },
  {
    name: "Thank You Note",
    prompt: "Send an email to [customer@example.com] thanking them for their recent purchase of our premium plan. Express appreciation for their business and ask if they have any questions about getting started."
  },
  {
    name: "Project Update",
    prompt: "Send an email to the team@company.com with an update on the current project status. Mention that we're on track to meet the deadline but need everyone to submit their reports by Friday."
  }
];

// Fixed language for speech recognition - Indian English

const AIMailSender = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [outputMessage, setOutputMessage] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // No processing helper needed as we're handling JSON directly

  // Load webhook URL and auto-resize textarea
  useEffect(() => {
    // Load webhook URL from localStorage
    const savedWebhookUrl = localStorage.getItem('mail_sender_webhook_url');
    setWebhookUrl(savedWebhookUrl || "https://vimes85.app.n8n.cloud/webhook-test/chatbot-agent");
    
    // Auto-resize textarea
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      // Clean up previous instance
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.stop();
        }
      };
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle selecting a template
  const handleSelectTemplate = (prompt: string) => {
    setInput(prompt);
    
    // Focus on the textarea and place cursor at the end
    if (textAreaRef.current) {
      textAreaRef.current.focus();
      const length = prompt.length;
      textAreaRef.current.setSelectionRange(length, length);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setProcessingStep(1);
    setShowResult(false);
    
    try {
      // Step 1: Analyzing request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 2: Preparing email content
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Sending mail
      setProcessingStep(3);
      
      // Connect to n8n webhook for actual processing - using the URL from settings
      
      // Send request to n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      
      // Get the response text
      const responseText = await response.text();
      console.log('Raw n8n response:', responseText);
      
      // Process the response
      try {
        // Try to parse as JSON
        const jsonData = JSON.parse(responseText);
        setResultData(jsonData);
        
        // Extract the output message
        let outputMsg = "Your email request has been processed successfully.";
        if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].output) {
          outputMsg = jsonData[0].output;
        } else if (jsonData.output) {
          outputMsg = jsonData.output;
        } else if (jsonData.message) {
          outputMsg = jsonData.message;
        }
        setOutputMessage(outputMsg);
        
        // Save to history
        const emailDetails = extractEmailDetails(input);
        await saveMailSenderHistory({
          recipient: emailDetails.recipient || "No recipient specified",
          subject: emailDetails.subject || "No prompt", // Using subject field for the prompt
          message: input,
          response: outputMsg
        });
      } catch (e) {
        // If not valid JSON, create a simple object with the text
        const outputMsg = responseText;
        setResultData({
          message: outputMsg,
          details: {
            status: "completed"
          }
        });
        setOutputMessage(outputMsg);
        
        // Save to history even if response is not JSON
        const emailDetails = extractEmailDetails(input);
        await saveMailSenderHistory({
          recipient: emailDetails.recipient || "No recipient specified",
          subject: emailDetails.subject || "No prompt", // Using subject field for the prompt
          message: input,
          response: outputMsg
        });
      }
      setShowResult(true);
    } catch (error) {
      console.error('Error:', error);
      setResultData({
        error: true,
        message: `Error processing your request. Please try again later.`,
        details: {
          status: "failed"
        }
      });
      setOutputMessage(`Error processing your request. Please try again later.`);
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };


  const startSpeechRecognition = () => {
    // Check browser support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Your browser doesn't support speech recognition. Please try a different browser.");
      return;
    }
    
    // Initialize speech recognition
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Fixed to Indian English
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setInput(prev => prev + transcript);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.start();
    setIsListening(true);
    }
  };
  
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleNewRequest = () => {
    setShowResult(false);
    setInput("");
    setProcessingStep(0);
  };
  
  // Helper function to extract email details from the user input
  const extractEmailDetails = (text: string) => {
    const details = {
      recipient: "",
      subject: "" // This field is used for the prompt
    };
    
    // Try different patterns to extract information
    
    // PATTERN 1: Explicit labeling - highest priority
    // Look for "to: email@example.com" or "recipient: email@example.com"
    const explicitRecipientMatch = text.match(/(?:to|recipient|send to|email to):\s*([^\n,;]+)/i);
    if (explicitRecipientMatch && explicitRecipientMatch[1]) {
      details.recipient = explicitRecipientMatch[1].trim();
    }
    
    // Look for "subject: Subject Text" or "re: Subject Text"
    const explicitSubjectMatch = text.match(/(?:subject|re|regarding|about):\s*([^\n]+)/i);
    if (explicitSubjectMatch && explicitSubjectMatch[1]) {
      details.subject = explicitSubjectMatch[1].trim();
    }
    
    // PATTERN 2: Email address detection
    if (!details.recipient) {
      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
      if (emailMatch) {
        details.recipient = emailMatch[0];
      }
    }
    
    // PATTERN 3: Try to extract a meaningful subject if not found
    if (!details.subject) {
      // Split the text into sentences and use the first short sentence as subject
      const sentences = text.split(/[.!?]\s+/);
      if (sentences.length > 0) {
        // Find the first sentence that's not too long and not containing an email address
        for (const sentence of sentences) {
          const cleanSentence = sentence.trim();
          if (cleanSentence.length > 5 && cleanSentence.length < 60 && 
              !cleanSentence.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i)) {
            details.subject = cleanSentence;
            break;
          }
        }
        
        // If still no subject, use first 50 chars of the message
        if (!details.subject && text.length > 0) {
          const firstLine = text.split('\n')[0].trim();
          details.subject = firstLine.length > 50 ? 
            firstLine.substring(0, 47) + '...' : 
            firstLine;
        }
      }
    }
    
    return details;
  };

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link to="/ai-agents">
          <Button variant="outline" className="mr-4 border-gray-300 hover:border-red-600 hover:text-red-600">← Back</Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700 pb-1 inline-block">AI Mail Sender</span>
        </h1>
      </div>
      
      <div id="agent-container" className="w-full max-w-3xl mx-auto bg-white/95 rounded-xl shadow-lg overflow-hidden border border-gray-200/80 backdrop-blur-md transition-all">
        {/* Agent Header */}
        <div className="py-5 px-6 flex items-center border-b border-gray-100 relative bg-white/70">
          <div className="w-11 h-11 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mr-4 text-white shadow-md">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">AI Mail Sender</h1>
        </div>
        
        <div className="p-6">
          {/* Instruction Panel */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
            <p className="text-sm text-gray-600">
              <strong>How to use:</strong> Type your mail request in the format like "Send an email to [email] regarding [subject] or any specific details." and click send.
            </p>
          </div>

          {!showResult && !isLoading && (
            <div className="flex flex-col">
              <div className="relative mb-0 mt-2">
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-red-400 focus-within:border-transparent transition-all">
                  <textarea
                    ref={textAreaRef}
                    className="w-full p-4 focus:outline-none resize-none min-h-[100px] text-gray-700"
                    placeholder="Type your mail request here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                  />
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2 overflow-x-auto max-w-[calc(100%-110px)] py-1">
                      <span className="text-xs text-gray-500 self-center mr-1">Templates:</span>
                      {emailPromptTemplates.map((template, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors whitespace-nowrap"
                          onClick={() => handleSelectTemplate(template.prompt)}
                        >
                          {template.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className={`${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-200 hover:bg-gray-300'} text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-sm`}
                        onClick={() => {
                          if (isListening) {
                            stopSpeechRecognition();
                          } else {
                            startSpeechRecognition();
                          }
                        }}
                        title="Speech to text (Indian English)"
                      >
                        {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-gray-600" />}
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-sm"
                        onClick={handleSendMessage}
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="processing-animation mb-6">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-red-300 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-r-red-400 border-b-transparent border-l-transparent animate-spin animation-delay-200"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-1">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Processing Your Mail Request</h3>
                <p className="text-gray-500 text-sm">Please wait while we handle your request</p>
              </div>
              
              <div className="w-full max-w-md space-y-4">
                <div className={`flex items-center p-3 ${processingStep >= 1 ? 'bg-red-50' : 'bg-gray-50'} rounded-lg transition-all duration-300 border border-transparent ${processingStep === 1 ? 'border-red-200 shadow-sm' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${processingStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all duration-300 ${processingStep === 1 ? 'shadow-md scale-110' : ''}`}>
                    {processingStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
                  </div>
                  <span className="text-gray-700">Analyzing request</span>
                </div>
                
                <div className={`flex items-center p-3 ${processingStep >= 2 ? 'bg-red-50' : 'bg-gray-50'} rounded-lg transition-all duration-300 border border-transparent ${processingStep === 2 ? 'border-red-200 shadow-sm' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${processingStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all duration-300 ${processingStep === 2 ? 'shadow-md scale-110' : ''}`}>
                    {processingStep > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
                  </div>
                  <span className="text-gray-700">Preparing email content</span>
                </div>
                
                <div className={`flex items-center p-3 ${processingStep >= 3 ? 'bg-red-50' : 'bg-gray-50'} rounded-lg transition-all duration-300 border border-transparent ${processingStep === 3 ? 'border-red-200 shadow-sm' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${processingStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'} transition-all duration-300 ${processingStep === 3 ? 'shadow-md scale-110' : ''}`}>
                    {processingStep > 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
                  </div>
                  <span className="text-gray-700">Sending mail</span>
                </div>
              </div>
            </div>
          )}

          {showResult && (
            <div className="py-6">
              <div className={`mb-6 flex items-center ${resultData?.error ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} p-4 rounded-xl border shadow-sm`}>
                <div className={`w-10 h-10 ${resultData?.error ? 'bg-red-500' : 'bg-green-500'} rounded-full flex items-center justify-center text-white mr-4 shadow-sm`}>
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{resultData?.error ? 'Operation Failed' : 'Operation Completed'}</h3>
                  <p className="text-sm text-gray-500">{resultData?.error ? 'There was an error processing your request' : 'Your email request has been processed'}</p>
                </div>
              </div>
              
              <div className="bg-white p-0 rounded-xl mb-6 border border-gray-200 shadow-sm overflow-hidden">
                {/* Email details card */}
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-1">Email Details</h4>
                  <p className="text-sm text-gray-500">Summary of your processed request</p>
                </div>
                
                <div className="p-5 space-y-4">
                  {/* Message section */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-2">Message</h5>
                    <p className="text-base text-gray-800 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      {resultData?.message || "Request processed successfully"}
                    </p>
                  </div>
                  
                  {/* Details section */}
                  {resultData?.details && (
                    <div className="pt-2">
                      <h5 className="text-sm font-medium text-gray-500 mb-3">Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(resultData.details).map(([key, value]) => (
                          <div key={key} className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 mr-2"></div>
                            <div>
                              <span className="text-sm font-medium text-gray-700 capitalize">{key}: </span>
                              <span className="text-sm text-gray-600">{String(value)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* If there's more complex data, we can display it here */}
                  {resultData && resultData.additionalInfo && (
                    <div className="pt-2 border-t border-gray-100 mt-4">
                      <h5 className="text-sm font-medium text-gray-500 mb-2">Additional Information</h5>
                      <pre className="bg-gray-50 p-3 rounded-lg text-xs text-gray-700 overflow-auto max-h-40 border border-gray-100">
                        {JSON.stringify(resultData.additionalInfo, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {/* Output Message */}
                  <div className="pt-2 border-t border-gray-100 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-500">API Response</h5>
                      <span className="text-xs text-gray-400 italic">Output from n8n</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-800 leading-relaxed">
                      {outputMessage}
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                onClick={handleNewRequest}
              >
                <span className="text-sm font-medium">Start New Request</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMailSender;
