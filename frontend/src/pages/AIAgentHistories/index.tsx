import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Calendar, Eye, Search, Users, Settings } from 'lucide-react';
import {
  getAllZoomaryHistory,
  ZoomaryHistoryItem,
  getAllCompanyProfileHistory,
  CompanyProfileHistoryItem,
  getAllMailSenderHistory,
  MailSenderHistoryItem,
} from '@/services/history.service';
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

type HistoryType = 'zoomary' | 'company-profile' | 'mail-sender';

type HistoryItem = ZoomaryHistoryItem | CompanyProfileHistoryItem | MailSenderHistoryItem;

const AIAgentHistories: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [historyType, setHistoryType] = useState<HistoryType>('zoomary');

  useEffect(() => {
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
          console.log(response, "res")
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
        }
      } catch (err) {
        setError('Failed to load history. Please try again later.');
        console.error(`Error fetching ${historyType} history:`, err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

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
      (item as any).subject?.toLowerCase().includes(searchLower)
    );
  });

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
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">User Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Name:</strong> {zoomaryItem.name}</p>
                  <p><strong>Email:</strong> {zoomaryItem.email}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2 text-gray-700">Summary</h3>
              <div
                id="summary-content"
                className="bg-gray-50 p-4 rounded-lg prose max-w-none"
                dangerouslySetInnerHTML={{ __html: zoomaryItem.summary }}
              />
            </div>
          </div>
        );
      } else if (historyType === 'company-profile') {
        const companyProfileItem = selectedItem as CompanyProfileHistoryItem;
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{companyProfileItem.companyName}</h2>
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
                <Calendar className="w-4 h-4 mr-1" />
                <span>Created: {formatDate(companyProfileItem.createdAt.toString())}</span>
              </div>
              {companyProfileItem.sourcedFrom && (
                <div className="flex items-center">
                  <span>Source: {companyProfileItem.sourcedFrom}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              {(companyProfileItem.name || companyProfileItem.email) && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">User Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {companyProfileItem.name && <p><strong>Name:</strong> {companyProfileItem.name}</p>}
                    {companyProfileItem.email && <p><strong>Email:</strong> {companyProfileItem.email}</p>}
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold mb-2 text-gray-700">Company Report</h3>
              <div
                id="report-content"
                className="bg-gray-50 p-4 rounded-lg prose max-w-none "
                dangerouslySetInnerHTML={{ __html: companyProfileItem.report }}
              />
            </div>
          </div>
        );
      } else if (historyType === 'mail-sender') {
        const mailSenderItem = selectedItem as MailSenderHistoryItem;
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{mailSenderItem.subject}</h2>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Title
                    </th>
                  ) : historyType === 'company-profile' ? (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Company Name
                    </th>
                  ) : (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Subject
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {historyType === 'mail-sender' ? 'Recipient' : 'Name'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    {historyType === 'mail-sender' ? 'Name' : 'Email'}
                  </th>
                  {historyType === 'mail-sender' && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Email
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((item) => {
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
                            <button
                              className="flex items-center px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors"
                              onClick={() => handleViewDetails(zoomaryItem)}
                              aria-label="View details"
                            >
                              <Eye className="w-5 h-5 mr-1" />
                              <span>View</span>
                            </button>
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
                            <button
                              className="flex items-center px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors"
                              onClick={() => handleViewDetails(companyProfileItem)}
                              aria-label="View details"
                            >
                              <Eye className="w-5 h-5 mr-1" />
                              <span>View</span>
                            </button>
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
    <div className="mx-auto py-8 px-10">

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

    </div>
  );
};

export default AIAgentHistories;