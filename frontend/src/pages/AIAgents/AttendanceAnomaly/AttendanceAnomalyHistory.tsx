import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText, Copy, Printer, Download, Clock, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';

export function AttendanceAnomalyHistory() {
  const [selectedItem, setSelectedItem] = useState(null);

  // useEffect(() => {
  //   const fetchHistory = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await getAttendanceAnomalyHistory();
  //       if (Array.isArray(response)) {
  //         setHistory(response);
  //       } else {
  //         console.error('Expected array but got:', response);
  //         setHistory([]);
  //         setError('Invalid data format received');
  //       }
  //     } catch (err) {
  //       setError('Failed to load history. Please try again later.');
  //       console.error('Error fetching Attendance Anomaly history:', err);
  //       setHistory([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchHistory();
  // }, []);

  // const handleViewDetails = (item: any) => {
  //   setSelectedItem(item);
  // };

  // const handleDeleteHistoryItem = async (id: string, event: React.MouseEvent) => {
  //   event.stopPropagation();
  //   if (window.confirm('Are you sure you want to delete this history item?')) {
  //     try {
  //       await deleteAttendanceAnomalyHistoryItem(id);

  //       // Update the history state
  //       setHistory(history.filter(item => item._id !== id));

  //       if (selectedItem && selectedItem._id === id) {
  //         setSelectedItem(null);
  //       }

  //       toast.success('History item deleted');
  //     } catch (error) {
  //       console.error('Error deleting history item:', error);
  //       toast.error('Failed to delete history item');
  //     }
  //   }
  // };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
  };

  const printHistory = () => {
    if (!selectedItem) return;

    const content = document.getElementById('summary-content');
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print the summary');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Anomaly Analysis - ${getMonthName(selectedItem.month)} ${selectedItem.year}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #333; }
            .container { max-width: 800px; margin: 0 auto; }
            .meta { color: #666; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 10px; }
            .anomaly { margin-bottom: 10px; padding-left: 20px; }
            .severity-high { color: #e53e3e; }
            .severity-medium { color: #dd6b20; }
            .severity-low { color: #718096; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Attendance Anomaly Analysis - ${getMonthName(selectedItem.month)} ${selectedItem.year}</h1>
            <div class="meta">Generated: ${formatDate(selectedItem.createdAt.toString())}</div>
            
            <div class="section">
              <div class="section-title">Summary</div>
              <div>${selectedItem.summary}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Statistics</div>
              <div>Total Employees: ${selectedItem.statistics.totalEmployees}</div>
              <div>Total Working Days: ${selectedItem.statistics.totalWorkingDays}</div>
              <div>Average Attendance Rate: ${selectedItem.statistics.averageAttendanceRate.toFixed(2)}%</div>
              <div>Late Arrivals: ${selectedItem.statistics.lateArrivals}</div>
              <div>Early Departures: ${selectedItem.statistics.earlyDepartures}</div>
              <div>Work Hour Shortfalls: ${selectedItem.statistics.workHourShortfalls}</div>
              <div>Policy Violations: ${selectedItem.statistics.policyViolations}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Recommendations</div>
              <ul>
                ${selectedItem.recommendations.map(rec => `<li>${rec}</li>`).join('')}
              </ul>
            </div>
            
            ${selectedItem.criticalFindings ? `
            <div class="section">
              <div class="section-title severity-high">Critical Findings</div>
              <ul>
                ${selectedItem.criticalFindings.map(finding => `<li>${finding}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${selectedItem.moderateConcerns ? `
            <div class="section">
              <div class="section-title severity-medium">Moderate Concerns</div>
              <ul>
                ${selectedItem.moderateConcerns.map(concern => `<li>${concern}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
            
            ${selectedItem.positivePatterns ? `
            <div class="section">
              <div class="section-title">Positive Patterns</div>
              <ul>
                ${selectedItem.positivePatterns.map(pattern => `<li>${pattern}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const copyToClipboard = () => {
    if (!selectedItem) return;

    const content = document.getElementById('summary-content');
    if (!content) return;

    // Create a formatted text version
    let textContent = `Attendance Anomaly Analysis - ${getMonthName(selectedItem.month)} ${selectedItem.year}\n\n`;
    textContent += `Generated: ${formatDate(selectedItem.createdAt.toString())}\n\n`;
    textContent += `Summary:\n${selectedItem.summary}\n\n`;
    
    textContent += `Statistics:\n`;
    textContent += `- Total Employees: ${selectedItem.statistics.totalEmployees}\n`;
    textContent += `- Total Working Days: ${selectedItem.statistics.totalWorkingDays}\n`;
    textContent += `- Average Attendance Rate: ${selectedItem.statistics.averageAttendanceRate.toFixed(2)}%\n`;
    textContent += `- Late Arrivals: ${selectedItem.statistics.lateArrivals}\n`;
    textContent += `- Early Departures: ${selectedItem.statistics.earlyDepartures}\n`;
    textContent += `- Work Hour Shortfalls: ${selectedItem.statistics.workHourShortfalls}\n`;
    textContent += `- Policy Violations: ${selectedItem.statistics.policyViolations}\n\n`;
    
    textContent += `Recommendations:\n`;
    selectedItem.recommendations.forEach(rec => {
      textContent += `- ${rec}\n`;
    });
    textContent += '\n';
    
    if (selectedItem.criticalFindings && selectedItem.criticalFindings.length > 0) {
      textContent += `Critical Findings:\n`;
      selectedItem.criticalFindings.forEach(finding => {
        textContent += `- ${finding}\n`;
      });
      textContent += '\n';
    }
    
    if (selectedItem.moderateConcerns && selectedItem.moderateConcerns.length > 0) {
      textContent += `Moderate Concerns:\n`;
      selectedItem.moderateConcerns.forEach(concern => {
        textContent += `- ${concern}\n`;
      });
      textContent += '\n';
    }
    
    if (selectedItem.positivePatterns && selectedItem.positivePatterns.length > 0) {
      textContent += `Positive Patterns:\n`;
      selectedItem.positivePatterns.forEach(pattern => {
        textContent += `- ${pattern}\n`;
      });
    }

    navigator.clipboard.writeText(textContent)
      .then(() => toast.success('Summary copied to clipboard'))
      .catch(() => toast.error('Failed to copy summary'));
  };

  const downloadAsPdf = () => {
    if (!selectedItem) return;

    const content = document.getElementById('summary-content');
    if (!content) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `attendance_anomaly_${selectedItem.month + 1}_${selectedItem.year}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .from(content)
      .set(opt)
      .save()
      .then(() => toast.success('PDF downloaded'))
      .catch(() => toast.error('Failed to download PDF'));
  };

  return (
    <div className="container py-8 min-h-screen">
      {/* {loading && !selectedItem && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )} */}

      {/* {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )} */}

      {selectedItem ? (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Attendance Anomaly Analysis - {getMonthName(selectedItem.month)} {selectedItem.year}
            </h2>

            <Button 
              onClick={() => setSelectedItem(null)} 
              style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
              className="bg-appRed hover:bg-appRed/90 transition-colors duration-200"
              variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-6 mb-4 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Generated: {formatDate(selectedItem.createdAt.toString())}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>Employees: {selectedItem.statistics.totalEmployees}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Working Days: {selectedItem.statistics.totalWorkingDays}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Button onClick={copyToClipboard} variant="outline" size="sm" className="flex items-center">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={printHistory} variant="outline" size="sm" className="flex items-center">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={downloadAsPdf} variant="outline" size="sm" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <div id="summary-content" className="prose max-w-none">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Summary</h3>
              <div className="text-gray-700">{selectedItem.summary}</div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Total Employees:</span>
                  <span>{selectedItem.statistics.totalEmployees}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Total Working Days:</span>
                  <span>{selectedItem.statistics.totalWorkingDays}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Average Attendance Rate:</span>
                  <span>{selectedItem.statistics.averageAttendanceRate.toFixed(2)}%</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Late Arrivals:</span>
                  <span>{selectedItem.statistics.lateArrivals}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Early Departures:</span>
                  <span>{selectedItem.statistics.earlyDepartures}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Work Hour Shortfalls:</span>
                  <span>{selectedItem.statistics.workHourShortfalls}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Policy Violations:</span>
                  <span>{selectedItem.statistics.policyViolations}</span>
                </div>
                {selectedItem.statistics.holidayWork > 0 && (
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Holiday Work:</span>
                    <span>{selectedItem.statistics.holidayWork}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedItem.criticalFindings && selectedItem.criticalFindings.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-red-600 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Critical Findings
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedItem.criticalFindings.map((finding, index) => (
                    <li key={index} className="text-gray-700">{finding}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.moderateConcerns && selectedItem.moderateConcerns.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-orange-600 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Moderate Concerns
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedItem.moderateConcerns.map((concern, index) => (
                    <li key={index} className="text-gray-700">{concern}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.positivePatterns && selectedItem.positivePatterns.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-green-600 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Positive Patterns
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedItem.positivePatterns.map((pattern, index) => (
                    <li key={index} className="text-gray-700">{pattern}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1">
                {selectedItem.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">{recommendation}</li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Anomalies</h3>
              <div className="space-y-4">
                {selectedItem.anomalies.map((anomaly, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-md">
                    <div className="font-medium">{anomaly.employeeName}</div>
                    <div className="text-sm text-gray-500 mb-1">
                      Type: {anomaly.type} | Severity: {anomaly.severity} | Frequency: {anomaly.frequency}
                    </div>
                    <div className="text-gray-700">{anomaly.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-6">Attendance Anomaly History</h2>
          
          {history.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No attendance anomaly analysis history found</p>
              <p className="text-gray-400">Attendance anomaly analyses will appear here after they are automatically saved</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleViewDetails(item)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg mb-2">
                      {getMonthName(item.month)} {item.year}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600"
                      // onClick={(e) => handleDeleteHistoryItem(item._id, e)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDate(item.createdAt.toString())}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      <span>{item.statistics.totalEmployees} employees</span>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-2">{item.summary}</p>
                </div>
              ))} */}
            </div>
          )}
        </div>
      )}
    </div>
  );
}