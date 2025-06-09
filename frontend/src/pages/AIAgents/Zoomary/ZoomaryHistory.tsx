import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getZoomaryHistory, clearZoomaryHistory, ZoomaryHistoryItem, deleteZoomaryHistoryItem } from '@/services/history.service';
import { ArrowLeft, Calendar, FileText, Copy, Printer, Download, XCircle, Clock, Video, Eye } from 'lucide-react';
import { format } from 'date-fns';
import html2pdf from 'html2pdf.js';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

export function ZoomaryHistory() {

  const [history, setHistory] = useState<ZoomaryHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ZoomaryHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await getZoomaryHistory();
        if (Array.isArray(response)) {
          setHistory(response);
        } else {
          console.error('Expected array but got:', response);
          setHistory([]);
          setError('Invalid data format received from localStorage');
        }
      } catch (err) {
        setError('Failed to load history. Please try again later.');
        console.error('Error fetching Zoomary history:', err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);  // Empty dependency array ensures this runs once on mount

  const handleViewDetails = async (id: any) => {
    try {
      setLoading(true);
      setSelectedItem(id);
    } catch (err) {
      setError('Failed to load history item. Please try again later.');
      console.error('Error fetching Zoomary history item:', err);
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

  const handleDeleteHistoryItem = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Attempting to delete history item with ID: ${id}`); // Log attempt
    if (window.confirm('Are you sure you want to delete this history item?')) {
      try {
        setLoading(true); // Optional: indicate loading state
        // Call the service function to delete from backend
        const success = await deleteZoomaryHistoryItem(id);

        if (success) {
          console.log(`Successfully deleted item ${id} from backend.`);
          // Update state only if backend deletion was successful
          const updatedHistory = history.filter((item: ZoomaryHistoryItem) => item._id !== id);
          setHistory(updatedHistory);
          if (selectedItem && selectedItem._id === id) {
            setSelectedItem(null);
          }
          toast.success('History item deleted successfully.');
        } else {
          console.error(`Failed to delete item ${id} from backend.`);
          toast.error('Failed to delete history item. Please try again.');
        }
      } catch (err) {
        console.error('Error during delete operation:', err);
        toast.error('An error occurred while deleting the history item.');
      } finally {
        setLoading(false); // Optional: reset loading state
      }
    }
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
          <title>${selectedItem.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #333; }
            .container { max-width: 800px; margin: 0 auto; }
            .meta { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${selectedItem.title}</h1>
            <div class="meta">Meeting Date: ${formatDate(selectedItem.meetingDate.toString())}</div>
            ${selectedItem.summary}
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

    // Create a temporary element for plain text extraction
    const tempElement = document.createElement('div');
    tempElement.innerHTML = selectedItem.summary;
    const textContent = `${selectedItem.title}\n\nMeeting Date: ${formatDate(selectedItem.meetingDate.toString())}\n\n${tempElement.textContent}`;

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
      filename: `${selectedItem.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
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


  const confirmClearHistory = async () => {
    try {

      const success = clearZoomaryHistory();
      if (success) {
        setHistory([]);
        setSelectedItem(null);
        toast.success('History cleared successfully');
      } else {
        toast.error('Failed to clear history');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      toast.error('Failed to clear history');
    } finally {

      setShowClearDialog(false);
    }
  };

  return (
    <div className="container py-8">
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear History</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear all Zoomary AI history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearHistory} className="bg-red-600 hover:bg-red-700">
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/ai-agents/zoomary">
            <Button variant="outline" className="mr-4 border-gray-300 hover:border-red-600 hover:text-red-600">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Zoomary
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Zoomary AI History
          </h1>
        </div>
        {/* Clear History button removed as requested */}
      </div>

      {loading && !selectedItem && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {!loading && history.length === 0 && !error && (
        <div className="p-8 bg-gray-100 rounded-lg border border-gray-200 text-center">
          <FileText className="mx-auto mb-2 text-gray-400 w-12 h-12" />
          <p className="text-gray-600">No history found. Try creating some Zoomary summaries first.</p>
        </div>
      )}

      {selectedItem ? (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{selectedItem.title}</h2>
            <Button
              variant="outline"
              className="border-gray-300 hover:border-red-600 hover:text-red-600"
              onClick={() => setSelectedItem(null)}
            >
              Back to List
            </Button>
          </div>

          <div className="flex items-center gap-6 mb-4 text-sm text-gray-500 flex-wrap">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Created: {formatDate(selectedItem.createdAt.toString())}</span>
            </div>
            {selectedItem.meetingDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Meeting: {formatDate(selectedItem.meetingDate.toString())}</span>
              </div>
            )}
            {selectedItem.recordingLink && (
              <div className="flex items-center">
                <Video className="w-4 h-4 mr-1" />
                <a
                  href={selectedItem.recordingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-700 hover:underline transition-colors"
                >
                  View Recording
                </a>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Summary</h3>
            <div
              id="summary-content"
              className="bg-gray-50 p-4 rounded-lg prose max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedItem.summary }}
            />

            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-blue-600 hover:text-blue-600"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-green-600 hover:text-green-600"
                onClick={printHistory}
              >
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-purple-600 hover:text-purple-600"
                onClick={downloadAsPdf}
              >
                <Download className="w-4 h-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-red-600">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(item.meetingDate?.toString() || '')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        className="flex items-center px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors"
                        onClick={() => handleViewDetails(item)}
                        aria-label="View details"
                      >
                        <Eye className="w-5 h-5 mr-1" />
                        <span>View</span>
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        onClick={(e) => handleDeleteHistoryItem(item._id, e)}
                        aria-label="Delete item"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
