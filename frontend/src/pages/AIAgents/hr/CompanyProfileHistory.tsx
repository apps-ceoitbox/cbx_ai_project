import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getCompanyProfileHistory, CompanyProfileHistoryItem } from '@/services/history.service';
import { ArrowLeft, Clock, FileText, Copy, Printer, Download, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export function CompanyProfileHistory({ selectedAgent, setSelectedAgent }) {
  const [history, setHistory] = useState<CompanyProfileHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CompanyProfileHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await getCompanyProfileHistory();
        if (Array.isArray(response)) {
          setHistory(response);
        } else {
          console.error('Expected array but got:', response);
          setHistory([]);
          setError('Invalid data format received from localStorage');
        }
      } catch (err) {
        setError('Failed to load history. Please try again later.');
        console.error('Error fetching Company Profile history:', err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewDetails = async (id: any) => {
    try {
      setLoading(true);
      setSelectedItem(id);
    } catch (err) {
      setError('Failed to load history item. Please try again later.');
      console.error('Error fetching Company Profile history item:', err);
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

  const printHistory = () => {
    if (!selectedItem) return;

    const content = document.getElementById('report-content');
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print the report');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${selectedItem.companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #333; }
            .container { max-width: 800px; margin: 0 auto; }
            .meta { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${selectedItem.companyName}</h1>
            <div class="meta">Source: ${selectedItem.sourcedFrom} | Created: ${formatDate(selectedItem.createdAt.toString())}</div>
            ${selectedItem.report}
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

    const content = document.getElementById('report-content');
    if (!content) return;

    // Create a temporary element for plain text extraction
    const tempElement = document.createElement('div');
    tempElement.innerHTML = selectedItem.report;
    const textContent = `${selectedItem.companyName}\n\nSource: ${selectedItem.sourcedFrom}\nCreated: ${formatDate(selectedItem.createdAt.toString())}\n\n${tempElement.textContent}`;

    navigator.clipboard.writeText(textContent)
      .then(() => toast.success('Report copied to clipboard'))
      .catch(() => toast.error('Failed to copy report'));
  };

  const downloadAsPdf = () => {
    if (!selectedItem) return;

    const content = document.getElementById('report-content');
    if (!content) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${selectedItem.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
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

  const filteredHistory = history?.filter(item =>
    item?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <div className="container py-8 min-h-screen">


      {/* <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link to="/ai-agents/hr">

            <Button onClick={() => setSelectedItem(null)}
              style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
              className="bg-primary-red  hover:bg-red-700 transition-colors duration-200 mr-4"
              variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
            Company Profile History
          </h1>
        </div>
      </div> */}
      {!selectedItem && (
        <div className='flex items-center gap-6 mb-6'>
          <div style={{ width: "20%" }}>
            <Label htmlFor="tool-filter">Agents</Label>
            <Select value={selectedAgent} onValueChange={(value) => setSelectedAgent(value)}>
              <SelectTrigger id="tool-filter">
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>

                <SelectItem value="zoom">
                  Zoom AI History
                </SelectItem>
                <SelectItem value="companyProfile">
                  Company Profile History
                </SelectItem>

              </SelectContent>
            </Select>
          </div>




          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-[12px] h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search company name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}


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



      {selectedItem ? (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{selectedItem.companyName}</h2>

            <Button onClick={() => setSelectedItem(null)}
              style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
              className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
              variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-6 mb-4 text-sm text-gray-500">
            {/* <div className="flex items-center">
              <Building className="w-4 h-4 mr-1" />
              <span>Source: {selectedItem.sourcedFrom}</span>
            </div> */}
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>Created: {formatDate(selectedItem.createdAt.toString())}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Company Report</h3>
            <div
              id="report-content"
              className="bg-gray-50 p-4 rounded-lg prose max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedItem.report }}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Company Name
                </th>
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Source
                </th> */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory?.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.companyName}</div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Building className="w-4 h-4 mr-1" />
                      <span>{item.sourcedFrom}</span>
                    </div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDate(item.createdAt.toString())}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-3">

                      <Button onClick={() => handleViewDetails(item)} className="text-black hover:text-red-500 hover:border-red-500" variant="outline" size="sm" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && history.length === 0 && !error && (
        <div className="p-8 bg-gray-100 rounded-lg border border-gray-200 text-center">
          <FileText className="mx-auto mb-2 text-gray-400 w-12 h-12" />
          <p className="text-gray-600">No history found. Try creating some company profiles first.</p>
        </div>
      )}
    </div>
  );
}
