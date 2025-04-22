

import { useEffect, useState } from "react";
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
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAxios } from "@/context/AppContext";
import { formatDateTime } from "../Admin/Admin";
import AddDoucmentReaderPromt from "./AddDoucmentReaderPromt";




const Settings = () => {
    const axios = useAxios("admin")
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [apiProviders, setApiProviders] = useState([]);
    const [selectedApiProvider, setSelectedApiProvider] = useState("");
    const [selectedApiModel, setSelectedApiModel] = useState("");
    const [mockSubmissions, setMockSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const itemsPerPage = 10;

    // Filter submissions based on search query
    const filteredSubmissions = mockSubmissions?.filter(submission =>
        submission?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission?.profession?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const models = (apiProviders || []).find(item => item?.name == selectedApiProvider)?.models || [];

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
            // setCountsData(res?.data);
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

    const handleSaveSettings = async (data = {}) => {
        await axios.post("/astro", data)
        setOpen(false)
    }
    const handleSaveAISettings = async (data = {}) => {
        await axios.post("/astro", {
            ...data
        })
    }

    useEffect(() => {
        axios.get("/aiSettings").then(res => {
            setApiProviders(res?.data?.data.filter(item => {
                return item.apiKey && item.models.length > 0
            }))
        })
        axios.get("/astro").then(res => {
            setFormData(res?.data?.data)
            setSelectedApiProvider(res?.data?.data?.aiProvider?.name)
            setSelectedApiModel(res?.data?.data?.aiProvider?.model)
        })
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

            <main className="flex-1 py-6 px-4 md:px-6 lg:px-8">
                <div className="mb-6">
                    <div className="flex justify-between">
                        <h1 className="text-3xl font-bold text-red-500">Admin Dashboard</h1>

                        <div className="flex items-center gap-4">
                            <Select value={selectedApiProvider} onValueChange={val => {
                                setSelectedApiProvider(val)
                                const newModel = apiProviders.find(item => item.name == val).models[0]
                                setSelectedApiModel(newModel)
                                handleSaveAISettings({
                                    aiProvider: {
                                        name: val,
                                        model: newModel
                                    },
                                })
                            }}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Select an AI Provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>AI Providers</SelectLabel>
                                        {
                                            apiProviders.map(item => {
                                                return <SelectItem value={item.name}>{item.name}</SelectItem>
                                            })
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select value={selectedApiModel} onValueChange={val => {
                                setSelectedApiModel(val)
                                handleSaveAISettings({
                                    aiProvider: {
                                        name: selectedApiProvider,
                                        model: val
                                    },
                                })
                            }}>
                                <SelectTrigger className="w-[250px]">
                                    <SelectValue placeholder="Select an AI Model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>AI Models</SelectLabel>
                                        {
                                            models.map(item => {
                                                return <SelectItem value={item}>{item}</SelectItem>
                                            })
                                        }
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <AddDoucmentReaderPromt formData={formData} open={open} setOpen={setOpen} onSubmit={handleSaveSettings} />
                        </div>

                    </div>

                    <p className="text-muted-foreground">View and manage Doucment Reader user submissions</p>
                </div>

                {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{countsData?.totalSubmissions}</div>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Last Submission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">
                                {formatDateTime(countsData?.lastSubmission)}

                            </div>
                        </CardContent>
                    </Card>
                </div> */}

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
                            <TableCaption className="mb-2">A list of DoucmentReader submissions.</TableCaption>
                            <TableHeader className="bg-primary-red">
                                <TableRow className=" hover:bg-primary-red rounded-[10px]">
                                    <TableHead className="text-white font-[700]">Name</TableHead>
                                    <TableHead className="text-white font-[700]">Profession</TableHead>
                                    <TableHead className="text-white font-[700]">Submission Date</TableHead>
                                    <TableHead className="text-white font-[700]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSubmissions?.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">{submission?.fullName}</TableCell>
                                        <TableCell>{submission?.profession || "--"}</TableCell>
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
                                                    {/* <UserSubmissionDialog submission={submission} /> */}
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

                {/* <div className="mt-8 text-center">
                    <Link to="/admin">
                        <Button variant="outline">Return to App</Button>
                    </Link>
                </div> */}
            </main>

            {isLoading &&
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
                </div>
            }
        </div>
    );
};

export default Settings; 
