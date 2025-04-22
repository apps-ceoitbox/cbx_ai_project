import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Mail, Check } from "lucide-react";
import { toast } from "sonner";
import { ProcessingOptionType } from "./ProcessingOptions";
import html2pdf from 'html2pdf.js'

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
    const contentRef = React.useRef<HTMLDivElement>(null);



    const handleCopyToClipboard = () => {
        if (!contentRef.current) return;

        const content = contentRef.current.innerText || contentRef.current.textContent || "";

        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            toast.success("Content copied to clipboard");

            setTimeout(() => {
                setCopied(false);
            }, 3000);
        }).catch(err => {
            toast.error("Failed to copy content");
            console.error("Failed to copy content: ", err);
        });
    };



    const handleDownload = () => {
        if (!contentRef.current) return;

        const filename = `${getTitleByOption().replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;

        const options = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Create PDF from the content div
        html2pdf()
            .from(contentRef.current)
            .set(options)
            .save()
            .then(() => {
                toast.success("Report downloaded successfully");
            })
            .catch(err => {
                toast.error("Failed to generate PDF");
                console.error("PDF generation failed: ", err);
            });
    };


    const handleSendEmail = () => {
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
                    <div ref={contentRef} dangerouslySetInnerHTML={{ __html: results.result }} className="max-w-none" />
                );

            case "questions":
                return (
                    <div ref={contentRef} dangerouslySetInnerHTML={{ __html: results.result }} className="max-w-none" />
                );

            case "insights":
                return (
                    <div ref={contentRef} dangerouslySetInnerHTML={{ __html: results.result }} className="max-w-none" />
                );

            case "report":
                return (
                    <div ref={contentRef} dangerouslySetInnerHTML={{ __html: results.result }} className="max-w-none" />
                );

            default:
                return <p ref={contentRef}>No results to display.</p>;
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