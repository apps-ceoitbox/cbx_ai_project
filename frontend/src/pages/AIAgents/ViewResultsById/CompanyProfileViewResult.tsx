import { useAxios } from '@/context/AppContext';
import { formatDateTime } from '@/pages/Admin/Admin';
import { Loader2, AlertCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface ReportData {
    report: string;
    title?: string;
    companyName?: string;
    createdAt?: string;
}

const CompanyProfileViewResult: React.FC = () => {
    const params = useParams<{ id: string }>();
    const navigate = useNavigate();
    const id = params.id;
    const axios = useAxios("user");

    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getSubmission = async () => {
        if (!id) {
            setError("No company ID provided");
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`/view/company-profile/${id}`);
            setReport(response?.data?.data);
        } catch (error) {
            console.error("Error fetching submission:", error);
            setError("Failed to load company profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getSubmission();
    }, [id]);

    const handleRetry = () => getSubmission();
    const handleGoBack = () => navigate(-1);


    // Loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center border border-red-200">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-black mb-2">
                        Unable to Load Profile
                    </h2>
                    <p className="text-gray-800 mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleRetry}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={handleGoBack}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-sm border">
                    {/* Report Header */}
                    <div className="bg-primary-red text-white rounded-t-lg p-6">
                        <p className="text-2xl">{report?.companyName || "Report"}</p>
                        <p className="text-gray-100">
                            Generated on {formatDateTime(report?.createdAt)}
                        </p>
                    </div>


                    {/* Report Content */}
                    <div className="p-6">
                        <div
                            className="prose prose-gray max-w-none
                prose-headings:text-gray-900 
                prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
                prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6
                prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:mt-4
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-ul:my-4 prose-li:text-gray-700
                prose-strong:text-gray-900
                prose-table:my-6 prose-th:bg-gray-50 prose-th:font-semibold
                prose-td:border-gray-200 prose-th:border-gray-200"
                            dangerouslySetInnerHTML={{ __html: report?.report }}
                        />
                    </div>
                </div>
            </div>


        </div>
    );
};

export default CompanyProfileViewResult;