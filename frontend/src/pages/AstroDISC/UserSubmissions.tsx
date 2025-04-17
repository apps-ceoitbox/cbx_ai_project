

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { Search, DownloadCloud, Eye, Loader2 } from "lucide-react";


import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAxios } from "@/context/AppContext";
import { formatDateTime } from "../Admin/Admin";
import UserSubmissionDialog from "../AstroDISCAdmin/UserSubmissionDialog";
import Header from "./Header";


const UserSubmissions = () => {
    const axios = useAxios("admin")
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [mockSubmissions, setMockSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 10;

    // Filter submissions based on search query
    const filteredSubmissions = mockSubmissions?.filter(submission =>
        submission?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission?.profession?.toLowerCase().includes(searchQuery.toLowerCase())
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
            let res = await axios.get("/astro/submissions");
            setMockSubmissions(res?.data?.data);
            // console.log("ress", res)
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }

    }

    useEffect(() => {
        getAllSubmissions()
    }, [])


    // Handle Export CSV
    const handleExportCSV = () => {
        const headers = [
            "Full Name",
            "Email",
            "Date of Birth",
            "Time of Birth",
            "Place of Birth",
            "Profession",
            "Primary Type",
            "Secondary Type",
            "Submission Date"
        ];

        // Format submissions data for CSV
        const csvData = filteredSubmissions.map(submission => [
            submission?.fullName || "",
            submission?.email || "",
            submission?.dateOfBirth ? new Date(submission?.dateOfBirth).toISOString().split('T')[0] : "",
            submission?.timeOfBirth || "",
            submission?.placeOfBirth || "",
            submission?.profession || "",
            submission?.generatedContent?.personalityDetails?.primaryType || "",
            submission?.personalityDetails?.secondaryType || "",
            submission?.createdAt ? formatDateTime(submission?.createdAt) : ""
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
        link.setAttribute('download', `astrodisc-submissions-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    return (
        <div className="min-h-screen flex flex-col cosmic-bg">
            <Header />
            <main className="flex-1 py-6 px-4 md:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name or profession..."
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
                            <TableHeader className="bg-primary-red">
                                <TableRow className=" hover:bg-primary-red rounded-[10px]">
                                    <TableHead className="text-white font-[700]">Name</TableHead>
                                    <TableHead className="text-white font-[700]">Birth Info</TableHead>
                                    <TableHead className="text-white font-[700]">Profession</TableHead>
                                    <TableHead className="text-white font-[700]">Primary Type</TableHead>
                                    <TableHead className="text-white font-[700]">Submission Date</TableHead>
                                    <TableHead className="text-white font-[700]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSubmissions?.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">{submission?.fullName}</TableCell>
                                        <TableCell>
                                            {submission?.dateOfBirth && submission?.timeOfBirth && (
                                                <>
                                                    {new Date(submission.dateOfBirth).toISOString().split('T')[0]} at {submission.timeOfBirth}
                                                    <br />
                                                </>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {submission?.placeOfBirth}
                                            </span>
                                        </TableCell>

                                        <TableCell>{submission?.profession || "--"}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-sm font-medium text-primary-red">
                                                {submission?.generatedContent?.personalityDetails?.primaryType}
                                            </span>
                                            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium">
                                                {submission?.generatedContent?.personalityDetails?.secondaryType}
                                            </span>
                                        </TableCell>
                                        <TableCell>{formatDateTime(submission?.createdAt)}</TableCell>
                                        <TableCell>

                                            <Dialog >
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="text-red-500" title="Remove">
                                                        <Eye
                                                            className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
                                                    <UserSubmissionDialog submission={submission} />
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {paginatedSubmissions?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-6">
                                            No results found
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
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                    />
                                </PaginationItem>

                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink
                                            isActive={currentPage === i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}

                                <PaginationItem>
                                    <PaginationNext
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
        </div>
    );
};

export default UserSubmissions; 
