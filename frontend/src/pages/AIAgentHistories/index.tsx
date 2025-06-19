// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Calendar, Eye, Search, Users, Settings, ArrowLeft, Download, Copy, Trash, Mail, Loader2, FileType } from 'lucide-react';
import {
  getAllZoomaryHistory,
  ZoomaryHistoryItem,
  getAllCompanyProfileHistory,
  CompanyProfileHistoryItem,
  getAllMailSenderHistory,
  MailSenderHistoryItem,
} from '@/services/history.service';
import {
  getAllReportHistory,
  ReportHistoryItem,
} from '@/services/report-history.service';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIAgentSettingsPage from '../AIAgentSettings';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAxios } from '@/context/AppContext';
import SendEmailDialog from '@/components/Custom/SendEmailDialog';

type HistoryType = 'zoomary' | 'company-profile' | 'mail-sender' | 'report';

type HistoryItem = ZoomaryHistoryItem | CompanyProfileHistoryItem | MailSenderHistoryItem | ReportHistoryItem;

const AIAgentHistories: React.FC = () => {
  const axios = useAxios("admin");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [historyType, setHistoryType] = useState<HistoryType>('zoomary');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSuccessOpen, setEmailSuccessOpen] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      if (historyType === 'zoomary') {
        const response = await getAllZoomaryHistory();
        if (Array.isArray(response)) {
          setHistory(response);
        } else {
          console.error('Expected array but got:', response);
          setHistory([]);
          setError('Invalid data format received');
        }
      } else if (historyType === 'company-profile') {
        const response = await getAllCompanyProfileHistory();
        if (Array.isArray(response)) {
          setHistory(response);
        } else {
          console.error('Expected array but got:', response);
          setHistory([]);
          setError('Invalid data format received');
        }
      } else if (historyType === 'mail-sender') {
        const response = await getAllMailSenderHistory();
        if (Array.isArray(response)) {
          setHistory(response);
        } else {
          console.error('Expected array but got:', response);
          setHistory([]);
          setError('Invalid data format received');
        }
      } else if (historyType === 'report') {
        const response = await getAllReportHistory();
        if (Array.isArray(response)) {
          setHistory(response);
        } else {
          console.error('Expected array but got:', response);
          setHistory([]);
          setError('Invalid data format received');
        }
      }
    } catch (err) {
      setError('Failed to load history. Please try again later.');
      console.error(`Error fetching ${historyType} history:`, err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [historyType]);


  const handleViewDetails = async (id: any) => {
    try {
      setLoading(true);
      if (historyType === 'zoomary') {
        setSelectedItem(id);
      } else if (historyType === 'company-profile') {
        setSelectedItem(id);
      } else if (historyType === 'mail-sender') {
        setSelectedItem(id);
      } else if (historyType === 'report') {
        setSelectedItem(id);
      }
    } catch (err) {
      setError('Failed to load history item. Please try again later.');
      console.error(`Error fetching ${historyType} history item:`, err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item as any).title?.toLowerCase().includes(searchLower) ||
      (item as any).companyName?.toLowerCase().includes(searchLower) ||
      (item as any).name?.toLowerCase().includes(searchLower) ||
      (item as any).email?.toLowerCase().includes(searchLower) ||
      (item as any).recipient?.toLowerCase().includes(searchLower) ||
      (item as any).subject?.toLowerCase().includes(searchLower) ||
      (item as any).fileName?.toLowerCase().includes(searchLower)
    );
  });

  const copySummaryToClipboard = async (element) => {
    const contentElement = document.getElementById(element);
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

  const downloadAsPdf = (element) => {
    if (!selectedItem) return;

    const content = document.getElementById(element);
    if (!content) return;

    const rawName = selectedItem.title || selectedItem.companyName || "";
    const sanitizedName = rawName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${sanitizedName}.pdf`,
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

  // Handle send email
  const handleSendEmail = async (submission, path) => {
    setIsEmailSending(true);
    try {

      const fullHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
                font-family: 'Segoe UI', sans-serif;
                color: #333;
              }
              .email-container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border: 1px solid #e0e0e0;
                border-radius: 10px;
                padding: 32px;
              }
              h1 {
                color: #d32f2f;
                font-size: 24px;
                margin-bottom: 16px;
              }
              p {
                font-size: 16px;
                line-height: 1.6;
              }
              .btn-container {
                margin-top: 32px;
                text-align: center;
              }
              .view-button {
                background-color: #d32f2f;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 26px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 16px;
                display: inline-block;
              }
              .view-button:hover {
                background-color: #b71c1c;
              }
          
            </style>
          </head>
          <body>
            <div class="email-container">
              <h1>Your Report is Ready</h1>
              <p>Hi ${submission?.name},</p>
              <p>We’ve prepared your ${submission?.companyName || 'Meeting Summary'} report. You can view it by clicking the button below.</p>
              <div class="btn-container">
                <a href="https://ai.ceoitbox.com/view/${path}/${submission?._id}" target="_blank" class="view-button" style="color: #ffffff">
                  View Your Report
                </a>
              </div>
            </div>
          
          </body>
        </html>
      `;

      let subject = "Meeting Summary";

      if (path === 'company-profile') {
        subject = submission?.companyName || "Company Profile";
      } else if (path === 'report') {
        subject = submission?.fileName || "Report";
      }

      await axios.post("/users/email", {
        to: submission?.email,
        subject: subject,
        body: fullHTML,
      });

      // Success
      setSentToEmail(submission?.email);
      setEmailSuccessOpen(true);
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsEmailSending(false);
    }
  };


  const renderHistoryContent = () => {
    if (loading && !selectedItem) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      );
    }

    if (selectedItem) {
      if (historyType === 'zoomary') {
        const zoomaryItem = selectedItem as ZoomaryHistoryItem;
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{zoomaryItem.title}</h2>

              <Button onClick={() => setSelectedItem(null)}
                style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
                className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
                variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="flex items-center gap-6 mb-4 text-sm text-gray-500 flex-wrap">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Created: {formatDate(zoomaryItem.createdAt.toString())}</span>
              </div>
              {zoomaryItem.meetingDate && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Meeting: {formatDate(zoomaryItem.meetingDate.toString())}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              {/* <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">User Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {zoomaryItem.name}</p>
                  <p><strong>Email:</strong> {zoomaryItem.email}</p>
                </div>
              </div> */}

              {/* <h3 className="text-lg font-semibold mb-2 text-gray-700">Summary</h3> */}
              <div
                id="summary-content"
                className="bg-gray-50 p-4 rounded-lg prose max-w-none"
                dangerouslySetInnerHTML={{ __html: zoomaryItem.summary }}
              />
            </div>
            <div className="w-full flex items-center justify-center mt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => copySummaryToClipboard("summary-content")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                <Button variant="outline" className="flex items-center"
                  onClick={() => downloadAsPdf("summary-content")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

                <Button
                  className="bg-primary-red hover:bg-red-700 flex items-center"
                  onClick={() => handleSendEmail(zoomaryItem, "zoom")}
                  disabled={isEmailSending}
                >
                  {isEmailSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send to Email
                    </>
                  )}
                </Button>

              </div>
            </div>
          </div>
        );
      } else if (historyType === 'company-profile') {
        const companyProfileItem = selectedItem as CompanyProfileHistoryItem;
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{companyProfileItem.companyName}</h2>

              <Button onClick={() => setSelectedItem(null)}
                style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
                className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
                variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="flex items-center gap-6 mb-4 text-sm text-gray-500 flex-wrap">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Created: {formatDate(companyProfileItem.createdAt.toString())}</span>
              </div>
              {/* {companyProfileItem.sourcedFrom && (
                <div className="flex items-center">
                  <span>Source: {companyProfileItem.sourcedFrom}</span>
                </div>
              )} */}
            </div>

            <div className="border-t border-gray-200 pt-4">
              {/* {(companyProfileItem.name || companyProfileItem.email) && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">User Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {companyProfileItem.name && <p><strong>Name:</strong> {companyProfileItem.name}</p>}
                    {companyProfileItem.email && <p><strong>Email:</strong> {companyProfileItem.email}</p>}
                  </div>
                </div>
              )} */}

              {/* <h3 className="text-lg font-semibold mb-2 text-gray-700">Company Report</h3> */}
              <div
                id="report-content"
                className="bg-gray-50 p-4 rounded-lg prose max-w-none "
                dangerouslySetInnerHTML={{ __html: companyProfileItem.report }}
              />
            </div>
            <div className="w-full flex items-center justify-center mt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => copySummaryToClipboard("report-content")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                <Button variant="outline" className="flex items-center"
                  onClick={() => downloadAsPdf("report-content")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

                <Button
                  className="bg-primary-red hover:bg-red-700 flex items-center"
                  onClick={() => handleSendEmail(companyProfileItem, "company-profile")}
                  disabled={isEmailSending}
                >
                  {isEmailSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send to Email
                    </>
                  )}
                </Button>

              </div>
            </div>
          </div>
        );
      } else if (historyType === 'report') {
        const reportItem = selectedItem as ReportHistoryItem;
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{reportItem.fileName}</h2>
              <Button onClick={() => setSelectedItem(null)}
                style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
                className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
                variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="flex items-center gap-6 mb-4 text-sm text-gray-500 flex-wrap">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Created: {formatDate(reportItem.createdAt.toString())}</span>
              </div>
              {reportItem.fileType && (
                <div className="flex items-center">
                  <FileType className="w-4 h-4 mr-1" />
                  <span>File Type: {reportItem.fileType}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              {(reportItem.name || reportItem.email) && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">User Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {reportItem.name && <p><strong>Name:</strong> {reportItem.name}</p>}
                    {reportItem.email && <p><strong>Email:</strong> {reportItem.email}</p>}
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold mb-2 text-gray-700">Report</h3>
              <div
                id="report-content"
                className="bg-gray-50 p-4 rounded-lg prose max-w-none"
                dangerouslySetInnerHTML={{ __html: reportItem.report }}
              />
            </div>
            <div className="w-full flex items-center justify-center mt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={() => copySummaryToClipboard("report-content")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                <Button variant="outline" className="flex items-center"
                  onClick={() => downloadAsPdf("report-content")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

                <Button
                  className="bg-primary-red hover:bg-red-700 flex items-center"
                  onClick={() => handleSendEmail(reportItem, "report")}
                  disabled={isEmailSending}
                >
                  {isEmailSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send to Email
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );
      } else if (historyType === 'mail-sender') {
        const mailSenderItem = selectedItem as MailSenderHistoryItem;
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{mailSenderItem.subject}</h2>
              <Button onClick={() => setSelectedItem(null)}
                style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
                className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
                variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>

            <div className="flex items-center gap-6 mb-4 text-sm text-gray-500 flex-wrap">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Created: {formatDate(mailSenderItem.createdAt.toString())}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Email Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Recipient:</strong> {mailSenderItem.recipient}</p>
                  <p><strong>Subject:</strong> {mailSenderItem.subject}</p>
                </div>
              </div>

              {(mailSenderItem.name || mailSenderItem.email) && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">User Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {mailSenderItem.name && <p><strong>Name:</strong> {mailSenderItem.name}</p>}
                    {mailSenderItem.email && <p><strong>Email:</strong> {mailSenderItem.email}</p>}
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold mb-2 text-gray-700">Message</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p>{mailSenderItem.message}</p>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-gray-700">Response</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{mailSenderItem.response}</p>
              </div>
            </div>
          </div>
        );
      }
    }

    return (
      <>
        <div className="mb-4 relative max-w-[250px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search by title, name, or email..."
              className="pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 bg-gray-100 rounded-lg border border-gray-200 text-center">
            <History className="mx-auto mb-2 text-gray-400 w-12 h-12" />
            <p className="text-gray-600">No history found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-600">
                <tr>
                  {historyType === 'zoomary' ? (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                      Title
                    </th>
                  ) : historyType === 'company-profile' ? (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                      Company Name
                    </th>
                  ) : historyType === 'report' ? (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                      File Name
                    </th>
                  ) : (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                      Subject
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                    {historyType === 'mail-sender' ? 'Recipient' : 'Name'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                    {historyType === 'mail-sender' ? 'Name' : 'Email'}
                  </th>
                  {historyType === 'mail-sender' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                      Email
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white  tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory?.map((item) => {
                  if (historyType === 'zoomary') {
                    const zoomaryItem = item as ZoomaryHistoryItem;
                    return (
                      <tr key={zoomaryItem._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{zoomaryItem.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{zoomaryItem.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{zoomaryItem.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(zoomaryItem.meetingDate?.toString() || zoomaryItem.createdAt?.toString() || '')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <Button onClick={() => handleViewDetails(zoomaryItem)} className="text-black hover:text-red-500 hover:border-red-500" variant="outline" size="sm" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500" title="Remove">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this Submission? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      axios.delete(`/history/zoomary/${zoomaryItem._id}`)
                                        .then(() => {
                                          toast.success("Submission deleted successfully");
                                          fetchHistory();
                                        })
                                        .catch(error => {
                                          console.error(error);
                                          toast.error("Failed to delete template");
                                        });
                                    }}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>


                          </div>
                        </td>
                      </tr>
                    );
                  } else if (historyType === 'company-profile') {
                    const companyProfileItem = item as CompanyProfileHistoryItem;
                    return (
                      <tr key={companyProfileItem._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{companyProfileItem.companyName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{companyProfileItem.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{companyProfileItem.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(companyProfileItem.createdAt?.toString() || '')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">

                            <Button onClick={() => handleViewDetails(companyProfileItem)} className="text-black hover:text-red-500 hover:border-red-500" variant="outline" size="sm" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500" title="Remove">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this Submission? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      axios.delete(`/history/company-profile/${companyProfileItem._id}`)
                                        .then(() => {
                                          toast.success("Submission deleted successfully");
                                          fetchHistory();
                                        })
                                        .catch(error => {
                                          console.error(error);
                                          toast.error("Failed to delete template");
                                        });
                                    }}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  } else if (historyType === 'report') {
                    const reportItem = item as ReportHistoryItem;
                    return (
                      <tr key={reportItem._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{reportItem.fileName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reportItem.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{reportItem.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(reportItem.createdAt?.toString() || '')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <Button onClick={() => handleViewDetails(reportItem)} className="text-black hover:text-red-500 hover:border-red-500" variant="outline" size="sm" title="View">
                              <Eye className="h-4 w-4" />
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500" title="Remove">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this Submission? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      axios.delete(`/history/report/${reportItem._id}`)
                                        .then(() => {
                                          toast.success("Submission deleted successfully");
                                          fetchHistory();
                                        })
                                        .catch(error => {
                                          console.error(error);
                                          toast.error("Failed to delete template");
                                        });
                                    }}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    );
                  } else if (historyType === 'mail-sender') {
                    const mailSenderItem = item as MailSenderHistoryItem;
                    return (
                      <tr key={mailSenderItem._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{mailSenderItem.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{mailSenderItem.recipient}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{mailSenderItem.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{mailSenderItem.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDate(mailSenderItem.createdAt?.toString() || '')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <button
                              className="flex items-center px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors"
                              onClick={() => handleViewDetails(mailSenderItem)}
                              aria-label="View details"
                            >
                              <Eye className="w-5 h-5 mr-1" />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="mx-auto py-8 px-10 min-h-screen">

      {/* Heading  */}
      <div className="flex items-center mb-6" >
        <div className="flex items-center">
          <History className="mr-2 text-red-600" size={24} />
          <h1 className="text-2xl font-bold">AI Agents Dashboard</h1>
        </div>
      </div>

      <Tabs defaultValue="submissions" className="w-full" style={{ overflow: "hidden" }}>
        <TabsList className="mb-4 mt-3 w-full" >
          <TabsTrigger
            value="submissions"
            className="flex items-center justify-center gap-2 text-black bg-white border border-gray-200 data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
            style={{ width: "50%" }}
          >
            <Users className="w-4 h-4" /> Submissions
          </TabsTrigger>

          <TabsTrigger
            value="ai-agents-settings"
            className="flex items-center justify-center gap-2 text-black bg-white border border-gray-200 data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
            style={{ width: "50%" }}
          >
            <Settings className="w-4 h-4" /> AI Agents Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <Card className="w-full shadow-md mb-6">
            <CardHeader>
              <div className='flex items-center justify-between w-full'>
                <CardTitle className="text-xl">
                  {historyType === 'zoomary' && 'Zoomary AI Histories'}
                  {historyType === 'company-profile' && 'Company Profile Histories'}
                  {historyType === 'mail-sender' && 'AI Mail Histories'}
                  {historyType === 'report' && 'Report History'}
                </CardTitle>

                <div>
                  <Select
                    value={historyType}
                    onValueChange={(value) => setHistoryType(value as HistoryType)}
                  >
                    <SelectTrigger className="w-full md:w-[250px]">
                      <SelectValue placeholder="Select history type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zoomary">Zoomary AI Histories</SelectItem>
                      <SelectItem value="company-profile">Company Profile Histories</SelectItem>
                      <SelectItem value="report">Report History</SelectItem>
                      {/* <SelectItem value="mail-sender">AI Mail Histories</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {renderHistoryContent()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-agents-settings">
          <AIAgentSettingsPage />
        </TabsContent>
      </Tabs>

      {/* Email send */}
      <SendEmailDialog
        emailSuccessOpen={emailSuccessOpen}
        setEmailSuccessOpen={setEmailSuccessOpen}
        sentToEmail={sentToEmail}
      />
    </div>
  );
};

export default AIAgentHistories;

