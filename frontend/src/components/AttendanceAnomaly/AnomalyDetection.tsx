import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Loader2, MessageSquare, User, Brain, Download, Printer } from 'lucide-react';
import { AttendanceData, AnalysisResult, Anomaly, PolicyConfig } from './types';
import { Visualizations } from './Visualizations';
import { Button } from '@/components/ui/button';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';

interface AnomalyDetectionProps {
  data: AttendanceData;
  policyConfig: PolicyConfig;
  apiKey: string;
  aiProvider: {
    name: string;
    model: string;
  };
  policiesApplied: boolean;
  onAnalysisComplete?: (result: AnalysisResult | null) => void;
}

export const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({
  data,
  policyConfig,
  apiKey,
  aiProvider,
  policiesApplied,
  onAnalysisComplete,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groupedAnomalies, setGroupedAnomalies] = useState<Record<string, Anomaly[]>>({});
  const contentRef = useRef<HTMLDivElement>(null);

  // Function to prepare data for the AI model
  const prepareDataForAI = () => {
    // Convert attendance data to a format suitable for the AI model
    const attendanceData = {
      records: data.records.map(record => ({
        employeeId: record.employeeId,
        name: record.name,
        dailyRecords: record.dailyRecords.map(dailyRecord => ({
          day: dailyRecord.day,
          checkIn: dailyRecord.checkIn,
          checkOut: dailyRecord.checkOut,
          isOff: dailyRecord.isOff,
          isAbsent: dailyRecord.isAbsent,
          isHalfDay: dailyRecord.isHalfDay,
          flags: dailyRecord.flags,
          isHoliday: dailyRecord.isHoliday,
        })),
      })),
      month: data.month,
      year: data.year,
      headers: data.headers, // Add the missing headers property
    };

    // Convert policy config to a format suitable for the AI model
    const policyData = {
      checkInTime: policyConfig.checkInTime,
      checkOutTime: policyConfig.checkOutTime,
      requiredHours: policyConfig.requiredHours,
      sundayHoliday: policyConfig.sundayHoliday,
      secondSaturdayHoliday: policyConfig.secondSaturdayHoliday,
      customHolidays: policyConfig.customHolidays,
    };

    return { attendanceData, policyData };
  };

  // Function to construct the prompt for the AI model
  const constructPrompt = (data: { attendanceData: AttendanceData; policyData: PolicyConfig }) => {
    const monthName = new Date(data.attendanceData.year, data.attendanceData.month).toLocaleString('default', { month: 'long' });
    
    return `
    You are an AI assistant specialized in analyzing attendance data and identifying anomalies or patterns.
    
    Please analyze the following attendance data for ${monthName} ${data.attendanceData.year} and identify any anomalies or patterns:
    
    Attendance Data:
    ${JSON.stringify(data.attendanceData, null, 2)}
    
    Policy Configuration:
    ${JSON.stringify(data.policyData, null, 2)}
    
    Please provide your analysis in the following JSON format:
    {
      "summary": "A brief summary of your overall findings",
      "recommendations": ["List of recommendations based on the findings"],
      "criticalFindings": ["List of critical issues that require immediate attention"],
      "moderateConcerns": ["List of moderate concerns that should be addressed"],
      "positivePatterns": ["List of positive attendance patterns worth acknowledging"],
      "anomalies": [
        {
          "employeeId": "Employee ID",
          "name": "Employee Name",
          "description": "Description of the anomaly",
          "frequency": "How often this occurs",
          "affectedDays": [list of affected days],
          "type": "Type of anomaly (e.g., 'attendance', 'timing', 'pattern')",
          "severity": "high/medium/low"
        }
      ],
      "statistics": {
        "totalEmployees": "Total number of employees",
        "totalWorkdays": "Total number of workdays",
        "averageAttendance": "Average attendance percentage",
        "lateArrivalPercentage": "Percentage of late arrivals",
        "earlyDeparturePercentage": "Percentage of early departures",
        "absenteeismRate": "Rate of absenteeism"
      }
    }
    
    Focus on identifying patterns such as:
    1. Frequent late arrivals or early departures
    2. Absence patterns (e.g., specific days of the week)
    3. Employees with the most policy violations
    4. Unusual check-in/check-out times
    5. Attendance trends across the organization
    
    Provide actionable recommendations based on your findings.
    `;
  };

  // Function to call the AI API
  const callAIAPI = async (prompt: string) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      let response;
      let responseData;

      // Call the appropriate AI API based on the provider
      if (aiProvider.name === 'Gemini' || aiProvider.name === 'Gemini (Google)') {
        // Google Gemini API
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${aiProvider.model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 8192,
            }
          }),
        });

        responseData = await response.json();
        return responseData.candidates[0].content.parts[0].text;
      } else if (aiProvider.name === 'OpenAI' || aiProvider.name === 'ChatGPT (OpenAI)') {
        // OpenAI API
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: aiProvider.model,
            messages: [{
              role: 'user',
              content: prompt
            }],
            temperature: 0.2,
            max_tokens: 4000,
          }),
        });

        responseData = await response.json();
        // Format the response content to be displayed in the same style as Gemini
        const content = responseData.choices[0].message.content;
        
        // Process the content to match Gemini's formatting
        // Convert markdown to HTML similar to how Gemini formats its responses
        return content;
      } else if (aiProvider.name === 'Anthropic' || aiProvider.name === 'Claude (Anthropic)' || aiProvider.name === 'Claude') {
        // Anthropic API
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: aiProvider.model,
            messages: [{
              role: 'user',
              content: prompt
            }],
            max_tokens: 4000,
          }),
        });

        responseData = await response.json();
        if (responseData.error) {
          throw new Error(`Anthropic API error: ${responseData.error.message || 'Unknown error'}`);
        }
        return responseData.content[0].text;
      } else {
        throw new Error(`Unsupported AI provider: ${aiProvider.name}. Supported providers are: Gemini, Gemini (Google), OpenAI, ChatGPT (OpenAI), Anthropic, Claude (Anthropic), and Claude.`);
      }
    } catch (err) {
      console.error('Error calling AI API:', err);
      throw err;
    }
  };

  // Function to parse JSON from the AI response
  const parseJsonFromResponse = (response: string): AnalysisResult => {
    try {
      // Try to parse the entire response as JSON first
      try {
        return JSON.parse(response);
      } catch (e) {
        // If that fails, look for JSON within markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1]);
        }

        // Try to find JSON object with expected keys using regex
        const jsonRegex = /\{[\s\S]*?"summary"[\s\S]*?"recommendations"[\s\S]*?"anomalies"[\s\S]*?\}/;
        const match = response.match(jsonRegex);
        if (match) {
          return JSON.parse(match[0]);
        }

        // If all else fails, try to manually extract JSON-like structure
        const manualExtract = repairTruncatedJson(response);
        if (manualExtract) {
          return manualExtract;
        }

        throw new Error('Could not parse JSON from response');
      }
    } catch (error) {
      console.error('Error parsing JSON from response:', error);
      console.log('Raw response:', response);
      
      // Provide a default structure if parsing fails
      return {
        summary: 'Failed to parse analysis results. Please try again.',
        recommendations: ['Review the attendance data manually.'],
        anomalies: [],
        statistics: {
          totalEmployees: data.records.length,
          totalWorkingDays: 0,  // Changed from totalWorkdays to match interface
          averageAttendance: 0,
          lateArrivalPercentage: 0,
          earlyDeparturePercentage: 0,
          // Remove absenteeismRate as it doesn't exist in the interface
          averageAttendanceRate: 0,  // Add missing required properties
          lateArrivals: 0,
          earlyDepartures: 0,
          workHourShortfalls: 0,
          policyViolations: 0,
          holidayWork: 0
        },
      };
    }
  };

  // Function to validate and normalize the analysis result
  const validateAndNormalizeResult = (result: any): AnalysisResult => {
    // Process the summary to ensure consistent formatting between different AI providers
    let summary = result.summary || 'No summary provided';
    
    // If the provider is ChatGPT (OpenAI), format the summary to match Gemini's style
    if (aiProvider.name === 'OpenAI' || aiProvider.name === 'ChatGPT (OpenAI)') {
      // Convert plain text or markdown to HTML similar to Gemini's output
      // Replace newlines with <br> tags for consistent display
      summary = summary.replace(/\n/g, '<br>');
      // Wrap paragraphs in <p> tags if they aren't already
      if (!summary.includes('<p>')) {
        summary = `<p>${summary}</p>`;
      }
    }
    
    // Ensure all required fields are present
    const validatedResult: AnalysisResult = {
      summary: summary,
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : ['No recommendations provided'],
      anomalies: [],
      statistics: result.statistics || {},
      criticalFindings: Array.isArray(result.criticalFindings) ? result.criticalFindings : [],
      moderateConcerns: Array.isArray(result.moderateConcerns) ? result.moderateConcerns : [],
      positivePatterns: Array.isArray(result.positivePatterns) ? result.positivePatterns : [],
    };

    // Normalize anomalies to match the expected interface
    if (Array.isArray(result.anomalies)) {
      validatedResult.anomalies = result.anomalies.map((anomaly: any) => ({
        employeeId: anomaly.employeeId,
        employeeName: anomaly.employeeName || anomaly.name || 'Unknown Employee',
        type: anomaly.type || 'Unknown',
        description: anomaly.description || '',
        severity: anomaly.severity || 'medium',
        frequency: anomaly.frequency || 0,
        affectedDays: Array.isArray(anomaly.affectedDays) ? anomaly.affectedDays : [],
      }));
    }

    // If statistics are missing, calculate some basic ones from the anomalies
    if (!result.statistics || Object.keys(result.statistics).length === 0) {
      validatedResult.statistics = {
        totalEmployees: data.records.length,
        totalWorkingDays: new Date(data.year, data.month + 1, 0).getDate(), // Changed from totalWorkdays to totalWorkingDays
        averageAttendance: 0, // Would need more data to calculate
        lateArrivalPercentage: 0,
        earlyDeparturePercentage: 0,
        // Remove absenteeismRate as it doesn't exist in the interface
        averageAttendanceRate: 0, // Add missing required properties
        lateArrivals: 0,
        earlyDepartures: 0,
        workHourShortfalls: 0,
        policyViolations: 0,
        holidayWork: 0
      };
    }

    return validatedResult;
  };

  // Function to group anomalies by employee
  const groupAnomaliesByEmployee = (anomalies: Anomaly[]) => {
    const grouped: Record<string, Anomaly[]> = {};
    
    anomalies.forEach(anomaly => {
      const employeeId = anomaly.employeeId;
      if (!grouped[employeeId]) {
        grouped[employeeId] = [];
      }
      grouped[employeeId].push(anomaly);
    });
    
    return grouped;
  };

  // Function to merge anomaly details for display
  const mergeAnomalyDetails = (anomalies: Anomaly[]): Anomaly => {
    if (anomalies.length === 0) {
      throw new Error('No anomalies to merge');
    }
    
    const first = anomalies[0];
    
    // Merge descriptions
    const descriptions = anomalies.map(a => a.description);
    const uniqueDescriptions = [...new Set(descriptions)];
    
    // Merge frequencies
    const frequencies = anomalies.map(a => a.frequency);
    const uniqueFrequencies = [...new Set(frequencies)];
    
    // Merge affected days
    const allAffectedDays = anomalies.flatMap(a => a.affectedDays || []);
    const uniqueAffectedDays = [...new Set(allAffectedDays)].sort((a, b) => a - b);
    
    // Merge types
    const types = anomalies.map(a => a.type);
    const uniqueTypes = [...new Set(types)];
    
    return {
      employeeId: first.employeeId,
      name: first.name || first.employeeName || '', // Add the required name property
      employeeName: first.employeeName || first.name, // Handle both name formats
      description: uniqueDescriptions.join(' '),
      frequency: typeof first.frequency === 'number' ? first.frequency : uniqueFrequencies.length, // Convert to number
      affectedDays: uniqueAffectedDays,
      type: uniqueTypes.join(', '),
      severity: first.severity || 'medium', // Default to medium if not provided
    };
  };

  // Function to run the analysis
  const runAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Prepare data for the AI model
      const preparedData = prepareDataForAI();
      
      // Construct the prompt
      const prompt = constructPrompt({
        attendanceData: preparedData.attendanceData,
        policyData: {
          ...preparedData.policyData,
          showWorkedHours: true // Add missing required property
        }
      });
      
      // Call the AI API
      const response = await callAIAPI(prompt);
      
      // Parse the response
      const parsedResult = parseJsonFromResponse(response);
      
      // Validate and normalize the result
      const validatedResult = validateAndNormalizeResult(parsedResult);
      
      // Group anomalies by employee
      const grouped = groupAnomaliesByEmployee(validatedResult.anomalies);
      
      // Update state
      setAnalysisResult(validatedResult);
      setGroupedAnomalies(grouped);
      
      // Call the onAnalysisComplete callback if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(validatedResult);
      }
    } catch (err) {
      console.error('Error running analysis:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // We no longer automatically run analysis when component mounts
  // Instead, we'll let the user click the button to run analysis after policies are applied
  useEffect(() => {
    console.log('AnomalyDetection useEffect - apiKey:', apiKey ? 'API key exists' : 'No API key', 'length:', apiKey?.length);
    console.log('AnomalyDetection useEffect - apiKey raw value:', JSON.stringify(apiKey));
    console.log('AnomalyDetection useEffect - aiProvider:', aiProvider?.name, 'model:', aiProvider?.model);
    console.log('AnomalyDetection useEffect - policiesApplied:', policiesApplied);
    
    // Check if apiKey is a valid string and not just whitespace
    const isValidApiKey = typeof apiKey === 'string' && apiKey.trim() !== '';
    console.log('AnomalyDetection useEffect - isValidApiKey:', isValidApiKey);
    
    if (!isValidApiKey) {
      console.warn('Cannot run analysis: API key is missing or empty');
    }
  }, [data, policyConfig, apiKey, aiProvider, policiesApplied]);

  // Only show API key warning if it's actually missing or empty
  const isValidApiKey = typeof apiKey === 'string' && apiKey.trim() !== '';
  console.log('AnomalyDetection render - apiKey:', apiKey ? 'API key exists' : 'No API key', 'length:', apiKey?.length, 'trimmed length:', apiKey?.trim()?.length || 0);
  console.log('AnomalyDetection render - apiKey raw value:', JSON.stringify(apiKey));
  console.log('AnomalyDetection render - isValidApiKey:', isValidApiKey);
  
  if (!isValidApiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
          <h3 className="text-lg font-medium text-yellow-800">API Key Required</h3>
        </div>
        <p className="mt-2 text-sm text-yellow-700">
          Please configure an API key for {aiProvider?.name || 'AI provider'} in the AI Agent Settings to use the anomaly detection feature.
        </p>
        <p className="mt-2 text-xs text-yellow-600">
          Current API key status: {apiKey === undefined ? 'undefined' : apiKey === null ? 'null' : apiKey === '' ? 'empty string' : `string of length ${apiKey.length}`}
        </p>
      </div>
    );
  }

  // Show loading state
  if (isAnalyzing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
        <div className="text-center py-12">
          {/* Enhanced loading animation with more visible elements */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full border-4 border-red-100 mx-auto flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-t-red-600 border-r-red-600 border-b-transparent border-l-transparent animate-spin"></div>
              <Brain className="w-10 h-10 text-red-600 absolute animate-pulse" />
            </div>
            
            {/* More visible pulsing circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-red-300 opacity-75 animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-red-200 opacity-50 animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-red-100 opacity-30 animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-3 animate-pulse">Analyzing Attendance Data</h3>
          
          <div className="max-w-md mx-auto bg-red-50 rounded-lg p-4 border border-red-100 mb-4">
            <p className="text-gray-700 mb-3">
              AI is processing <span className="font-semibold text-red-700">{data.records.length} employee records</span> to identify patterns and anomalies...
            </p>
            
            {/* Animated progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
              <div className="bg-red-600 h-2.5 rounded-full animate-progress-indeterminate"></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Analyzing data</span>
              <span>Generating insights</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-red-600 animate-spin mr-2" />
            <span>This may take a few moments. Complex patterns require deeper analysis.</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
          <h3 className="text-lg font-medium text-red-800">Analysis Error</h3>
        </div>
        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          onClick={runAnalysis}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show analysis results
  // Function to handle PDF download
  const handleDownloadPDF = () => {
    if (!contentRef.current) return;
    
    // Add a temporary class for PDF styling
    contentRef.current.classList.add('printing');
    
    const options = {
      margin: 10,
      filename: `Attendance_Analysis_${data.month + 1}_${data.year}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        foreignObjectRendering: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape',
        compress: true,
        precision: 2,
        putOnlyUsedFonts: true
      }
    };
    
    // Add temporary styles for better PDF rendering
    const tempStyle = document.createElement('style');
    tempStyle.innerHTML = `
      @media print {
        body * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .chart-container canvas {
          max-height: none !important;
        }
      }
    `;
    document.head.appendChild(tempStyle);
    
    // Create a properly structured promise for toast.promise
    const generatePDF = new Promise((resolve, reject) => {
      html2pdf()
        .set(options)
        .from(contentRef.current)
        .save()
        .then(() => {
          // Remove the temporary class and style
          contentRef.current?.classList.remove('printing');
          document.head.removeChild(tempStyle);
          resolve('PDF generated successfully');
        })
        .catch(err => {
          console.error('PDF generation error:', err);
          // Remove the temporary class and style even if there's an error
          contentRef.current?.classList.remove('printing');
          document.head.removeChild(tempStyle);
          reject(err); // Reject the promise to trigger the toast error
        });
    });
    
    toast.promise(generatePDF, {
      loading: 'Generating PDF...',
      success: 'PDF downloaded successfully!',
      error: 'Failed to generate PDF'
    });
  };
  
  // Function to save analysis to history
  
  // Function to handle printing
  const handlePrint = () => {
    if (!contentRef.current) return;
    
    // Add a temporary class for print styling
    contentRef.current.classList.add('printing');
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Unable to open print window. Please check your popup settings.');
      contentRef.current.classList.remove('printing');
      return;
    }
    
    // Get all stylesheets from the current document
    const styleSheets = Array.from(document.styleSheets);
    let styleText = '';
    
    // Extract CSS rules from stylesheets
    styleSheets.forEach(sheet => {
      try {
        if (sheet.cssRules) {
          const rules = Array.from(sheet.cssRules);
          rules.forEach(rule => {
            styleText += rule.cssText + '\n';
          });
        }
      } catch (e) {
        console.warn('Could not access stylesheet rules', e);
      }
    });
    
    // Additional print-specific styles
    const additionalStyles = `
      @media print {
        body { 
          padding: 20px; 
          font-family: Arial, sans-serif;
          color: black;
          background-color: white;
        }
        .no-print { display: none !important; }
        .print-section { 
          page-break-inside: avoid; 
          break-inside: avoid; 
          margin-bottom: 20px; 
        }
        .chart-container { 
          page-break-inside: avoid; 
          break-inside: avoid; 
          margin-bottom: 20px; 
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      body { 
        font-family: Arial, sans-serif; 
        padding: 20px; 
        color: black;
        background-color: white;
      }
      h1, h2, h3, h4, h5, h6 {
        color: black;
        margin-top: 1em;
        margin-bottom: 0.5em;
      }
      .chart-container { 
        page-break-inside: avoid; 
        margin-bottom: 20px; 
      }
      .print-section {
        margin-bottom: 20px;
      }
    `;
    
    // Write the content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Analysis - ${data.month + 1}/${data.year}</title>
          <style>
            ${styleText}
            ${additionalStyles}
          </style>
        </head>
        <body>
          <h1>Attendance Analysis - ${data.month + 1}/${data.year}</h1>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);
    
    // Wait for content to load then print
    printWindow.document.close();
    
    // Handle errors and cleanup
    const cleanup = () => {
      contentRef.current?.classList.remove('printing');
    };
    
    printWindow.onload = () => {
      try {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
          cleanup();
        };
      } catch (error) {
        console.error('Print error:', error);
        toast.error('An error occurred while printing. Please try again.');
        printWindow.close();
        cleanup();
      }
    };
    
    // Fallback cleanup in case onload doesn't fire
    printWindow.onerror = () => {
      toast.error('Failed to load print preview. Please try again.');
      printWindow.close();
      cleanup();
    };
  };

  return (
    <div className="space-y-6">
      {/* Full content for PDF/Print - Only shown when analysis result is available */}
      {analysisResult && (
        <>
          <div className="mt-8" ref={contentRef}>
            {/* Analysis Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 print-section">
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                  Attendance Anomaly Summary
                </h3>
                {/* Render the summary HTML from AI API */}
                <div dangerouslySetInnerHTML={{ __html: analysisResult.summary }} />
                {/* Critical Findings */}
                {analysisResult.criticalFindings && analysisResult.criticalFindings.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-red-700 mb-2">Critical Findings</h4>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <ul className="list-disc pl-8 space-y-1">
                        {analysisResult.criticalFindings.map((finding, index) => (
                          <li key={index} className="text-sm text-red-800">{finding}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {/* Moderate Concerns */}
                {analysisResult.moderateConcerns && analysisResult.moderateConcerns.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-orange-700 mb-2">Moderate Concerns</h4>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <ul className="list-disc pl-8 space-y-1">
                        {analysisResult.moderateConcerns.map((concern, index) => (
                          <li key={index} className="text-sm text-orange-800">{concern}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {/* Positive Patterns */}
                {analysisResult.positivePatterns && analysisResult.positivePatterns.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold text-green-700 mb-2">Positive Patterns</h4>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <ul className="list-disc pl-8 space-y-1">
                        {analysisResult.positivePatterns.map((pattern, index) => (
                          <li key={index} className="text-sm text-green-800">{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {/* Statistics */}
                {analysisResult.statistics && Object.keys(analysisResult.statistics).length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(analysisResult.statistics).map(([key, value]) => (
                      <div key={key} className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <p className="text-xs text-purple-700 uppercase font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {typeof value === 'number' && key.toLowerCase().includes('percentage') 
                            ? `${value.toFixed(1)}%` 
                            : value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Recommendations */}
            {analysisResult.recommendations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 print-section">
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                    Recommendations
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <p className="text-sm text-green-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* Detected Anomalies */}
            {Object.keys(groupedAnomalies).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 print-section">
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 text-red-600 mr-2" />
                    Detected Anomalies by Employee
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedAnomalies).map(([employeeId, anomalies]) => {
                      const mergedAnomaly = mergeAnomalyDetails(anomalies);
                      return (
                        <div key={employeeId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
                          <div className="p-4 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                              <h4 className="font-medium text-gray-900">{mergedAnomaly.employeeName}</h4>
                              <span className="text-sm text-gray-600">({mergedAnomaly.employeeId})</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${mergedAnomaly.severity === 'high' ? 'bg-red-100 text-red-800' : mergedAnomaly.severity === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>{mergedAnomaly.severity} priority</span>
                            </div>
                            <div className="space-y-3">
                              <div className="text-sm">
                                <p className="text-gray-700">{mergedAnomaly.description}</p>
                                <div className="text-xs text-gray-500 mt-2 space-y-1">
                                  <div className="flex items-start">
                                    <span className="font-medium mr-1">Type:</span>
                                    <span>{mergedAnomaly.type}</span>
                                  </div>
                                  <div className="flex items-start">
                                    <span className="font-medium mr-1">Frequency:</span>
                                    <span>{mergedAnomaly.frequency}</span>
                                  </div>
                                  {mergedAnomaly.affectedDays && mergedAnomaly.affectedDays.length > 0 && (
                                    <div className="flex items-start">
                                      <span className="font-medium mr-1">Affected days:</span>
                                      <span>{mergedAnomaly.affectedDays.join(', ')}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {/* Attendance Visualizations */}
            <div className="print-section">
              <Visualizations
                data={data}
                selectedMonth={data.month}
                selectedYear={data.year}
                policyConfig={policyConfig}
                analysisResult={analysisResult}
              />
            </div>
          </div>
          {/* Export Buttons - Not included in print/PDF */}
          <div className="flex justify-center mt-8 space-x-4 no-print">
            <Button
              onClick={handleDownloadPDF}
              className="bg-appRed hover:bg-appRed/90 text-white flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-gray-600 hover:bg-gray-700 text-white flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </Button>
          </div>
        </>
      )}
      {/* AI Analysis Button - Only enabled when policies have been applied */}
      {!isAnalyzing && !analysisResult && (
        <div className="flex flex-col items-center mt-8">
          <button
            className={`inline-flex items-center px-6 py-3 rounded-lg shadow-lg text-base font-medium transition-all duration-300 ${policiesApplied ? 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:shadow-xl hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            onClick={runAnalysis}
            disabled={!policiesApplied || isAnalyzing}
            style={{
              borderWidth: policiesApplied ? '1px' : '0',
              borderColor: policiesApplied ? 'rgba(255,255,255,0.2)' : 'transparent',
              borderStyle: 'solid',
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-3" />
                <span>Run AI Analysis</span>
              </>
            )}
          </button>
          {!policiesApplied && (
            <p className="text-sm text-gray-500 mt-3 text-center max-w-md">
              Please apply policies first before running AI analysis
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to attempt to repair truncated JSON
function repairTruncatedJson(jsonStr: string): AnalysisResult | null {
  try {
    // First try to parse as is
    return JSON.parse(jsonStr);
  } catch (error) {
    console.log('Attempting to repair truncated JSON');
    
    // Check if it's a truncation issue
    if (error instanceof SyntaxError) {
      console.log('SyntaxError detected, attempting to extract valid parts');
      
      // Try to extract valid parts
      const summaryMatch = /"summary"\s*:\s*"([^"]*(?:\\"[^"]*)*)"/.exec(jsonStr);
      const anomaliesMatch = /"anomalies"\s*:\s*(\[\s*\{[^\]]*\}\s*(?:,\s*\{[^\]]*\}\s*)*\])/.exec(jsonStr);
      const recommendationsMatch = /"recommendations"\s*:\s*(\[\s*"[^\]]*"\s*(?:,\s*"[^\]]*"\s*)*\])/.exec(jsonStr);
      
      console.log('Extraction results:', {
        summaryFound: !!summaryMatch,
        anomaliesFound: !!anomaliesMatch,
        recommendationsFound: !!recommendationsMatch,
        summaryContent: summaryMatch ? summaryMatch[1].substring(0, 50) + '...' : 'none',
        anomaliesContent: anomaliesMatch ? anomaliesMatch[1].substring(0, 50) + '...' : 'none',
        recommendationsContent: recommendationsMatch ? recommendationsMatch[1].substring(0, 50) + '...' : 'none'
      });
      
      if (summaryMatch || anomaliesMatch || recommendationsMatch) {
        const result: AnalysisResult = {
          summary: '',
          anomalies: [],
          recommendations: [],
          statistics: {
            totalEmployees: 0,
            totalWorkingDays: 0,
            averageAttendance: 0,  // Add missing property
            lateArrivalPercentage: 0,  // Add missing property
            earlyDeparturePercentage: 0,  // Add missing property
            averageAttendanceRate: 0,
            lateArrivals: 0,
            earlyDepartures: 0,
            workHourShortfalls: 0,
            policyViolations: 0,
            holidayWork: 0
          }
        };
        
        // Extract summary if available
        if (summaryMatch && summaryMatch[1]) {
          result.summary = summaryMatch[1].replace(/\\\\n/g, '\n').replace(/\\"/g, '"');
          console.log('Successfully extracted summary');
        } else {
          result.summary = '<h3>Analysis Summary</h3><p>The analysis was completed but with incomplete results. Some data may be missing.</p>';
        }
        
        // Extract anomalies if available
        if (anomaliesMatch && anomaliesMatch[1]) {
          try {
            const parsedAnomalies = JSON.parse(anomaliesMatch[1]);
            // Normalize anomalies to match the expected interface
            result.anomalies = parsedAnomalies.map((anomaly: any) => ({
              employeeId: anomaly.employeeId || 'unknown',
              employeeName: anomaly.employeeName || anomaly.name || 'Unknown Employee',
              type: anomaly.type || 'Unknown',
              description: anomaly.description || '',
              severity: anomaly.severity || 'medium',
              frequency: anomaly.frequency || 0,
              affectedDays: Array.isArray(anomaly.affectedDays) ? anomaly.affectedDays : [],
            }));
            console.log('Successfully extracted anomalies');
          } catch (e) {
            console.log('Failed to parse anomalies JSON:', e);
            result.anomalies = [];
          }
        }
        
        // Extract recommendations if available
        if (recommendationsMatch && recommendationsMatch[1]) {
          try {
            result.recommendations = JSON.parse(recommendationsMatch[1]);
            console.log('Successfully extracted recommendations');
          } catch (e) {
            console.log('Failed to parse recommendations JSON:', e);
            // Try a more flexible approach to extract recommendations
            try {
              // Try to clean up the recommendations string before parsing
              const cleanedRecommendations = recommendationsMatch[1]
                .replace(/\\n/g, '')
                .replace(/\\r/g, '')
                .replace(/\\t/g, '')
                .replace(/\\\\n/g, '')
                .replace(/\\\\r/g, '')
                .replace(/\\\\t/g, '');
              result.recommendations = JSON.parse(cleanedRecommendations);
              console.log('Successfully extracted recommendations after cleaning');
            } catch (cleanError) {
              console.log('Failed to parse cleaned recommendations JSON:', cleanError);
              // Try to extract individual recommendations using regex
              const recommendationItems = recommendationsMatch[1].match(/"([^"]*(?:\\"[^"]*)*)"(?:,|\s*\])/);
              if (recommendationItems && recommendationItems.length > 0) {
                result.recommendations = recommendationItems.map(item => {
                  return item.replace(/"/, '').replace(/"(?:,|\s*\])$/, '').replace(/\\"/g, '"');
                });
                console.log('Successfully extracted recommendations using regex');
              } else {
                result.recommendations = [
                  'Review attendance patterns regularly',
                  'Consider implementing flexible work hours',
                  'Encourage open communication about attendance issues'
                ];
              }
            }
          }
        } else {
          result.recommendations = [
            'Review attendance patterns regularly',
            'Consider implementing flexible work hours',
            'Encourage open communication about attendance issues'
          ];
        }
        
        console.log('Repaired JSON result:', result);
        return result;
      }
    }
    
    return null;
  }
}