// @ts-nocheck
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
    CalendarIcon,
    Search,
    Eye,
    Download,
    FileText,
    Mail,
    LayoutDashboard,
    LogOut,
    Loader2,
    CheckCircle,
} from "lucide-react"

import { formatBoldText } from "../Report/Report"
import { useAxios, useData } from "@/context/AppContext"
import { formatDateTime } from "../Admin/Admin"
import html2pdf from 'html2pdf.js'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"
import { saveAs } from "file-saver"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import Header from "./Header"

const UserGeneratedPlans: React.FC = () => {
    const { userAuth, setUserAuth } = useData();
    const nav = useNavigate();
    const axios = useAxios("user")
    const [submissions, setSubmissions] = useState([]);
    const [isEmailSending, setIsEmailSending] = useState(false);
    const [emailSuccessOpen, setEmailSuccessOpen] = useState(false);
    const [sentToEmail, setSentToEmail] = useState("");

    const [filters, setFilters] = useState({
        tool: "",
        dateFrom: undefined as Date | undefined,
        dateTo: undefined as Date | undefined,
        api: "",
        search: "",
        group: "",
    })

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const getAllUserSubmissionsData = async () => {
        try {
            const res = await axios.get("/submission/user");
            setSubmissions(res?.data?.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getAllUserSubmissionsData();
    }, [])


    const clearFilters = () => {
        setFilters({
            tool: "",
            dateFrom: undefined,
            dateTo: undefined,
            api: "",
            search: "",
            group: ""
        })
    }


    const filteredSubmissions = submissions?.filter((submission) => {
        // Filter by tool
        if (filters.tool && filters.tool !== "all" && submission.tool !== filters.tool) {
            return false
        }

        // Filter by group
        if (filters.group && filters.group !== "all" && (submission?.category || "") !== filters.group) {
            return false;
        }

        // Filter by API
        if (filters.api && filters.api !== "all" && submission.apiUsed !== filters.api) {
            return false
        }

        // Filter by date range
        if (filters.dateFrom) {
            const submissionDate = new Date(submission.date)
            if (submissionDate < filters.dateFrom) {
                return false
            }
        }

        if (filters.dateTo) {
            const submissionDate = new Date(submission.date)
            const endOfDay = new Date(filters.dateTo)
            endOfDay.setHours(23, 59, 59, 999)
            if (submissionDate > endOfDay) {
                return false
            }
        }

        // Filter by search term
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            return (
                submission.name.toLowerCase().includes(searchTerm) ||
                submission.email.toLowerCase().includes(searchTerm) ||
                submission.company.toLowerCase().includes(searchTerm)
            )
        }

        return true
    })


    // Fixed PDF download function
    const handleDownloadPDF = (submission) => {
        // Get the report content element
        const reportElement = document.getElementById('report-content')

        if (!reportElement) {
            toast.error("Could not generate PDF. Please try again.")
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

        // Generate and download PDF
        html2pdf()
            .set(options)
            .from(reportElement)
            .save()
            .then(() => {
                toast.success("PDF Downloaded")
            })
            .catch(error => {
                console.error("PDF generation error:", error)
                toast.error("Failed to download PDF. Please try again.")
            })
    }

    // Fixed DOCX download function
    const handleDownloadDOCX = (submission) => {
        if (!submission?.generatedContent) {
            toast.error("No report data available.")
            return
        }

        try {
            // Create a new Document
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: [
                        new Paragraph({
                            text: submission.tool || "Report",
                            heading: HeadingLevel.TITLE,
                            thematicBreak: true,
                        }),
                        new Paragraph({
                            text: `Generated on ${new Date().toLocaleDateString()}`,
                            style: "Normal",
                        }),
                    ]
                }]
            })

            // Create an array to hold all section paragraphs
            const sectionParagraphs = []

            // Add each section as paragraphs
            submission.generatedContent.sections.forEach(section => {
                // Strip markdown bold syntax from strings for DOCX
                const title = section.title.replace(/\*\*/g, '')
                const content = section.content.replace(/\*\*/g, '')

                sectionParagraphs.push(
                    new Paragraph({
                        text: title,
                        heading: HeadingLevel.HEADING_2,
                        spacing: {
                            before: 400,
                            after: 200,
                        },
                    })
                )

                sectionParagraphs.push(
                    new Paragraph({
                        text: content,
                        style: "Normal",
                    })
                )
            })

            // Add a new section with all content
            doc.addSection({
                children: sectionParagraphs
            })

            // Generate and download DOCX
            Packer.toBlob(doc).then(blob => {
                saveAs(blob, `${submission.tool || 'Report'}_${new Date().toISOString().split('T')[0]}.docx`)
                toast.success("DOCX Downloaded")
            }).catch(error => {
                console.error("DOCX generation error:", error)
                toast.error("Failed to export DOCX. Please try again.")
            })
        } catch (error) {
            console.error("DOCX generation error:", error)
            toast.error("Failed to create DOCX. Please try again.")
        }
    }


    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // @ts-ignore
                const base64String = reader.result.split(',')[1]; // remove data:application/pdf;base64,
                resolve(base64String);
            };

            reader.onerror = reject;

            reader.readAsDataURL(file); // Triggers the conversion
        });
    };


    const handleSendEmail = async (submission) => {
        // Set loading state to true
        setIsEmailSending(true);

        try {
            // Get the report content element
            const reportElement = document.getElementById('report-content')

            if (!reportElement) {
                toast.error("Could not generate PDF. Please try again.")
                setIsEmailSending(false);
                return
            }

            // Configure PDF options
            const options = {
                margin: [10, 10, 10, 10],
                filename: `${submission?.title || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }

            const worker = html2pdf().set(options).from(reportElement);

            // Get PDF as base64
            const blob = await worker.outputPdf("blob");
            const pdfFile = new File([blob], 'report.pdf', { type: 'application/pdf' });
            let base64PDF = await fileToBase64(pdfFile)

            await axios.post("/users/email", {
                to: userAuth.user?.email,
                subject: submission.tool || "",
                body: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <p>Dear ${userAuth?.user?.userName},</p>
            <p>Please find enclosed the ${submission?.tool} Plan as requested by you.</p>
          </body>
        </html>`,
                attachment: base64PDF
            })

            // Save the email for displaying in success popup
            setSentToEmail(userAuth.user?.email);

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

    return (
        <div className="min-h-screen ">
            <Header />

            <Card
                // className=" mt-10 py-8 mx-10 "> 
                className="mt-10 mb-5 mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-12 py-8">
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* <div>
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-[12px] h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Name, email, company..."
                                    className="pl-8"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                />
                            </div>
                        </div> */}

                        <div>
                            <Label htmlFor="tool-filter">Tool</Label>
                            <Select value={filters.tool} onValueChange={(value) => handleFilterChange("tool", value)}>
                                <SelectTrigger id="tool-filter">
                                    <SelectValue placeholder="All tools" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All tools</SelectItem>
                                    {[...new Set(submissions?.map(item => item.tool))]?.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Group */}
                        <div>
                            <Label htmlFor="group-filter">Category</Label>
                            <Select value={filters.group} onValueChange={(value) => handleFilterChange("group", value)}>
                                <SelectTrigger id="group-filter">
                                    <SelectValue placeholder="All category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All category</SelectItem>
                                    {[...new Set(submissions?.map(item => item.category))]?.map((group) => (
                                        <SelectItem key={group} value={group}>
                                            {group}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* <div>
                            <Label htmlFor="api-filter">API Used</Label>
                            <Select value={filters.api} onValueChange={(value) => handleFilterChange("api", value)}>
                                <SelectTrigger id="api-filter">
                                    <SelectValue placeholder="All APIs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All APIs</SelectItem>
                                    {[...new Set(submissions?.map(item => item.apiUsed))]?.map((api) => (
                                        <SelectItem key={api._id} value={api}>
                                            {api}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> */}

                        <div className="flex items-center gap-4">
                            <div>
                                <Label>From Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !filters.dateFrom && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateFrom}
                                            onSelect={(date) => handleFilterChange("dateFrom", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label>To Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !filters.dateTo && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filters.dateTo}
                                            onSelect={(date) => handleFilterChange("dateTo", date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="mt-6">
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </div>

                        </div>
                    </div>


                    {/* Submissions table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader className="bg-primary-red" >
                                <TableRow className=" hover:bg-primary-red rounded-[10px]">
                                    <TableHead className="text-white font-[700]">Tool</TableHead>
                                    <TableHead className="text-white font-[700]">Category</TableHead>
                                    <TableHead className="text-white font-[700]">Date</TableHead>
                                    <TableHead className="text-white font-[700]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions?.length > 0 ? (
                                    filteredSubmissions?.map((submission) => (
                                        <TableRow key={submission.id} className="h-8 px-2">
                                            <TableCell className="py-2">{submission?.tool}</TableCell>
                                            <TableCell className="py-2">{submission?.category || "--"}</TableCell>
                                            <TableCell className="py-2">{formatDateTime(submission?.date)}</TableCell>
                                            <TableCell className="py-2">
                                                <div className="flex space-x-2">
                                                    <Dialog >
                                                        <DialogTrigger asChild>
                                                            <Button className=" text-black hover:text-red-500 hover:border-red-500" variant="outline" size="sm" title="View">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>

                                                        </DialogTrigger>
                                                        <DialogContent style={{ zIndex: 999 }} className="max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] max-h-[90vh] overflow-auto"  >

                                                            <div className="w-full  mx-auto mt-4" >
                                                                <Card className="border-2">
                                                                    <CardHeader className="bg-primary-red text-white rounded-t-lg">
                                                                        <CardTitle className="text-2xl">{submission?.tool}</CardTitle>
                                                                        <CardDescription className="text-gray-100">
                                                                            Generated on {formatDateTime(submission.createdAt)}
                                                                        </CardDescription>
                                                                    </CardHeader>

                                                                    <CardContent dangerouslySetInnerHTML={{ __html: submission?.generatedContent }} id="report-content" className="pt-6">

                                                                    </CardContent>

                                                                    <CardFooter className="flex flex-wrap gap-4 justify-center">
                                                                        <Button
                                                                            variant="outline"
                                                                            className="flex items-center"
                                                                            onClick={() => handleDownloadPDF(submission)}
                                                                        >
                                                                            <Download className="mr-2 h-4 w-4" />
                                                                            Download PDF
                                                                        </Button>
                                                                        {/* <Button
                                                                            variant="outline"
                                                                            className="flex items-center"
                                                                            onClick={() => handleDownloadDOCX(submission)}
                                                                        >
                                                                            <FileText className="mr-2 h-4 w-4" />
                                                                            Export DOCX
                                                                        </Button> */}

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
                                                                    </CardFooter>
                                                                </Card>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No submissions found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="text-sm text-muted-foreground mt-2">
                        Showing {filteredSubmissions?.length} of {submissions?.length} submissions
                    </div>
                </CardContent>



            </Card>

            {/* Success Email Dialog */}
            <Dialog open={emailSuccessOpen} onOpenChange={setEmailSuccessOpen}>
                <DialogContent className="sm:max-w-md border-2 border-primary-red"
                    style={{ zIndex: 999 }}>
                    <DialogHeader className="bg-primary-red text-white rounded-t-lg p-4 mt-3">
                        <DialogTitle className="flex items-center">
                            <CheckCircle className="h-6 w-6 text-white mr-2" />
                            Email Sent Successfully
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6 bg-white">
                        <p className="text-center font-medium text-black">
                            We have emailed the plan on{" "}
                            <span className="text-primary-red font-semibold">{sentToEmail}</span> ID
                        </p>
                    </div>
                    <DialogFooter className="p-4 bg-white">
                        <Button
                            className="w-full bg-primary-red hover:bg-red-700 text-white"
                            onClick={() => setEmailSuccessOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    )
}

export default UserGeneratedPlans; 