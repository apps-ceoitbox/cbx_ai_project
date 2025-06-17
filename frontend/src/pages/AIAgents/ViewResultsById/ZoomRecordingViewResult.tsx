import { useAxios } from '@/context/AppContext';
import { formatDateTime } from '@/pages/Admin/Admin';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface ReportData {
    summary: string;
    title?: string;
    createdAt?: string;
}

const ZoomRecordingViewResult: React.FC = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const axios = useAxios("user");

    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getSubmission = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/view/zoom/${id}`);
            setReport(response?.data?.data);
        } catch (error) {
            console.error("Error fetching submission:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getSubmission();
    }, [id]);

    // Loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
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
                        <p className="text-2xl">{report?.title || "Report"}</p>
                        <p className="text-gray-100">
                            Generated on {formatDateTime(report?.createdAt)}
                        </p>
                    </div>


                    {/* Report Content */}
                    <div className="p-6">
                        <div
                            dangerouslySetInnerHTML={{ __html: report?.summary }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZoomRecordingViewResult;  