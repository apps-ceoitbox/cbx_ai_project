import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Mail, Check } from "lucide-react";
import { toast } from "sonner";
import { ProcessingOptionType } from "./ProcessingOptions";

interface ResultsDisplayProps {
    results: {
        processingOption: ProcessingOptionType;
        result: any;
    };
    onReset: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    results,
    onReset,
}) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopyToClipboard = () => {
        let content = "";

        // if (results.summary) {
        //     content += `SUMMARY:\n${results.summary}\n\n`;
        // }

        // if (results.questions && results.questions.length > 0) {
        //     content += "QUESTIONS & ANSWERS:\n";
        //     results.questions.forEach(({ question, answer }) => {
        //         content += `Q: ${question}\nA: ${answer}\n\n`;
        //     });
        // }

        // if (results.insights) {
        //     content += "INSIGHTS:\n";

        //     content += "Key Takeaways:\n";
        //     results.insights.keyTakeaways.forEach((item) => {
        //         content += `- ${item}\n`;
        //     });
        //     content += "\n";

        //     content += "Strengths:\n";
        //     results.insights.strengths.forEach((item) => {
        //         content += `- ${item}\n`;
        //     });
        //     content += "\n";

        //     content += "Gaps:\n";
        //     results.insights.gaps.forEach((item) => {
        //         content += `- ${item}\n`;
        //     });
        //     content += "\n";

        //     content += "Action Points:\n";
        //     results.insights.actionPoints.forEach((item) => {
        //         content += `- ${item}\n`;
        //     });
        // }

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

    if (!results.processingOption) return null;

    const getTitleByOption = () => {
        switch (results.processingOption) {
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
        switch (results.processingOption) {
            case "summarize":
                return (
                    <div dangerouslySetInnerHTML={{ __html: results.result }} className="max-w-none" />
                );

            case "questions":
                return (
                    <div dangerouslySetInnerHTML={{ __html: results.result }} className="max-w-none" />
                );

            case "insights":
                return (
                    <div dangerouslySetInnerHTML={{ __html: results.result }} className="max-w-none" />
                );

            case "report":
                return (
                    <div dangerouslySetInnerHTML={{ __html: results.result }} className="max-w-none" />
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
                    {results.processingOption !== "report" && (
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