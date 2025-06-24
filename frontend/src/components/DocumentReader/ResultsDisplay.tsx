import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Mail, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProcessingOptionType } from "./ProcessingOptions";
import html2pdf from 'html2pdf.js'
import { useAxios, useData } from "@/context/AppContext";
import SendEmailDialog from "../Custom/SendEmailDialog";

interface ResultsDisplayProps {
    results: {
        processingOption: ProcessingOptionType;
        result: any;
    };
    onReset: () => void;
    isStreaming?: boolean;
}

// Utility to clean code fences from HTML string
function cleanCodeFences(htmlString: string): string {
    if (typeof htmlString !== 'string') return '';
    return htmlString
        .replace(/^\s*```(?:html)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
    results,
    onReset,
    isStreaming = false,
}) => {
    const axios = useAxios("user");
    const { userAuth } = useData();
    const [copied, setCopied] = React.useState(false);
    const [isEmailSending, setIsEmailSending] = useState(false);
    const [emailSuccessOpen, setEmailSuccessOpen] = useState(false);
    const [sentToEmail, setSentToEmail] = useState("");
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


    const handleSendEmail = async (submission) => {
        setIsEmailSending(true);
        try {
            const reportElement = document.getElementById('report-content')

            if (!reportElement) {
                toast.error("Could not generate PDF. Please try again.")
                setIsEmailSending(false);
                return
            }

            // Configure PDF options
            const options = {
                margin: [10, 10, 10, 10],
                filename: `${submission?.tool || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }

            const worker = html2pdf().set(options).from(reportElement);

            // Get PDF as base64
            const blob = await worker.outputPdf("blob");
            const pdfFile = new File([blob], 'report.pdf', { type: 'application/pdf' });
            let base64PDF = await fileToBase64(pdfFile)

            const parser = new DOMParser();
            const doc = parser.parseFromString(submission.result, 'text/html');
            const h1Text = doc.querySelector('h1')?.textContent || 'Default Subject';

            await axios.post("/users/email", {
                to: userAuth?.user?.email,
                subject: h1Text || "",
                body: `
                <!DOCTYPE html>
                <html>
                  <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                    <p>Dear ${userAuth?.user?.userName},</p>
                    <p>Please find enclosed the ${h1Text} Plan as requested by you.</p>
                  </body>
                </html>`,
                attachment: base64PDF
            })

            // Save the email for displaying in success popup
            setSentToEmail(userAuth?.user?.email);

            // Show success popup
            setEmailSuccessOpen(true);
        } catch (error) {
            console.error("Email sending error:", error);
            toast.error("Failed to send email. Please try again.");
        } finally {
            // Set loading state back to false
            setIsEmailSending(false);
        }
    }

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // @ts-ignore
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };

            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
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
        const cleanedResult = cleanCodeFences(results.result);
        switch (results.processingOption) {
            case "summarize":
                return (
                    <div id="report-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: cleanedResult }} className="max-w-none" />
                );

            case "questions":
                return (
                    <div id="report-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: cleanedResult }} className="max-w-none" />
                );

            case "insights":
                return (
                    <div id="report-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: cleanedResult }} className="max-w-none" />
                );

            case "report":
                return (
                    <div id="report-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: cleanedResult }} className="max-w-none" />
                );

            default:
                return <p id="report-content" ref={contentRef}>No results to display.</p>;
        }
    };


    return (
        <div>

            <Card className="border border-appGray-300 animate-fade-in">
                <CardHeader>
                    <CardTitle className="text-xl">{getTitleByOption()}</CardTitle>
                </CardHeader>
                <CardContent>{renderContent()}</CardContent>
                <CardFooter className="flex justify-between flex-wrap gap-2">
                    <div className="flex gap-2">
                        <Button
                            className="bg-primary-red hover:bg-red-700 flex items-center"
                            onClick={() => handleSendEmail(results)}
                            disabled={isEmailSending || isStreaming}
                        >
                            {isEmailSending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send to Email
                                </>
                            )}
                        </Button>
                        <Button variant="outline" onClick={handleCopyToClipboard} disabled={isStreaming}>
                            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                        {results.processingOption !== "report" && (
                            <Button variant="outline" onClick={handleDownload} disabled={isStreaming}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </Button>
                        )}
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
            <SendEmailDialog
                emailSuccessOpen={emailSuccessOpen}
                setEmailSuccessOpen={setEmailSuccessOpen}
                sentToEmail={sentToEmail}
            />

        </div>
    );
};