import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcessingOptionType } from "./ProcessingOptions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Copy, Mail, Check } from "lucide-react";
import { toast } from "sonner";

interface ResultsDisplayProps {
    processingOption: ProcessingOptionType;
    results: {
        summary?: string;
        questions?: { question: string; answer: string }[];
        insights?: {
            keyTakeaways: string[];
            strengths: string[];
            gaps: string[];
            actionPoints: string[];
        };
        reportUrl?: string;
    };
    onReset: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    processingOption,
    results,
    onReset,
}) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopyToClipboard = () => {
        let content = "";

        if (results.summary) {
            content += `SUMMARY:\n${results.summary}\n\n`;
        }

        if (results.questions && results.questions.length > 0) {
            content += "QUESTIONS & ANSWERS:\n";
            results.questions.forEach(({ question, answer }) => {
                content += `Q: ${question}\nA: ${answer}\n\n`;
            });
        }

        if (results.insights) {
            content += "INSIGHTS:\n";

            content += "Key Takeaways:\n";
            results.insights.keyTakeaways.forEach((item) => {
                content += `- ${item}\n`;
            });
            content += "\n";

            content += "Strengths:\n";
            results.insights.strengths.forEach((item) => {
                content += `- ${item}\n`;
            });
            content += "\n";

            content += "Gaps:\n";
            results.insights.gaps.forEach((item) => {
                content += `- ${item}\n`;
            });
            content += "\n";

            content += "Action Points:\n";
            results.insights.actionPoints.forEach((item) => {
                content += `- ${item}\n`;
            });
        }

        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success("Content copied to clipboard");

        setTimeout(() => {
            setCopied(false);
        }, 3000);
    };

    const handleDownload = () => {
        // This is a placeholder - in a real implementation you would generate a PDF
        toast.success("Report download started");
    };

    const handleSendEmail = () => {
        // This is a placeholder - in a real implementation you would show an email form
        toast.success("Email sharing option will open in a modal");
    };

    if (!processingOption) return null;

    const getTitleByOption = () => {
        switch (processingOption) {
            case "summarize":
                return "Document Summary";
            case "questions":
                return "Questions & Answers";
            case "insights":
                return "Document Insights";
            case "report":
                return "Custom Report";
            default:
                return "Results";
        }
    };

    const renderContent = () => {
        switch (processingOption) {
            case "summarize":
                return (
                    <div className="prose max-w-none">
                        <p className="text-appGray-700 whitespace-pre-line">{results.summary}</p>
                    </div>
                );

            case "questions":
                return (
                    <div className="space-y-6">
                        {results.questions?.map((qa, index) => (
                            <div key={index} className="border-b border-appGray-200 pb-4 last:border-0">
                                <h4 className="font-semibold text-appRed mb-2">Q: {qa.question}</h4>
                                <p className="text-appGray-700">{qa.answer}</p>
                            </div>
                        ))}
                    </div>
                );

            case "insights":
                return (
                    <Tabs defaultValue="takeaways" className="w-full">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="takeaways">Key Takeaways</TabsTrigger>
                            <TabsTrigger value="strengths">Strengths</TabsTrigger>
                            <TabsTrigger value="gaps">Gaps</TabsTrigger>
                            <TabsTrigger value="actions">Action Points</TabsTrigger>
                        </TabsList>
                        <TabsContent value="takeaways" className="space-y-2">
                            {results.insights?.keyTakeaways.map((item, i) => (
                                <div key={i} className="bg-white p-3 rounded-md shadow-sm">
                                    {item}
                                </div>
                            ))}
                        </TabsContent>
                        <TabsContent value="strengths" className="space-y-2">
                            {results.insights?.strengths.map((item, i) => (
                                <div key={i} className="bg-white p-3 rounded-md shadow-sm border-l-4 border-green-500">
                                    {item}
                                </div>
                            ))}
                        </TabsContent>
                        <TabsContent value="gaps" className="space-y-2">
                            {results.insights?.gaps.map((item, i) => (
                                <div key={i} className="bg-white p-3 rounded-md shadow-sm border-l-4 border-appRed">
                                    {item}
                                </div>
                            ))}
                        </TabsContent>
                        <TabsContent value="actions" className="space-y-2">
                            {results.insights?.actionPoints.map((item, i) => (
                                <div key={i} className="bg-white p-3 rounded-md shadow-sm border-l-4 border-blue-500">
                                    {item}
                                </div>
                            ))}
                        </TabsContent>
                    </Tabs>
                );

            case "report":
                return (
                    <div className="text-center p-6">
                        <p className="text-appGray-700 mb-4">
                            Your custom report has been generated and is ready for download.
                        </p>
                        <Button onClick={handleDownload} className="bg-appRed hover:bg-appRed/90 text-white">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF Report
                        </Button>
                    </div>
                );

            default:
                return <p>No results to display.</p>;
        }
    };

    return (
        <Card className="border border-appGray-300 animate-fade-in">
            <CardHeader>
                <CardTitle className="text-xl">{getTitleByOption()}</CardTitle>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopyToClipboard}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                    {processingOption !== "report" && (
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleSendEmail}>
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </Button>
                </div>
                <Button
                    variant="default"
                    onClick={onReset}
                    className="bg-appRed hover:bg-appRed/90 text-white"
                >
                    Analyze Another Document
                </Button>
            </CardFooter>
        </Card>
    );
};