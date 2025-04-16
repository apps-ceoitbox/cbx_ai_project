

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, DownloadCloud, Eye } from "lucide-react";
import { UserInfo } from "@/components/AstroDISC/UserInfoForm";
import { DiscResults } from "@/components/AstroDISC/DiscQuiz";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import AddPromptsDialogBox from "./AddPromptsDialogBox";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useAxios } from "@/context/AppContext";
import useReRenderEffect from "@/hooks/useReRenderEffect";


// Mock data for demonstration purposes
// In a real application, this would come from your backend/database
interface UserSubmission {
    id: string;
    submittedAt: Date;
    userInfo: Pick<UserInfo, "fullName" | "placeOfBirth" | "gender" | "profession"> & { dateOfBirth: string; timeOfBirth: string; };
    discResults: DiscResults;
}

const mockSubmissions: UserSubmission[] = [
    {
        id: "usr-001",
        submittedAt: new Date(2025, 3, 10),
        userInfo: {
            fullName: "Jane Smith",
            dateOfBirth: "1990-05-15",
            timeOfBirth: "08:30",
            placeOfBirth: "New York, USA",
            gender: "Female",
            profession: "Software Engineer"
        },
        discResults: {
            d: 8,
            i: 12,
            s: 5,
            c: 7,
            primaryType: "I",
            secondaryType: "D"
        }
    },
    {
        id: "usr-002",
        submittedAt: new Date(2025, 3, 11),
        userInfo: {
            fullName: "John Doe",
            dateOfBirth: "1985-09-22",
            timeOfBirth: "14:15",
            placeOfBirth: "London, UK",
            gender: "Male",
            profession: "Marketing Manager"
        },
        discResults: {
            d: 10,
            i: 6,
            s: 9,
            c: 11,
            primaryType: "C",
            secondaryType: "D"
        }
    },
    {
        id: "usr-003",
        submittedAt: new Date(2025, 3, 12),
        userInfo: {
            fullName: "Maria Garcia",
            dateOfBirth: "1992-11-07",
            timeOfBirth: "22:45",
            placeOfBirth: "Madrid, Spain",
            gender: "Female",
            profession: "Psychologist"
        },
        discResults: {
            d: 4,
            i: 5,
            s: 14,
            c: 9,
            primaryType: "S",
            secondaryType: "C"
        }
    },
    {
        id: "usr-004",
        submittedAt: new Date(2025, 3, 13),
        userInfo: {
            fullName: "Raj Patel",
            dateOfBirth: "1988-02-29",
            timeOfBirth: "12:00",
            placeOfBirth: "Mumbai, India",
            gender: "Male",
            profession: "Financial Analyst"
        },
        discResults: {
            d: 15,
            i: 7,
            s: 6,
            c: 8,
            primaryType: "D",
            secondaryType: "C"
        }
    },
    {
        id: "usr-005",
        submittedAt: new Date(2025, 3, 14),
        userInfo: {
            fullName: "Emma Wilson",
            dateOfBirth: "1995-07-19",
            timeOfBirth: "03:30",
            placeOfBirth: "Sydney, Australia",
            gender: "Female",
            profession: "UX Designer"
        },
        discResults: {
            d: 6,
            i: 15,
            s: 8,
            c: 5,
            primaryType: "I",
            secondaryType: "S"
        }
    }
];

const AstroAdminDashboard = () => {
    const axios = useAxios("admin")
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [apiProviders, setApiProviders] = useState([]);
    const [selectedApiProvider, setSelectedApiProvider] = useState("");
    const [selectedApiModel, setSelectedApiModel] = useState("");
    const [formData, setFormData] = useState({});
    const itemsPerPage = 10;

    // Filter submissions based on search query
    const filteredSubmissions = mockSubmissions.filter(submission =>
        submission.userInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.userInfo.profession.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const models = (apiProviders || []).find(item => item?.name == selectedApiProvider)?.models || [];

    // Paginate results
    const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
    const paginatedSubmissions = filteredSubmissions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Format date to a readable string
    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleExportCSV = () => {
        // In a real implementation, this would generate and download a CSV
        alert("CSV export functionality would be implemented here");
    };

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
            setApiProviders(res.data.data.filter(item => {
                return item.apiKey && item.models.length > 0
            }))
        })
        axios.get("/astro").then(res => {
            setFormData(res.data.data)
            setSelectedApiProvider(res.data.data.aiProvider.name)
            setSelectedApiModel(res.data.data.aiProvider.model)
        })
    }, [])

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

                            <AddPromptsDialogBox formData={formData} open={open} setOpen={setOpen} onSubmit={handleSaveSettings} />
                        </div>

                    </div>

                    <p className="text-muted-foreground">View and manage AstroDISC user submissions</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{mockSubmissions.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Type D Dominant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {mockSubmissions.filter(s => s.discResults.primaryType === "D").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Type I Dominant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {mockSubmissions.filter(s => s.discResults.primaryType === "I").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Last Submission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">
                                {formatDate(new Date(Math.max(...mockSubmissions.map(s => s.submittedAt.getTime()))))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

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
                            <TableCaption>A list of AstroDISC submissions.</TableCaption>
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
                                {paginatedSubmissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">{submission.userInfo.fullName}</TableCell>
                                        <TableCell>
                                            {submission.userInfo.dateOfBirth} at {submission.userInfo.timeOfBirth}<br />
                                            <span className="text-xs text-muted-foreground">{submission.userInfo.placeOfBirth}</span>
                                        </TableCell>
                                        <TableCell>{submission.userInfo.profession}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                                                {submission.discResults.primaryType}
                                            </span>
                                            <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium">
                                                {submission.discResults.secondaryType}
                                            </span>
                                        </TableCell>
                                        <TableCell>{formatDate(submission.submittedAt)}</TableCell>
                                        <TableCell>

                                            <Dialog >
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="text-red-500" title="Remove">
                                                        <Eye
                                                            className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
                                                    This is preview model
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {paginatedSubmissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-6">
                                            No results found for "{searchQuery}"
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {filteredSubmissions.length > itemsPerPage && (
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

                <div className="mt-8 text-center">
                    <Link to="/admin">
                        <Button variant="outline">Return to App</Button>
                    </Link>
                </div>
            </main>

            {/* <footer className="py-6 px-4 text-center text-sm text-muted-foreground border-t">
                <p>© {new Date().getFullYear()} AstroDISC • Cosmic Personality Insights</p>
            </footer> */}
        </div>
    );
};

export default AstroAdminDashboard;
