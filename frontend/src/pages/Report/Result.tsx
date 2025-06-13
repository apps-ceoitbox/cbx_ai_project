import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAxios } from '@/context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, HelpCircle, Loader2 } from 'lucide-react';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { formatDateTime } from '../Admin/Admin';

const Result = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const axios = useAxios("user");
    const [report, setReport] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);


    const getSubmission = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/view/${id}`);
            setReport(response?.data?.data);
        } catch (error) {
            console.error("Error fetching submission:", error);

        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getSubmission();
    }, [])

    return (
        <div className='w-full h-full p-4 bg-gray-100'>
            <div style={{ maxWidth: "90vw", margin: "auto" }}>
                <Tabs defaultValue="result" className="w-full" style={{ overflow: "hidden" }}>
                    <TabsList className="mb-4 mt-3 w-full" >
                        <TabsTrigger
                            value="question"
                            className="flex items-center justify-center gap-2 text-black bg-white border border-gray-200 data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
                            style={{ width: "50%" }}
                        >
                            <HelpCircle className="w-4 h-4" /> Q & A
                        </TabsTrigger>

                        <TabsTrigger
                            value="result"
                            className="flex items-center justify-center gap-2 text-black bg-white border border-gray-200 data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
                            style={{ width: "50%" }}
                        >
                            <FileText className="w-4 h-4" /> Result
                        </TabsTrigger>
                    </TabsList>


                    {/* Result Tab */}
                    <TabsContent value="result" className="overflow-auto max-h-[70vh]">
                        <Card
                            className="mb-6 border-2 w-full max-w-[100%]  mx-auto mt-4 "
                            style={{ width: "100%" }}
                        >
                            <CardHeader className="bg-primary-red text-white rounded-t-lg">
                                <CardTitle className="text-2xl">{report?.tool || "Report"}</CardTitle>
                                <CardDescription className="text-gray-100">
                                    Generated on {formatDateTime(report?.createdAt)}
                                </CardDescription>
                            </CardHeader>

                            <CardContent
                                dangerouslySetInnerHTML={{ __html: report?.generatedContent }}
                                id="report-content"
                                className="pt-6"
                                style={{ padding: "0px" }}
                            />
                        </Card>
                    </TabsContent>


                    {/* Question Tab */}
                    <TabsContent value="question" style={{ overflowY: "auto", maxHeight: "70vh" }}>
                        <div className="space-y-6 px-4 py-6">
                            {Object.entries(report?.questionsAndAnswers ?? {})?.map(([question, answer], index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded shadow">
                                    <p className="font-semibold text-gray-800 mb-2">Q {index + 1}. {question}</p>
                                    <p className="text-gray-600"><b>Ans.</b> {answer as string}</p>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {isLoading &&
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
                    </div>
                }
            </div>
        </div>
    )
}

export default Result