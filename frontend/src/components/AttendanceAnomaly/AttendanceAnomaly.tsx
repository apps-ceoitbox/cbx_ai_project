import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from './FileUpload';
import { DataPreview } from './DataPreview';
import { PolicyConfiguration } from './PolicyConfiguration';
import { AnomalyDetection } from './AnomalyDetection';
import { AnalysisResult, AttendanceData, PolicyConfig } from './types';
import { useAxios } from '@/context/AppContext';
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Upload } from 'lucide-react';

export const AttendanceAnomaly: React.FC = () => {
  const axios = useAxios("user");
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [policyConfig, setPolicyConfig] = useState<PolicyConfig>({
    checkInTime: '09:00',
    checkOutTime: '18:00',
    requiredHours: 8,
    showWorkedHours: true,
    sundayHoliday: true,
    secondSaturdayHoliday: true,
    customHolidays: [],
    checkHolidays: false,
  });
  // No longer need activeTab state since we're not using tabs
  const [, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [policiesApplied, setPoliciesApplied] = useState(false);
  const [aiSettings, setAiSettings] = useState<{
    apiKey: string;
    aiProvider: {
      name: string;
      model: string;
    };
  }>({ 
    apiKey: '',
    aiProvider: {
      name: 'Anthropic',
      model: 'claude-sonnet-4-20250514',
    }
  });

  // Fetch AI agent settings when component mounts
  useEffect(() => {
    axios.get("/aiagentsettings").then((res) => {
      const settings = res?.data?.data;
      if (!Array.isArray(settings)) return;
      const attendanceSetting = settings?.find(item => item.name === "attendance");
      setAiSettings({
        apiKey: attendanceSetting?.apikey || '',
        aiProvider: {
          name: attendanceSetting?.aiProvider?.name || 'Anthropic',
          model: attendanceSetting?.aiProvider?.model || 'claude-sonnet-4-20250514',
        }
      });
    }).catch(error => {
      console.error('Error fetching AI agent settings:', error);
    });
  }, []);

  // Handle file upload
  const handleFileUpload = (data: AttendanceData) => {
    setAttendanceData(data);
  };

  // Handle policy configuration changes
  const handlePolicyChange = (config: PolicyConfig) => {
    setPolicyConfig(config);
  };

  // Handle policy application
  const handleApplyPolicy = () => {
    // Force a re-render of components that depend on policy config
    setPolicyConfig({ ...policyConfig });
    // Set policies as applied
    setPoliciesApplied(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">AI Attendance Anomaly Detection</h1>
        <p className="text-muted-foreground">
          Upload attendance data, configure policies, and use AI to detect anomalies and patterns.
        </p>
      </div>

      <div className="space-y-6">
        {/* Upload Section */}
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Upload className="h-5 w-5 text-appRed mr-2" />
              <h2 className="text-xl font-bold">Upload Attendance Data</h2>
            </div>
            
            {/* Upload Instructions - Now inside the card */}
            <Alert className="bg-gradient-to-r from-red-50 to-red-50/50 border-red-200 shadow-sm rounded-lg overflow-hidden mb-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-appRed"></div>
              <Info className="h-5 w-5 text-appRed" />
              <AlertTitle className="text-gray-800 font-medium text-lg">Upload Instructions</AlertTitle>
              <AlertDescription className="text-gray-700 mt-3">
                <div className="space-y-4">
                  <div className="pb-4">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <span className="inline-block w-2 h-2 bg-appRed rounded-full mr-2"></span>
                      Data Requirements:
                    </h4>
                    <ul className="list-disc pl-6 space-y-2 text-sm">
                      <li>Upload <strong>only one month's</strong> attendance data at a time</li>
                      <li>File must be in CSV format with the correct structure</li>
                      <li>Each day should have Check-IN and Check-OUT columns</li>
                      <li>Use "OFF" for off days</li>
                      <li>Time format should be HH:MM (24-hour format)</li>
                    </ul>
                  </div>
                  
                  <div className="pb-4 pt-4 border-t border-red-100">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <span className="inline-block w-2 h-2 bg-appRed rounded-full mr-2"></span>
                      How to Create a CSV File:
                    </h4>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                  <li>Download the Excel Template from the upload section</li>
                  <li>Open the template in Microsoft Excel or similar spreadsheet software</li>
                  <li>Fill in your employee attendance data following the sample format</li>
                  <li>Save/Export the file as CSV format</li>
                  <li>Upload the saved CSV file using the form above</li>
                </ol>
                </div>
              </div>
            </AlertDescription>
          </Alert>
          
          {/* File Upload Component */}
          <div className="mt-6">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
          </CardContent>
        </Card>

        {/* Separator */}
        {attendanceData && <Separator className="my-6" />}

        {/* Preview & Analysis Section */}
        {attendanceData && (
          <div className="flex flex-col space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Policy Configuration</h2>
                <PolicyConfiguration
                  config={policyConfig}
                  onChange={handlePolicyChange}
                  onApply={handleApplyPolicy}
                  data={attendanceData}
                  selectedMonth={attendanceData.month}
                  selectedYear={attendanceData.year}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Data Preview</h2>
                <DataPreview
                  data={attendanceData}
                  selectedMonth={attendanceData.month}
                  selectedYear={attendanceData.year}
                  policyConfig={policyConfig}
                  policiesApplied={policiesApplied}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">AI Analysis</h2>
                <AnomalyDetection
                  data={attendanceData}
                  policyConfig={policyConfig}
                  apiKey={aiSettings.apiKey}
                  aiProvider={aiSettings.aiProvider}
                  onAnalysisComplete={setAnalysisResult}
                  policiesApplied={policiesApplied}
                />
              </CardContent>
            </Card>
            
            {/* Visualizations are now integrated directly into the AI Analysis section */}
          </div>
        )}
      </div>
    </div>
  );
};