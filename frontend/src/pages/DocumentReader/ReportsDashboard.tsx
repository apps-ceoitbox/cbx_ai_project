


import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, DownloadCloud, Eye, Loader2, Download, Check, Copy, Mail } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAxios, useData } from "@/context/AppContext";
import { formatDateTime } from "../Admin/Admin";
import Header from "./Header";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js'
import SendEmailDialog from "@/components/Custom/SendEmailDialog";



const ReportsDashboard = () => {
    const axios = useAxios("user");
    const { userAuth } = useData();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [mockSubmissions, setMockSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 10;
    const [isMobile, setIsMobile] = useState(false);
    const [copied, setCopied] = React.useState(false);
    const [isEmailSending, setIsEmailSending] = useState(false);
    const [emailSuccessOpen, setEmailSuccessOpen] = useState(false);
    const [sentToEmail, setSentToEmail] = useState("");
    const contentRef = React.useRef<HTMLDivElement>(null);

    console.log(isMobile)


    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Filter submissions based on search query
    const filteredSubmissions = mockSubmissions?.filter(submission =>
        submission?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission?.documentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission?.processingOption?.toLowerCase().includes(searchQuery.toLowerCase())
    );


    // Paginate results
    const totalPages = Math.ceil(filteredSubmissions?.length / itemsPerPage);
    const paginatedSubmissions = filteredSubmissions?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    const getAllSubmissions = async () => {
        try {
            setIsLoading(true);
            let res = await axios.get("/document/user-submissions");
            setMockSubmissions(res?.data?.data);
            console.log("res", res)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }

    }

    useEffect(() => {
        getAllSubmissions();
    }, [])


    // Handle Export CSV
    const handleExportCSV = () => {
        const headers = [
            "Full Name",
            "Email",
            "Document Type",
            "Processing Option",
            "Submission Date",
            "Result",
        ];

        // Format submissions data for CSV 
        const csvData = filteredSubmissions?.map(submission => [
            submission?.name || "",
            submission?.email || "",
            submission?.documentType || "",
            submission?.processingOption || "",
            submission?.createdAt ? formatDateTime(submission?.createdAt) : "",
            submission?.result || "",
        ]);

        // Combine header and data rows
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell =>
                // Handle commas and quotes in cell content
                `"${String(cell).replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        // Create and download the CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `doucment-submissions-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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

    const handleDownload = (submission) => {
        if (!contentRef.current) return;

        const filename = `${getTitleByOption(submission).replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;

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

    const getTitleByOption = (submission) => {
        switch (submission.processingOption) {
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
                to: submission?.email,
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
            setSentToEmail(submission?.email);

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


    return (
        <div className="min-h-screen flex flex-col cosmic-bg">
            <Header />
            <main className="flex-1 py-6 px-4 md:px-6 lg:px-8">

                <div className="mb-6 flex justify-between items-center gap-2">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name, email, document type..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Button variant="outline" onClick={handleExportCSV}>
                        <DownloadCloud className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableCaption className="mb-2">A list of DoucmentReader submissions.</TableCaption>
                            <TableHeader className="bg-primary-red">
                                <TableRow className=" hover:bg-primary-red rounded-[10px]">
                                    <TableHead className="text-white font-[700]">Name</TableHead>
                                    <TableHead className="text-white font-[700]">Email</TableHead>
                                    <TableHead className="text-white font-[700]">Document Type</TableHead>
                                    <TableHead className="text-white font-[700]">Processing Option</TableHead>
                                    <TableHead className="text-white font-[700]">Submission Date</TableHead>
                                    <TableHead className="text-white font-[700]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSubmissions?.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">{submission?.name}</TableCell>
                                        <TableCell>{submission?.email}</TableCell>
                                        <TableCell>{submission?.documentType || "--"}</TableCell>
                                        <TableCell>{submission?.processingOption || "--"}</TableCell>
                                        <TableCell>{formatDateTime(submission?.createdAt)}</TableCell>
                                        <TableCell >
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500"
                                                        title="View"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>

                                                <DialogContent
                                                    className="sm:max-w-4xl max-h-[95vh] overflow-y-auto"
                                                >
                                                    <div id="report-content" ref={contentRef} dangerouslySetInnerHTML={{ __html: submission?.result }} />
                                                    <DialogFooter>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" onClick={handleCopyToClipboard}>
                                                                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                                                {copied ? "Copied" : "Copy"}
                                                            </Button>
                                                            {submission.processingOption !== "report" && (
                                                                <Button variant="outline" onClick={() => handleDownload(submission)}>
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download
                                                                </Button>
                                                            )}
                                                            <Button
                                                                className="bg-primary-red hover:bg-red-700 flex items-center"
                                                                onClick={() => handleSendEmail(submission)}
                                                                disabled={isEmailSending}
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
                                                        </div>
                                                    </DialogFooter>
                                                </DialogContent>

                                            </Dialog>
                                        </TableCell>

                                    </TableRow>
                                ))}

                                {paginatedSubmissions?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6">
                                            No results found for {searchQuery}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {filteredSubmissions?.length > itemsPerPage && (
                    <div className="mt-6">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            style={{ cursor: "pointer" }}
                                            isActive={currentPage === i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}

            </main>

            {isLoading &&
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
                </div>
            }

            <SendEmailDialog
                emailSuccessOpen={emailSuccessOpen}
                setEmailSuccessOpen={setEmailSuccessOpen}
                sentToEmail={sentToEmail}
            />
        </div>
    );
};

export default ReportsDashboard;

