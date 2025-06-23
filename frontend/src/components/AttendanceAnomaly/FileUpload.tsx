import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, Calendar, Download, Database } from 'lucide-react';
import Papa from 'papaparse';
import { AttendanceData, AttendanceRecord, DailyRecord } from './types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FileUploadProps {
  onFileUpload: (data: AttendanceData) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedMonth, setDetectedMonth] = useState<number | null>(null);
  const [detectedYear, setDetectedYear] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // Guidance is now permanently shown, no need for state variable
  const csvDataRef = useRef<string>(''); // Store the original CSV data
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const parseCSVData = (csvData: string): AttendanceData => {
    // Ensure we have valid CSV data
    if (!csvData || csvData.trim() === '') {
      throw new Error('Empty CSV data');
    }
    
    // Split by lines and filter out empty lines
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    
    // Check if we have enough rows
    if (lines.length < 3) { // We need at least header, check-in/out row, and one data row
      throw new Error('Insufficient rows to process the file');
    }

    const headers = lines[0].split(',').map(header => header.trim());
    const dataLines = lines.slice(1);

    // Extract days from headers
    const days: number[] = [];
    for (let i = 2; i < headers.length; i++) {
      const parts = headers[i].split(' ');
      if (parts.length >= 2 && parts[0] === 'DAY') {
        const day = parseInt(parts[1]);
        if (!isNaN(day) && !days.includes(day)) {
          days.push(day);
        }
      }
    }
    days.sort((a, b) => a - b);
    
    // Detect month and year based on pattern analysis
    // For this implementation, we'll use the current month/year as default
    // but in a real scenario, this could be derived from the data pattern
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    // Only update state for confirmation dialog if this is the initial parse
    // Don't update if we're re-parsing after confirmation
    if (!showConfirmation) {
      setDetectedMonth(month);
      setDetectedYear(year);
      setShowConfirmation(true);
    }

    // Parse the second row which contains Check-IN/Check-OUT headers

    const records: AttendanceRecord[] = dataLines.slice(1).map(line => {
      const cells = line.split(',').map(cell => cell.trim());
      const employeeId = cells[0];
      const name = cells[1];

      const dailyRecords: DailyRecord[] = days.map(day => {
        // Find the column indices for this day's check-in and check-out
        // The pattern in the CSV is that each day has two columns (Check-IN, Check-OUT)
        const dayIndex = (day - 1) * 2 + 2; // Starting from column 2 (0-indexed)
        
        const checkIn = cells[dayIndex] === 'OFF' || !cells[dayIndex] ? null : cells[dayIndex];
        const checkOut = cells[dayIndex + 1] === 'OFF' || !cells[dayIndex + 1] ? null : cells[dayIndex + 1];
        
        const isOff = cells[dayIndex] === 'OFF' || cells[dayIndex + 1] === 'OFF';
        const isAbsent = !checkIn && !checkOut && !isOff;
        // Ensure isHalfDay is always a boolean value
        const isHalfDay: boolean = Boolean((checkIn && !checkOut) || (!checkIn && checkOut));

        return {
          day,
          checkIn,
          checkOut,
          isOff,
          isAbsent,
          isHalfDay,
          isHoliday: false, // Adding the missing isHoliday property
          flags: []
        };
      });

      return {
        employeeId,
        name,
        dailyRecords
      };
    });

    return {
      headers,
      records,
      month: detectedMonth !== null ? detectedMonth : month,
      year: detectedYear !== null ? detectedYear : year
    };
  };

  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsProcessing(true);
    setError('');
    setFileName(file.name);

    Papa.parse(file, {
      complete: (results) => {
        try {
          const csvData = results.data.map((row: string[]) => 
            Array.isArray(row) ? row.join(',') : row
          ).join('\n');
          
          // Store the CSV data for later use
          csvDataRef.current = csvData;
          
          // Parse the CSV data but don't call onFileUpload yet
          // We'll wait for the user to confirm the month/year
          parseCSVData(csvData);
          setIsProcessing(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
          setIsProcessing(false);
        }
      },
      error: (error) => {
        setError(`CSV parsing error: ${error.message}`);
        setIsProcessing(false);
      }
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };
  
  const loadSampleData = async () => {
    try {
      setIsProcessing(true);
      setError('');
      
      const response = await fetch('/sampledata.csv');
      if (!response.ok) {
        throw new Error('Failed to load sample data');
      }
      
      const csvData = await response.text();
      csvDataRef.current = csvData;
      setFileName('sampledata.csv');
      
      // Parse the CSV data but don't call onFileUpload yet
      // We'll wait for the user to confirm the month/year
      parseCSVData(csvData);
      setIsProcessing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample data');
      setIsProcessing(false);
    }
  };
  
  const downloadExcelTemplate = async () => {
    try {
      // Fetch the template file from the public directory
      const response = await fetch('/attendance_template.xlsx');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download template');
    }
  };
  
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const monthValue = parseInt(e.target.value);
    setDetectedMonth(monthValue);
  };
  
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetectedYear(parseInt(e.target.value));
  };
  
  const handleConfirmDateSelection = () => {
    if (detectedMonth !== null && detectedYear !== null && csvDataRef.current) {
      try {
        // Parse the CSV data again
        const csvData = csvDataRef.current;
        
        // Make sure we have the CSV data in the correct format
        if (!csvData || csvData.trim() === '') {
          setError('No valid CSV data available');
          return;
        }
        
        // Parse the CSV data
        const attendanceData = parseCSVData(csvData);
        
        // Override with the selected month and year
        attendanceData.month = detectedMonth;
        attendanceData.year = detectedYear;
        
        onFileUpload(attendanceData);
        setShowConfirmation(false);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      }
    } else {
      setError('No CSV data available. Please upload a file first.');
    }
  };

  return (
    <div className="space-y-4">
      
      {!showConfirmation ? (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadSampleData}
                    className="flex items-center gap-2 shadow-sm transition-all hover:shadow bg-white border-red-300 hover:border-red-400 text-gray-700 hover:text-red-600"
                    disabled={isProcessing}
                  >
                    <Database className="h-4 w-4 text-appRed" />
                    Load Sample Data
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-red-50 border-red-300 text-gray-800">
                  <p className="text-xs">Load sample attendance data for testing</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadExcelTemplate}
                    className="flex items-center gap-2 shadow-sm transition-all hover:shadow bg-white border-red-300 hover:border-red-400 text-gray-700 hover:text-red-600"
                  >
                    <Download className="h-4 w-4 text-appRed" />
                    Download Excel Template
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-red-50 border-red-300 text-gray-800">
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Download an Excel template to fill in your data</p>
                    <ol className="list-decimal pl-5 text-xs text-gray-700 space-y-1.5">
                      <li>Fill in your attendance data</li>
                      <li>Save as CSV (File → Save As → CSV format)</li>
                      <li>Upload the CSV file</li>
                    </ol>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-appRed bg-red-50/70 shadow-lg scale-[1.01]'
                : 'border-gray-300 hover:border-red-400 hover:bg-red-50/30 hover:shadow-md'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              ref={fileInputRef}
            />
            
            <div className="animate-fadeIn">
              <div className="flex justify-center mb-4">
                {isProcessing ? (
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-b-appRed"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-appRed">CSV</div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-red-200 to-red-50 rounded-full flex items-center justify-center shadow-inner transition-all duration-300 group-hover:shadow">
                    <Upload className="w-7 h-7 text-appRed" />
                  </div>
                )}
              </div>
              
              <div className="pb-6">
                <p className="text-xl font-medium text-gray-900 mb-2">
                  {isProcessing ? 'Processing file...' : 'Upload CSV File'}
                </p>
                <p className="text-sm text-gray-600">
                  Drag and drop your attendance CSV file here, or click to browse
                </p>
              </div>
              
              <button
                type="button"
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-appRed hover:bg-appRed/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-appRed transition-all duration-200 shadow-sm hover:shadow"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 animate-zoomIn">
          <div className="flex items-center mb-5">
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-appRed" />
            </div>
            <h3 className="text-xl font-medium text-gray-900">Attendance Period</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-6 border-l-2 border-red-300 pl-3 italic">
            Please confirm the month and year for this attendance data to ensure accurate identification of weekends and holidays.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-red-50/50 rounded-lg p-4 border border-red-200">
               <label htmlFor="month" className="block text-sm font-medium text-gray-800 mb-2 flex items-center">
                 <span className="inline-block w-1.5 h-1.5 bg-appRed rounded-full mr-1.5"></span>
                 Month
               </label>
               <select
                  id="month"
                  className="w-full px-4 py-2.5 border border-red-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-appRed/30 focus:border-appRed transition-colors"
                  value={detectedMonth !== null ? detectedMonth.toString() : ''}
                  onChange={handleMonthChange}
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
            
            <div className="bg-red-50/50 rounded-lg p-4 border border-red-200">
               <label htmlFor="year" className="block text-sm font-medium text-gray-800 mb-2 flex items-center">
                 <span className="inline-block w-1.5 h-1.5 bg-appRed rounded-full mr-1.5"></span>
                 Year
               </label>
               <input
                  type="number"
                  id="year"
                  className="w-full px-4 py-2.5 border border-red-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-appRed/30 focus:border-appRed transition-colors"
                  value={detectedYear !== null ? detectedYear : ''}
                  onChange={handleYearChange}
                  min="2000"
                  max="2100"
                />
              </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-5 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-appRed transition-all duration-200"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </button>
            
            <button
              type="button"
              className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-appRed hover:bg-appRed/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-appRed transition-all duration-200"
              onClick={handleConfirmDateSelection}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {fileName && !showConfirmation && (
        <div className="flex items-center space-x-3 text-sm text-gray-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
            <FileText className="w-4 h-4 text-appRed" />
          </div>
          <span className="font-medium">Selected: <span className="text-gray-700">{fileName}</span></span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 shadow-sm animate-fadeIn">
          <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="font-medium">Invalid CSV data</p>
            <p className="text-red-500 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};