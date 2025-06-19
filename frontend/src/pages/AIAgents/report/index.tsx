import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, BarChart3, Brain, CheckCircle, Copy, Eye, File, FileText, Loader2, Upload } from "lucide-react";
import { useAxios } from "@/context/AppContext";
import { saveReportHistory } from "@/services/report-history.service";

const ReportAgentAI = () => {
  const axios = useAxios("user");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("claude-sonnet-4");
  const [apiKey, setApiKey] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [htmlReport, setHtmlReport] = useState<string>("");
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true);
  // State for Google Sheets URL
  const [sheetsUrl, setSheetsUrl] = useState<string>("");
  const [isUrlMode, setIsUrlMode] = useState<boolean>(false);

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await axios.get("/aiagentsettings");
        const settings = response?.data?.data;

        if (Array.isArray(settings)) {
          const reportAgentSetting = settings.find(item => item.name === "ReportAgent");

          if (reportAgentSetting) {
            // Set model from settings
            if (reportAgentSetting?.aiProvider?.model) {
              setSelectedModel(reportAgentSetting.aiProvider.model);
            }

            // Set API key from settings
            if (reportAgentSetting?.apikey) {
              setApiKey(reportAgentSetting?.apikey);
              localStorage.setItem('ai-api-key', reportAgentSetting.apikey);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        // Fall back to localStorage if available
        const storedApiKey = localStorage.getItem('ai-api-key');
        const storedModel = localStorage.getItem('ai-api-model');

        if (storedApiKey) setApiKey(storedApiKey);
        if (storedModel) setSelectedModel(storedModel);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setSheetsUrl(""); // Clear URL when file is uploaded
    setIsUrlMode(false);
    setError(null);
    toast.success("File uploaded successfully!");
  };


  // Process the file or Google Sheets URL
  const processFile = async () => {
    if (!uploadedFile && !isUrlMode) {
      toast.error("Please upload a file or provide a Google Sheets URL");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      let fileText = "";
      let fileName = "";
      let fileType = "";

      if (uploadedFile) {
        // Extract text from the uploaded file
        fileText = await extractTextFromFile(uploadedFile);
        fileName = uploadedFile.name;
        fileType = uploadedFile.type;
      } else if (isUrlMode && sheetsUrl) {
        // Handle Google Sheets URL
        fileText = await fetchGoogleSheetsData(sheetsUrl);
        fileName = "Google Sheets";
        fileType = "spreadsheet";
      }

      // Generate AI prompt - now async
      const prompt = await generatePrompt(fileText);

      // Generate report using AI
      const reportHtml = await generateReport(prompt, selectedModel);

      setHtmlReport(reportHtml);

      // Save to history
      try {
        await saveReportHistory({
          fileName,
          fileType,
          report: reportHtml
        });
      } catch (historyError) {
        console.error("Error saving to history:", historyError);
        // Don't show error to user, just log it
      }

      toast.success("Report generated successfully!");
    } catch (err) {
      console.error("Error processing data:", err);
      setError(err.message || "Failed to process data");
      toast.error("Failed to generate report");
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch data from Google Sheets
  const fetchGoogleSheetsData = async (url: string): Promise<string> => {
    try {
      // Extract the sheet ID from the URL
      const sheetIdMatch = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch || !sheetIdMatch[1]) {
        throw new Error("Invalid Google Sheets URL format");
      }

      const sheetId = sheetIdMatch[1];

      // For public Google Sheets, we can use the export URL directly
      // This doesn't require an API key and works for sheets that are publicly accessible
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      console.log("Fetching Google Sheets data from:", exportUrl);

      const response = await fetch(exportUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch Google Sheets data: ${response.status} ${response.statusText}. Make sure the Google Sheet is shared with 'Anyone with the link can view'.`);
      }

      // Get the CSV content directly
      const csvContent = await response.text();

      if (!csvContent) {
        throw new Error("No data received from Google Sheets");
      }

      return csvContent;
    } catch (error) {
      console.error("Error fetching Google Sheets data:", error);
      throw new Error(`Failed to fetch Google Sheets data: ${error.message}`);
    }
  };

  // Extract text from file
  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          resolve(text);
        } catch (error) {
          reject(new Error("Failed to extract text from file"));
        }
      };

      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };

      if (file.type === "application/pdf") {
        // For PDF files, we're just reading as text for now
        // In a real implementation, you'd use a PDF parsing library
        reader.readAsText(file);
      } else {
        // For CSV, Excel, JSON, and text files
        reader.readAsText(file);
      }
    });
  };

  // Generate prompt for AI
  // Default prompt to use if none is saved in settings
  const defaultPrompt = `
Analyze the following financial data and create a comprehensive report with visualizations:

{fileContent}

Analysis Requirements (REQUIRED):
- Provide detailed written analysis of:
  1. Overall financial health and key observations
  2. Spending patterns and anomalies
  3. Income trends and projections
  4. Recommendations based on the data
  5. Areas of concern or opportunity

Display Requirements:
- IMPORTANT: All charts and visualizations MUST be created using inline SVG format only
- SVG charts must include proper viewBox, width, and height attributes
- Use vector-based elements (path, rect, circle, etc.) for all chart components
- Include tooltips in SVG elements using title tags for better interactivity
- Ensure SVG charts have clear labels, legends, and axes when applicable
- Style all HTML and SVG elements using inline CSS
- Ensure responsive and scrollable layout
- Include a detailed executive summary section
- Organize content in logical sections

Reference Rules (if applicable):
- Indian Financial Year: April to March
- GST: 18% (CGST 9% + SGST 9%)
- Currency: Indian Rupees (₹) formatted with commas (e.g., ₹1,00,000)

HTML Structure:
Start with:
<div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-size: 16px; line-height: 1.6;">
  ...content and charts...
</div>

Style Rules:
- Text color: #2c3e50
- Accent color: #c0392b
- Font: 'Segoe UI', sans-serif
- Charts must be 100% width with overflow-x: auto if needed
- Use a consistent color palette across all visualizations

🚫 Do Not:
- Use JavaScript, markdown, or external stylesheets
- Use canvas, img tags, or any non-SVG visualization methods
- Include comments or skip over any part of the data
- Truncate the report - ensure it is complete
- MOST IMPORTANTLY: DO NOT recreate tables that already exist in the data

✅ Goal:
Generate a complete, styled, printable HTML report focused on visualizations, insights, and analysis that provides actionable intelligence based on the uploaded data. The report should be comprehensive, detailed, and visually appealing.`;

  // Function to fetch custom prompt from settings or use default
  const fetchCustomPrompt = async (): Promise<string | null> => {
    try {
      const response = await axios.get("/aiagentsettings");
      const settings = response?.data?.data;

      if (!Array.isArray(settings)) return null;

      const reportAgentSetting = settings?.find(item => item.name === "ReportAgent");

      if (!reportAgentSetting || !reportAgentSetting.promptContent) return null;

      return reportAgentSetting?.promptContent;
    } catch (error) {
      console.error("Error fetching custom prompt:", error);
      return null;
    }
  };

  const generatePrompt = async (fileContent: string): Promise<string> => {
    // Try to get custom prompt from settings
    const customPrompt = await fetchCustomPrompt();

    // Use custom prompt if available, otherwise use default
    let promptTemplate = customPrompt || defaultPrompt;

    // Replace {fileContent} placeholder with actual content
    return promptTemplate.replace("{fileContent}", fileContent);
  };

  // Generate report using AI API
  const generateReport = async (prompt: string, model: string): Promise<string> => {
    // Use API key from settings
    if (!apiKey) {
      throw new Error('API key is not configured. Please configure it in AI Agent Settings.');
    }

    let apiEndpoint = '';
    let requestBody = {};
    let headers = {};

    // Normalize model name (remove version suffix if present)
    const baseModel = model.replace(/-\d{8}$/, '');

    // Configure API request based on selected model
    switch (baseModel) {
      case 'claude-sonnet-4':
      case 'claude-opus-4':
        apiEndpoint = 'https://api.anthropic.com/v1/messages';

        // Use the model name as is if it includes the date version, otherwise add it
        let apiModel = model;
        if (!model.includes('-202')) {
          if (baseModel === 'claude-sonnet-4') {
            apiModel = 'claude-sonnet-4-20250514';
          } else if (baseModel === 'claude-opus-4') {
            apiModel = 'claude-opus-4-20250514';
          }
        }



        requestBody = {
          model: apiModel,
          max_tokens: 64000,
          temperature: 0.7,
          messages: [{
            role: 'user',
            content: prompt
          }]
        };

        headers = {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        };
        break;

      default:
        throw new Error(`Unsupported model: ${model}`);
    }

    try {
      console.log(`Sending request to ${apiEndpoint} for model ${model}`);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      console.log("resss", response)

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('API Error:', errorData);
        throw new Error(`API request failed with status ${response.status}: ${errorData?.error?.message || response.statusText}`);
      }

      const data = await response.json();

      // Extract the HTML content from the response based on the model
      let htmlContent = '';

      if (model.startsWith('claude')) {
        htmlContent = data.content[0].text;
      }

      // Validate that we received HTML content
      if (!htmlContent || !htmlContent.includes('<div')) {
        console.error('Invalid response format:', htmlContent);
        throw new Error('The AI model did not return a properly formatted HTML report');
      }

      // Check for potential truncation and fix if needed
      if (!htmlContent.includes('</div>') || !htmlContent.trim().endsWith('</div>')) {
        console.warn('HTML content appears to be truncated, attempting to fix...');
        // Add closing div if missing
        htmlContent = htmlContent + '\n</div>';
      }

      // Ensure the HTML is properly structured
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;

      // If there are any unclosed tags, the browser will automatically close them
      htmlContent = tempDiv.innerHTML;

      return htmlContent;
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  };

  // File Upload Component
  const FileUpload = ({ onFileUpload }) => {
    // Initialize local state from parent state to ensure consistency
    const [localUploadedFile, setLocalUploadedFile] = useState<File | null>(uploadedFile);
    const [localSheetsUrl, setLocalSheetsUrl] = useState<string>(sheetsUrl);
    const [localIsUrlMode, setLocalIsUrlMode] = useState<boolean>(isUrlMode);

    // Keep local state in sync with parent state
    useEffect(() => {
      setLocalUploadedFile(uploadedFile);
      setLocalSheetsUrl(sheetsUrl);
      setLocalIsUrlMode(isUrlMode);
    }, [uploadedFile, sheetsUrl, isUrlMode]);

    const onDrop = useCallback((acceptedFiles: FileList | null) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setLocalUploadedFile(file);
        setLocalSheetsUrl("");
        setLocalIsUrlMode(false);
        onFileUpload(file);
      }
    }, [onFileUpload]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onDrop(e.target.files);
    };

    const handleLocalSheetsUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSheetsUrl(e.target.value);
      if (localUploadedFile) {
        setLocalUploadedFile(null);
      }
    };

    const handleLocalUrlSubmit = () => {
      if (!localSheetsUrl) {
        toast.error("Please enter a Google Sheets URL");
        return;
      }

      // Validate URL format
      if (!localSheetsUrl.includes("docs.google.com/spreadsheets")) {
        toast.error("Please enter a valid Google Sheets URL");
        return;
      }

      setLocalIsUrlMode(true);
      setSheetsUrl(localSheetsUrl);
      setIsUrlMode(true);
      setUploadedFile(null);
      toast.success("Google Sheets URL added successfully!");
    };

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
      <Card className="w-full mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-gray-900">Upload Financial Data</h3>
          </div>

          {/* File Upload Section */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${localUploadedFile ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-red-600"
              }`}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept=".csv,.xls,.xlsx,.json,.txt"
            />

            {localUploadedFile ? (
              <div className="space-y-3">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-medium text-green-700">{localUploadedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {formatFileSize(localUploadedFile.size)} • {localUploadedFile.type || 'Unknown type'}
                  </p>
                </div>
                <p className="text-sm text-green-600">
                  File uploaded successfully! Click Process to analyze.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <File className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drag & drop your financial data
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Support for CSV, Excel, JSON, and text files
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  No structure validation required • All formats accepted
                </p>
              </div>
            )}
          </div>

          {/* Divider with OR text */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500">OR</span>
            </div>
          </div>

          {/* Google Sheets URL Section */}
          <div className={`border-2 rounded-lg p-6 ${localIsUrlMode ? "border-green-500 bg-green-50" : "border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-gray-900">Use Google Sheets URL</h3>
            </div>

            {localIsUrlMode ? (
              <div className="space-y-3">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <p className="text-sm text-green-700 font-medium text-center">
                  Google Sheets URL added successfully!
                </p>
                <p className="text-xs text-green-600 text-center break-all">
                  {localSheetsUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setLocalSheetsUrl("");
                    setLocalIsUrlMode(false);
                    setSheetsUrl("");
                    setIsUrlMode(false);
                  }}
                >
                  Clear URL
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste Google Sheets URL here"
                    value={localSheetsUrl}
                    onChange={handleLocalSheetsUrlChange}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleLocalUrlSubmit}
                    disabled={!localSheetsUrl}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter a publicly accessible Google Sheets URL containing your financial data (recommended: approx. 1,200 rows max)
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p className="font-medium mb-2">Supported formats:</p>
            <div className="grid grid-cols-2 gap-1">
              <span>• CSV files (.csv)</span>
              <span>• Sheet files (.xls)</span>
              <span>• Excel files (.xlsx)</span>
              <span>• JSON files (.json)</span>
              <span>• Text files (.txt)</span>
              <span>• Google Sheets (URL)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Process Button Component
  const ProcessButton = ({ onProcess, disabled }) => {
    return (
      <Card className="w-full mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-red-600" />
            <h3 className="font-medium text-gray-900">Process Document</h3>
          </div>

          <div className="space-y-4">
            <Button
              onClick={onProcess}
              disabled={disabled || isLoadingSettings}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isLoadingSettings ? "Loading settings..." : "Process Document"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Processing Status Component
  const ProcessingStatus = () => {
    const [progress, setProgress] = useState<number>(15);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [elapsedTime, setElapsedTime] = useState<number>(0);

    // Steps in the report generation process
    const steps = [
      { icon: FileText, label: 'Extracting file content', completed: true, percentage: 15 },
      { icon: Brain, label: 'AI analysis in progress', completed: false, active: true, percentage: 40 },
      { icon: BarChart3, label: 'Generating visualizations', completed: false, percentage: 30 },
      { icon: CheckCircle, label: 'Report ready', completed: false, percentage: 15 }
    ];

    // Simulate progress
    useEffect(() => {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);

        // Update progress based on elapsed time
        if (elapsedTime < 10) {
          // First 10 seconds - step 1 (extraction)
          setProgress(15);
          setCurrentStep(0);
        } else if (elapsedTime < 120) {
          // Next 110 seconds - step 2 (AI analysis)
          const analysisProgress = 15 + ((elapsedTime - 10) / 110) * 40;
          setProgress(Math.min(55, analysisProgress));
          setCurrentStep(1);
        } else if (elapsedTime < 180) {
          // Next 60 seconds - step 3 (visualization)
          const vizProgress = 55 + ((elapsedTime - 120) / 60) * 30;
          setProgress(Math.min(85, vizProgress));
          setCurrentStep(2);
        } else {
          // Final step - report ready
          const finalProgress = 85 + ((elapsedTime - 180) / 20) * 15;
          setProgress(Math.min(99, finalProgress)); // Never reach 100% until actually done
          setCurrentStep(3);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [elapsedTime]);

    // Format time remaining estimate
    const getTimeEstimate = () => {
      const totalEstimatedTime = 200; // seconds
      const remaining = Math.max(0, totalEstimatedTime - elapsedTime);

      if (remaining > 60) {
        return `approximately ${Math.ceil(remaining / 60)} minutes`;
      } else {
        return `less than a minute`;
      }
    };

    return (
      <Card className="w-full mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                <h3 className="font-medium text-gray-900">Processing Your Data</h3>
              </div>
              <div className="text-sm font-medium text-red-600">{Math.floor(progress)}%</div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-red-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isActive
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                      {isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <IconComponent className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${isCompleted
                        ? 'text-green-700 font-medium'
                        : isActive
                          ? 'text-red-700 font-medium'
                          : 'text-gray-500'
                        }`}>
                        {step.label}
                      </span>
                      {isActive && (
                        <div className="w-full mt-1 bg-gray-100 rounded-full h-1">
                          <div
                            className="bg-red-400 h-1 rounded-full transition-all duration-300 ease-in-out"
                            style={{
                              width: index === 1 ? `${((progress - 15) / 40) * 100}%` :
                                index === 2 ? `${((progress - 55) / 30) * 100}%` :
                                  index === 3 ? `${((progress - 85) / 15) * 100}%` : '100%'
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-100">
              <div className="flex items-start gap-3">
                <div className="animate-pulse">
                  <Brain className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-700 font-medium mb-1">
                    AI Report Generation in Progress
                  </p>
                  <p className="text-sm text-red-600">
                    Your financial data is being analyzed to generate comprehensive insights, charts, and summaries.
                    This process typically takes 3-4 minutes to complete. Estimated time remaining: {getTimeEstimate()}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Report Display Component
  const ReportDisplay = ({ htmlContent }) => {
    const copyReport = () => {
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          const blob = new Blob([htmlContent], { type: "text/html" });
          const clipboardItem = new ClipboardItem({ "text/html": blob });
          navigator.clipboard.write([clipboardItem])
            .then(() => toast.success("Report copied to clipboard!"))
            .catch(err => {
              console.error("Copy failed:", err);
              toast.error("Failed to copy report");
            });
        } catch (err) {
          console.error("Copy failed:", err);
          toast.error("Failed to copy report");
        }
      } else {
        // Fallback for browsers that don't support ClipboardItem
        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlContent;
        const textContent = tempElement.textContent || tempElement.innerText || '';
        navigator.clipboard.writeText(textContent)
          .then(() => toast.success("Report copied to clipboard (text only)!"))
          .catch(() => toast.error("Failed to copy report"));
      }
    };

    const printReport = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Add proper HTML structure for better printing
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Financial Report ${new Date().toLocaleDateString()}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            ${htmlContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    };

    if (!htmlContent) {
      return (
        <Card className="w-full h-96 border border-gray-100 shadow-sm overflow-hidden">
          <CardContent className="flex items-center justify-center h-full p-0">
            <div className="text-center space-y-6 max-w-md px-6 py-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-5">
                  <BarChart3 className="w-48 h-48 text-red-600" />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-red-50 p-4 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Report Generated</h3>
                  <div className="h-1 w-16 bg-red-600 rounded-full mb-4"></div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Upload a financial data file and click "Process Document" to see your analysis here
              </p>
              <div className="pt-4">
                <div className="inline-flex items-center px-4 py-2 border border-red-200 rounded-md bg-red-50 text-red-700">
                  <Brain className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">AI-Powered Financial Analysis</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full border border-gray-100 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Financial Report
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyReport} className="text-xs border-red-200 text-red-700 hover:bg-red-50">
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={printReport} className="text-xs border-red-200 text-red-700 hover:bg-red-50">
                <Eye className="w-4 h-4 mr-1" />
                Print
              </Button>
            </div>
          </div>
          <div
            className="overflow-auto max-h-[800px] border rounded-lg p-6 shadow-inner"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </CardContent>
      </Card>
    );
  };



  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link to="/ai-agents">
          <Button
            style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
            className="bg-primary-red  hover:bg-red-700 transition-colors duration-200 mr-4"
            variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-red-500">
          Report Agent AI
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-1 space-y-4">
          <FileUpload onFileUpload={handleFileUpload} />
          <ProcessButton
            onProcess={processFile}
            disabled={(!uploadedFile && !isUrlMode) || isProcessing}
          />
          {isProcessing && <ProcessingStatus />}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Report Display */}
        <div className="lg:col-span-2">
          <ReportDisplay htmlContent={htmlReport} />
        </div>
      </div>
    </div>
  );
};

export default ReportAgentAI;