import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumeHistory, deleteResumeHistoryItem } from "@/services/history.service";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface HistoryItem {
  id: string;
  date: string;
  title: string;
  content: string;
  candidateName: string;
  jobTitle: string;
  matchScore: number;
}

export const ResumeHistory = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const history = await getResumeHistory();
      setHistoryItems(history);
    } catch (error) {
      console.error("Failed to load resume analysis history:", error);
      toast.error("Failed to load history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResumeHistoryItem(id);
      setHistoryItems(historyItems.filter(item => item.id !== id));
      toast.success("History item deleted successfully");
    } catch (error) {
      console.error("Failed to delete history item:", error);
      toast.error("Failed to delete history item. Please try again.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-amber-100";
    return "bg-red-100";
  };

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Link to="/ai-agents/resume">

          <Button
            style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
            className="bg-primary-red  hover:bg-red-700 transition-colors duration-200 mr-4"
            variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900 pb-1 inline-block">Resume Analysis History</span>
        </h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : historyItems.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No history found. Analyze resumes to see your history here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {historyItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-gray-200 hover:border-red-200 transition-all duration-300">
              <CardHeader className="bg-gray-50 border-b border-gray-200 py-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold text-gray-800">{item.title}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>{new Date(item.date).toLocaleString()}</span>
                  <div className={`flex items-center font-medium ${getScoreColor(item.matchScore)}`}>
                    <span className={`${getScoreBackground(item.matchScore)} px-2 py-1 rounded-full text-sm`}>
                      Match Score: {item.matchScore}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Candidate</h3>
                    <p className="text-gray-600">{item.candidateName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Job Title</h3>
                    <p className="text-gray-600">{item.jobTitle}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Analysis Summary</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeHistory;
