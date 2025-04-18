import { Button } from "@/components/ui/button";
import { FileText, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const ReportsDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-5xl mx-auto min-h-screen py-5">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-appBlack mb-2">Dashboard</h1>
                <p className="text-appGray-700">
                    Welcome to the Smart Document Analysis Platform
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/document-reader")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle>Smart Document Reader</CardTitle>
                            <CardDescription>
                                Analyze, summarize and extract insights from business documents
                            </CardDescription>
                        </div>
                        <FileText className="h-8 w-8 text-appRed" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-appGray-700">
                            Upload business documents like proposals, reports, manuals and more, then use AI to analyze and extract valuable insights.
                        </p>
                        <Button
                            className="w-full mt-4 bg-appRed hover:bg-appRed/90 text-white"
                            onClick={() => navigate("/document-reader")}
                        >
                            Open Document Reader
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/settings")}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle>Settings</CardTitle>
                            <CardDescription>
                                Configure application preferences
                            </CardDescription>
                        </div>
                        <Settings className="h-8 w-8 text-appGray-700" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-appGray-700">
                            Configure your application settings, manage API connections, and customize your document processing preferences.
                        </p>
                        <Button
                            className="w-full mt-4 bg-appGray-700 hover:bg-appGray-900 text-white"
                            onClick={() => navigate("/settings")}
                            variant="outline"
                        >
                            Open Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-appGray-700">
                        Your document processing history will appear here once you start analyzing documents.
                    </p>
                </CardContent>
            </Card>
        </div>

    );
};

export default ReportsDashboard; 