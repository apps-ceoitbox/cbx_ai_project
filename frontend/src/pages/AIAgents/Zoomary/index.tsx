import { useState, useEffect, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { generateMeetingSummary, extractTranscriptFromZoomUrl } from "@/services/aiService";
import { parseVttContent } from "@/services/vttParser";
import { saveZoomaryHistory } from "@/services/history.service";
import { toast } from "sonner";
import { useAxios } from "@/context/AppContext";
import { ArrowLeft, Copy, Download } from "lucide-react";



const ZoomaryAI = () => {
  const axios = useAxios("user");
  const [activeTab, setActiveTab] = useState<string>("url");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [zoomUrl, setZoomUrl] = useState<string>("");

  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState<any>('');
  const [aiModel, setAiModel] = useState<string>('');

  // Summary result and editing
  const [summaryHtml, setSummaryHtml] = useState<string>("");
  const [editableSummary, setEditableSummary] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // VTT file handling
  const [manualVttUrl, setManualVttUrl] = useState<string>("");
  const [showManualDownload, setShowManualDownload] = useState<boolean>(false);

  // Add a new state for manual VTT content
  const [manualVttContent, setManualVttContent] = useState<string>("");


  useEffect(() => {
    axios.get("/aiagentsettings").then((res) => {
      const settings = res?.data?.data;
      if (!Array.isArray(settings)) return;
      const zoomarySetting = settings?.find(item => item.name === "Zoomary");
      setApiKey(zoomarySetting?.apikey);
      setSelectedModel(zoomarySetting?.aiProvider?.name);
      setAiModel(zoomarySetting?.aiProvider?.model)
    });
  }, []);

  // Show processing step updates
  const updateProcessingStep = (step: string) => {
    setProcessingStep(step);
  };

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // Read VTT file content
  const readVttFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          resolve(e.target.result);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  // Function for direct download of VTT file with UI feedback
  const downloadVttFile = async (vttUrl: string): Promise<boolean> => {
    try {
      // Create a hidden anchor element to trigger the download
      const a = document.createElement('a');
      a.href = vttUrl;
      a.download = 'zoom-transcript.vtt'; // Set the filename
      a.target = '_blank'; // Open in new tab to help with download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Also try opening in a hidden iframe as a fallback
      const downloadFrame = document.createElement('iframe');
      downloadFrame.style.display = 'none';
      downloadFrame.src = vttUrl;
      document.body.appendChild(downloadFrame);

      // Wait for a short time to allow the download to start
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Clean up
      if (downloadFrame.parentNode) {
        downloadFrame.parentNode.removeChild(downloadFrame);
      }

      return true;
    } catch (error) {
      console.error("Error downloading VTT file:", error);
      return false;
    }
  };

  // Generate summary using selected AI model
  const generateSummary = async () => {
    try {
      setError(null);
      setIsLoading(true);
      setShowResult(false);
      setShowManualDownload(false); // Reset manual download state
      setProcessingStep("Initializing...");

      if (!apiKey) {
        throw new Error("Please enter an API key for the selected model");
      }

      let transcript = "";

      // Get transcript content based on active tab
      if (activeTab === "url") {
        if (!zoomUrl) {
          throw new Error("Please enter a Zoom recording URL");
        }

        // Try to get transcript using the improved extraction function from aiService
        try {
          updateProcessingStep("Extracting transcript from Zoom URL...");
          transcript = await extractTranscriptFromZoomUrl(zoomUrl);
          updateProcessingStep("Transcript extracted successfully");
        } catch (error) {
          console.error("Error extracting transcript:", error);

          // Check if error contains a VTT URL we can use for manual download
          const errorMessage = (error as Error).message;
          const urlMatch = errorMessage.match(/https:\/\/zoom\.us\/rec\/play\/vtt[^\s\n]+/);

          if (urlMatch) {
            const vttUrl = urlMatch[0];
            console.log("Found VTT URL for manual download:", vttUrl);

            // Set up for manual download
            setError(
              "Could not automatically extract the transcript due to browser security restrictions. " +
              "Please use the download buttons below to get the transcript file."
            );
            setManualVttUrl(vttUrl);
            setShowManualDownload(true);

            // Switch to the upload tab to prepare for manual upload
            setActiveTab("upload");

            // Focus the manual VTT content textarea after a short delay
            setTimeout(() => {
              const textareaElement = document.getElementById('manual-vtt-textarea');
              if (textareaElement) {
                textareaElement.scrollIntoView({ behavior: 'smooth' });
                (textareaElement as HTMLTextAreaElement).focus();
              }
            }, 500);

            setIsLoading(false);
            setProcessingStep("");
            return; // Exit early
          } else {
            // No VTT URL found, show generic error
            throw new Error(`Could not extract transcript from Zoom URL: ${(error as Error).message}`);
          }
        }
      } else {
        // Upload tab - check for file upload or manually pasted content
        if (selectedFile) {
          // Process uploaded file
          try {
            updateProcessingStep("Processing uploaded VTT file...");
            console.log("Reading uploaded VTT file:", selectedFile.name);
            const vttContent = await readVttFile(selectedFile);
            transcript = parseVttContent(vttContent);
            console.log("Transcript processed from file, length:", transcript.length);
            updateProcessingStep("VTT file processed successfully");
          } catch (error) {
            console.error("Error reading VTT file:", error);
            throw new Error(`Could not read VTT file: ${(error as Error).message}`);
          }
        } else if (manualVttContent.trim()) {
          // Process manually pasted VTT content
          try {
            updateProcessingStep("Processing manually pasted VTT content...");
            console.log("Processing manually pasted VTT content");
            transcript = parseVttContent(manualVttContent);
            console.log("Transcript processed from pasted content, length:", transcript.length);
            updateProcessingStep("Manual VTT content processed successfully");
          } catch (error) {
            console.error("Error processing pasted VTT:", error);
            throw new Error(`Could not process pasted VTT content: ${(error as Error).message}`);
          }
        } else {
          throw new Error("Please either select a VTT file to upload or paste VTT content");
        }
      }

      // Validate transcript
      if (!transcript || transcript.length < 10) {
        throw new Error("The extracted transcript is too short or empty. Please check the VTT content and try again.");
      }
      updateProcessingStep("Generating summary...");

      // Use the AI service
      try {
        const summaryHtml = await generateMeetingSummary(transcript, apiKey, selectedModel, aiModel);
        console.log("Summary generated successfully");

        // Display the result
        setSummaryHtml(summaryHtml);
        setShowResult(true);
        updateProcessingStep("Summary generated successfully");

        // Auto-save the summary to history
        try {
          const title = `Meeting Summary - ${new Date().toLocaleDateString()}`;

          // Use the zoom URL as the recording link if it's available
          const recordingLink = activeTab === 'url' && zoomUrl ? zoomUrl : '';

          await saveZoomaryHistory({
            title,
            summary: summaryHtml,
            meetingDate: new Date(),
            recordingLink
          });
          console.log('Summary saved to history successfully');
          toast.success('Summary saved to history');
        } catch (saveError) {
          console.error('Error saving summary to history:', saveError);
          toast.error('Failed to save summary to history');
        }
      } catch (aiError) {
        console.error("AI summary generation error:", aiError);
        throw new Error(`Error generating summary: ${(aiError as Error).message}`);
      }

    } catch (error) {
      console.error("Final error in summary generation:", error);
      setError((error as Error).message);
      setShowResult(false);
    } finally {
      setIsLoading(false);
      setProcessingStep("");
    }
  };

  // Handle editing summary
  const saveSummaryEdit = () => {
    setSummaryHtml(editableSummary);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  // Handle copy to clipboard
  const copySummaryToClipboard = async () => {
    const contentElement = document.getElementById("summary-content");
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

  // Handle PDF download
  const downloadSummaryAsPdf = () => {
    const element = document.getElementById('summary-content');
    if (!element) {
      toast.error("Could not find summary content to download");
      return;
    }

    // Get current date in format DD/MM/YYYY
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    // Open print dialog to save as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Meeting Summary</title>
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
              .zoomary-title { 
                font-size: 16px; 
                color: #e11d48; 
                font-weight: 500; 
              }
              .summary-text {
                font-size: 16px;
                color: #333;
                margin-left: 4px;
                font-weight: normal;
              }
              .model-badge { 
                background-color: #fee2e2; 
                color: #b91c1c; 
                font-size: 13px;
                padding: 4px 12px;
                border-radius: 16px;
                display: flex;
                align-items: center;
                height: 22px;
              }
              .model-badge svg {
                margin-right: 6px;
              }
              .date { 
                color: #666; 
                font-size: 14px; 
              }
              h1 { color: #e11d48; font-size: 1.8rem; border-bottom: 2px solid #e11d48; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
              h2 { color: #b91c1c; font-size: 1.5rem; margin-top: 1.5rem; border-bottom: 1px solid #fee2e2; padding-bottom: 0.3rem; }
              h3 { color: #b91c1c; font-size: 1.2rem; margin-top: 1rem; }
              p { margin-bottom: 1rem; line-height: 1.6; }
              ul { margin-bottom: 1rem; padding-left: 1.5rem; }
              li { margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-left">
                <div class="title-wrapper">
                  <span class="zoomary-title">Zoomary AI</span>
                  <span class="summary-text">Summary</span>
                </div>
                
              </div>
              <div class="date">Generated on ${formattedDate}</div>
            </div>
            ${summaryHtml}
          </body>
        </html>
      `);
      printWindow.document.close();

      // Delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    } else {
      toast.error("Could not open print window. Please check your browser settings.");
    }
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <Link to="/ai-agents" className="mb-6 inline-block">
        <Button style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
          className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
          variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <Card className="bg-white shadow-xl border-none rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white border-none pb-8">
          <CardTitle className="text-4xl font-bold text-center">AI Zoom Summary</CardTitle>
          <CardDescription className="text-center text-white/80 mt-2">
            Enter a Zoom recording URL or upload a transcript file to generate a detailed meeting summary
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6 px-8 pb-8 -mt-4">
          <div className="bg-white shadow-lg rounded-lg p-6 -mt-10 mb-6 border border-gray-100">
            <Tabs defaultValue="url" onValueChange={value => setActiveTab(value as string)}>
              <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="url"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md"
                >
                  Zoom Recording URL
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md"
                >
                  Upload Transcript
                </TabsTrigger>
              </TabsList>

              <TabsContent value="url" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-black">Zoom Recording URL</h3>
                  <Input
                    placeholder="https://zoom.us/rec/play/example-recording-url"
                    value={zoomUrl}
                    onChange={(e) => setZoomUrl(e.target.value)}
                    className="w-full bg-gray-50 border-gray-200 focus:border-red-400 focus:ring-red-400 transition-colors"
                  />
                  <p className="text-sm text-gray-600 mt-1">Enter your Zoom recording URL here</p>
                </div>

                <Alert className="bg-red-50 border border-red-100 text-gray-800 rounded-lg">
                  <AlertDescription className="flex items-start">
                    <svg className="h-5 w-5 mr-2 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">If you encounter CORS errors, please use the "Upload Transcript" tab instead.</p>
                      <p className="mt-1">Browser security restrictions may prevent direct access to Zoom transcripts. Downloading and uploading the transcript file manually is the most reliable solution.</p>
                    </div>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-red-200 bg-gray-50 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".vtt"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div>
                      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="mb-2 text-sm font-medium text-gray-900">File selected:</p>
                      <p className="text-sm text-gray-600 bg-white py-2 px-4 rounded-md inline-block border border-gray-200">
                        {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <svg className="mx-auto h-16 w-16 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-4 text-base font-medium text-red-800">Select a transcript file to upload</p>
                      <p className="mt-1 text-sm text-red-600/80">Transcript files contain the text of your Zoom meeting</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                  )}
                </div>

                {/* Add manual VTT content paste option */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-2 text-black">Or Paste Transcript Content Directly</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    You can manually copy the transcript content and paste it here:
                  </p>
                  <ol className="list-decimal list-inside text-sm text-gray-600 mb-4 space-y-2">
                    <li>Open the transcript link in a new tab</li>
                    <li>Select all content (Ctrl+A) and copy it (Ctrl+C)</li>
                    <li>Paste the content (Ctrl+V) in the textarea below</li>
                  </ol>
                  <Textarea
                    value={manualVttContent}
                    onChange={(e) => setManualVttContent(e.target.value)}
                    placeholder="WEBVTT&#10;1&#10;00:00:16.230 --> 00:00:18.359&#10;Speaker: Hello everyone..."
                    className="min-h-[150px] font-mono text-sm bg-gray-50 border-gray-200 focus:border-red-400 focus:ring-red-400"
                    id="manual-vtt-textarea"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6 mt-6">

            {/* Processing status indicator */}
            {isLoading && processingStep && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-gray-700 text-sm flex items-center shadow-sm">
                <div className="animate-spin mr-3">
                  <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="font-medium">{processingStep}</div>
              </div>
            )}

            {showManualDownload && (
              <div className="bg-black/5 border border-red-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-red-600 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Transcript Download
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  We've located the transcript file for this meeting. Use one of the methods below to access it:
                </p>
                <div className="p-3 bg-white border border-red-100 rounded-lg text-sm font-mono text-gray-800 break-all shadow-inner">
                  {manualVttUrl}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => navigator.clipboard.writeText(manualVttUrl)}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy URL
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => window.open(manualVttUrl, '_blank')}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-700 hover:bg-red-800 text-white"
                    onClick={() => downloadVttFile(manualVttUrl)}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Transcript
                  </Button>
                </div>

                <div className="mt-5 bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to use the transcript file:
                  </h4>
                  <ol className="list-decimal list-inside text-sm text-gray-800 space-y-1.5">
                    <li>Click <strong>Download Transcript</strong> to save the transcript file</li>
                    <li>Switch to the <strong>Upload Transcript</strong> tab above</li>
                    <li>Upload the downloaded file or copy-paste its contents</li>
                    <li>Then click "Generate Summary" to proceed</li>
                  </ol>
                </div>

                <div className="mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg shadow-sm transition-colors"
                    onClick={() => {
                      setActiveTab("upload");
                      setTimeout(() => {
                        const textareaElement = document.getElementById('manual-vtt-textarea');
                        if (textareaElement) {
                          textareaElement.scrollIntoView({ behavior: 'smooth' });
                          (textareaElement as HTMLTextAreaElement).focus();
                        }
                      }, 100);
                    }}
                  >
                    Switch to Upload Tab
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={generateSummary}
              disabled={isLoading || !zoomUrl}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-medium text-base shadow-lg shadow-red-600/20 transition-all duration-200 border-0 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Summary...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generate Summary
                </span>
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {showResult && (
            <div className="mt-10">
              <div className="bg-red-800 text-white p-5 rounded-t-xl flex justify-between items-center">
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <h3 className="text-xl font-bold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Meeting Summary
                  </h3>
                  <p className="text-[14px]">     Generated on{" "}
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
                <div className="bg-red-50/50 p-6 rounded-b-xl border border-red-100 shadow-lg space-y-4">
                  <Textarea
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className="min-h-[400px] font-mono text-sm bg-white border-red-200 focus:border-red-400 focus:ring-red-400"
                  />
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveSummaryEdit}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  id="summary-content"
                  className="prose max-w-none bg-red-50/50 p-6 rounded-b-xl border border-red-100 shadow-lg [&>h1]:text-red-600 [&>h2]:text-red-600 [&>h3]:text-red-600 [&>h4]:text-red-600 [&>h5]:text-red-600 [&>h6]:text-red-600 [&>ul>li]:marker:text-red-500 [&>ol>li]:marker:text-red-500 [&>blockquote]:border-l-red-500 [&>a]:text-red-600 [&>p]:text-red-900/80"
                  dangerouslySetInnerHTML={{ __html: summaryHtml }}
                />
              )}

              <div className="w-full flex items-center justify-center mt-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center"
                    onClick={copySummaryToClipboard}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>

                  <Button variant="outline" className="flex items-center" onClick={downloadSummaryAsPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>

                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ZoomaryAI;