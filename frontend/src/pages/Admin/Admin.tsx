
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ChevronDown,
  Search,
  Settings,
  Users,
  FileText,
  X,
  Edit,
  Trash,
  Eye,
  ArrowLeft,
  Download,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useAxios, useData } from "@/context/AppContext"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatBoldText } from "../Report/Report"
import html2pdf from 'html2pdf.js'
import { Document, Packer, Paragraph, HeadingLevel } from "docx"
import { saveAs } from "file-saver"

export const templateCategories = ["Operations", "Marketing", "Sales", "Finance", "HR", "Strategy", "Compliances"]

export interface AiSettingsInterface {
  _id: string;
  name: string;
  models: string[];
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface PromptInterface {
  _id: string;
  heading: string;
  category: string;
  visibility: boolean;
  objective: string;
  initialGreetingsMessage: string;
  questions: string[];
  knowledgeBase: string;
  promptTemplate: string;
  defaultAiProvider: DefaultAiProvider;
  // createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

interface DefaultAiProvider {
  name: string;
  model: string;
}


export default function AdminDashboard() {
  const nav = useNavigate()
  const axios = useAxios("admin")
  const { adminAuth, setAdminAuth } = useData();
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [submissions, setSubmissions] = useState([]);
  const [apiProviders, setApiProviders] = useState<AiSettingsInterface[]>([]);
  const [promptsData, setPromptsData] = useState<PromptInterface[]>([]);
  const [selectedProviderName, setSelectedProviderName] = useState("ChatGPT (OpenAI)");
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");


  const handleProviderChange = (providerName: string) => {
    setSelectedProviderName(providerName);
    const provider = apiProviders?.find(p => p.name === providerName);
    if (provider) {
      setModels(provider.models || []);
      const models = provider.models || [];
      const defaultModel = models.includes(provider.model)
        ? provider.model
        : models[0] || "";
      setSelectedModel(provider.models?.[0] || "");
      handleAiProviderAndModelChange(providerName, defaultModel);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    handleAiProviderAndModelChange(selectedProviderName, model);
  };

  const [filters, setFilters] = useState({
    tool: "",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    api: "",
    search: "",
  })

  const [currentPrompt, setCurrentPrompt] = useState<PromptInterface | null>(null);

  const handleInputChange = (index, field, value) => {
    setApiProviders(prevState => {
      const temp = [...prevState]
      temp[index][field] = value
      return temp
    });
  };

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
  };

  const getAllUsersSubmissionsData = async () => {
    try {
      const res = await axios.get("/submission");
      setSubmissions(res?.data?.data)
    } catch (error) {
      console.log(error)
    }

  }


  const getApiProviders = async () => {
    try {
      let res = await axios.get("/aiSettings");
      setApiProviders(res?.data?.data)
      const defaultProvider = res?.data?.data?.find(p => {
        return p.name === selectedProviderName
      });
      if (defaultProvider) {
        setModels(defaultProvider.models || []);
        setSelectedModel(defaultProvider.models?.[0] || "");
      }
    } catch (error) {
      console.log(error)
    }

  }

  const updateApiProviders = async () => {
    try {
      await axios.patch("/aiSettings", apiProviders)
      toast.success("Ai Provider Settings Updated");
      setActiveTab('ai-settings');
      getApiProviders();
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong")
    }

  }

  const getPrompts = () => {
    axios.get("/prompt").then((res) => {
      setPromptsData(res?.data?.data)
    })
  }

  const handleSaveOrCreatePrompt = async () => {
    try {
      if (currentPrompt?._id) {
        await axios.patch("/prompt/" + currentPrompt?._id, currentPrompt)
        toast.success("Template Update Successfully!")

      } else {
        await axios.post("/prompt", currentPrompt)
        toast.success("Template Saved Successfully!")
      }
      setActiveTab('manage-prompts');
      getPrompts();
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong")
    }

  }

  useEffect(() => {
    // Check if admin is authenticated
    if (adminAuth.user) {
      setIsAdmin(true)
    }
    // If not authenticated, redirect to admin login
    if (!adminAuth.user) {
      nav("/admin/login")
    }
    getAllUsersSubmissionsData();
    getApiProviders()
    getPrompts()
  }, [adminAuth.user])

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>You need administrator privileges to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full bg-primary-red hover:bg-red-700" onClick={() => nav("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredSubmissions = submissions?.filter((submission) => {
    // Filter by tool
    if (filters.tool && filters.tool !== "all" && submission.tool !== filters.tool) {
      return false
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

  const filteredTemplates = promptsData?.filter((submission) => {
    // Filter by tool
    if (filters.tool && filters.tool !== "all" && (submission?.heading || "") !== filters.tool) {
      return false
    }

    // Filter by API
    if (filters.api && filters.api !== "all" && (submission?.defaultAiProvider?.name || "") !== filters.api) {
      return false
    }

    // Filter by date range
    if (filters.dateFrom) {
      const submissionDate = new Date(submission.createdAt)
      if (submissionDate < filters.dateFrom) {
        return false
      }
    }

    if (filters.dateTo) {
      const submissionDate = new Date(submission.createdAt)
      const endOfDay = new Date(filters.dateTo)
      endOfDay.setHours(23, 59, 59, 999)
      if (submissionDate > endOfDay) {
        return false
      }
    }
    console.log(filters?.search)
    // Filter by search term
    if (filters?.search) {
      const searchTerm = (filters?.search || "")?.toLowerCase()
      return (
        (submission?.heading || "").toLowerCase().includes(searchTerm) ||
        (submission?.category || "").toLowerCase().includes(searchTerm) ||
        (submission?.objective || "").toLowerCase().includes(searchTerm)
      )
    }

    return true
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      tool: "",
      dateFrom: undefined,
      dateTo: undefined,
      api: "",
      search: "",
    })
  }


  const handleEditPrompt = (promptId: string) => {
    const prompt = promptsData.find((p) => p._id === promptId)
    if (prompt) {
      setCurrentPrompt(prompt)
      setSelectedProviderName(prompt.defaultAiProvider.name)
      setSelectedModel(prompt.defaultAiProvider.model)
      setModels(apiProviders.find(p => p.name === prompt.defaultAiProvider.name)?.models || [])
      setActiveTab("edit-prompt")
    }
  }

  const handleAiProviderAndModelChange = (name: string, model: string) => {
    setCurrentPrompt((prev) => {
      const temp = { ...prev }
      temp.defaultAiProvider.name = name
      temp.defaultAiProvider.model = model
      return temp
    })
  }

  const handleChangePrompt = (key: string, value: any) => {
    setCurrentPrompt((prev) => {
      const temp = { ...prev }
      temp[key] = value
      return temp
    })
  }

  const handleUpdateQuestions = (questions: string[]) => {
    setCurrentPrompt((prev) => {
      const temp = { ...prev }
      temp.questions = questions
      return temp
    })
  }


  const handleChangePromptQuestion = (index: number, value: string) => {
    setCurrentPrompt((prev) => {
      const temp = { ...prev, questions: [...prev.questions] }
      temp.questions[index] = value
      return temp
    })
  }


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
      filename: `${submission.tool || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
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

      // @ts-ignore
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

  console.log("promptsData", promptsData)

  return (
    <div className="min-h-screen bg-gray-50" >
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-primary-red hover:text-white"
              onClick={() => {
                localStorage.removeItem("adminToken")
                setAdminAuth({
                  user: null,
                  token: null,
                  isLoading: false
                })
                nav("/admin/login")
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-10">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-500">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard"
              className="flex items-center text-[#e50914] data-[state=active]:text-black"
            >
              <Users className="mr-2 h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="ai-settings"
              className="flex items-center text-[#e50914] data-[state=active]:text-black"
            >
              <Settings className="mr-2 h-4 w-4" />
              AI Platform Settings
            </TabsTrigger>
            <TabsTrigger value="manage-prompts" className="flex items-center text-[#e50914] data-[state=active]:text-black">
              <FileText className="mr-2 h-4 w-4" />
              Manage Templates
            </TabsTrigger>

          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-primary-red mb-1">Submissions</CardTitle>
                    <CardDescription>View and manage all user submissions</CardDescription>
                  </div>

                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-[12px] h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Template Name, category, objective..."
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tool-filter">Tool</Label>
                    <Select value={filters.tool} onValueChange={(value) => handleFilterChange("tool", value)}>
                      <SelectTrigger id="tool-filter">
                        <SelectValue placeholder="All tools" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tools</SelectItem>
                        {[...new Set(submissions.map(item => item.tool))]?.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="api-filter">API Used</Label>
                    <Select value={filters.api} onValueChange={(value) => handleFilterChange("api", value)}>
                      <SelectTrigger id="api-filter">
                        <SelectValue placeholder="All APIs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All APIs</SelectItem>
                        {[...new Set(submissions.map(item => item.apiUsed))]?.map((api) => (
                          <SelectItem key={api._id} value={api}>
                            {api}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                </div>


                {/* Submissions table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-primary-red" >
                      <TableRow className=" hover:bg-primary-red rounded-[10px]">
                        <TableHead className="text-white font-[700]">Name</TableHead>
                        <TableHead className="text-white font-[700]">Email</TableHead>
                        <TableHead className="text-white font-[700]">Company</TableHead>
                        <TableHead className="text-white font-[700]">Tool</TableHead>
                        <TableHead className="text-white font-[700]">Date</TableHead>
                        <TableHead className="text-white font-[700]">API Used</TableHead>
                        <TableHead className="text-white font-[700]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id} className="h-8 px-2" >
                            <TableCell className="font-medium py-2">{submission.name}</TableCell>
                            <TableCell className="py-2">{submission.email}</TableCell>
                            <TableCell className="py-2">{submission.company}</TableCell>
                            <TableCell className="py-2">{submission.tool}</TableCell>
                            <TableCell className="py-2">{formatDateTime(submission.date)}</TableCell>
                            <TableCell className="py-2">{submission.apiUsed}</TableCell>
                            <TableCell className="py-2">
                              <div className="flex space-x-2">

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button className=" text-black hover:text-red-500 hover:border-red-500" variant="outline" size="sm" title="View">
                                      <Eye className="h-4 w-4" />
                                    </Button>

                                  </DialogTrigger>
                                  <DialogContent className="max-w-[70vw] max-h-[90vh] overflow-auto">

                                    <div className="w-full  mx-auto mt-4" >
                                      <Card className="mb-6 border-2">
                                        <CardHeader className="bg-primary-red text-white rounded-t-lg">
                                          <CardTitle className="text-2xl">{submission?.tool}</CardTitle>
                                          <CardDescription className="text-gray-100">
                                            Generated on {formatDateTime(submission.createdAt)}
                                          </CardDescription>
                                        </CardHeader>

                                        <CardContent id="report-content" className="pt-6">
                                          {submission?.generatedContent?.sections?.map((section: any, index: number) => (
                                            <div key={index} className="mb-6">
                                              <h3 className="text-xl font-semibold mb-2">{formatBoldText(section.title)}</h3>
                                              <p className="whitespace-pre-line">{formatBoldText(section.content)}</p>
                                            </div>
                                          ))}
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
                                          <Button
                                            variant="outline"
                                            className="flex items-center"
                                            onClick={() => handleDownloadDOCX(submission)}
                                          >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Export DOCX
                                          </Button>
                                        </CardFooter>
                                      </Card>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-red-500" title="Remove">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this Submission? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          axios.delete(`/submission/${submission._id}`)
                                            .then(() => {
                                              toast.success("Submission deleted successfully");
                                              getAllUsersSubmissionsData();

                                            })
                                            .catch(error => {
                                              console.error(error);
                                              toast.error("Failed to delete template");
                                            });
                                        }}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No submissions found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                </div>
                <div className="text-sm text-muted-foreground mt-2 font-[600]">
                  Showing {filteredSubmissions.length} of {submissions.length} submissions
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="ai-settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-primary-red">AI Platform Settings</CardTitle>
                <CardDescription>Configure API keys and models for each AI platform</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit}>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
                    {apiProviders?.map((provider, index) => {
                      const isExpanded = JSON.parse(localStorage.getItem("expandedProviders") || "{}")[provider.name] == true || false;

                      return (
                        <div key={provider.name} className={`border rounded-md overflow-hidden ${isExpanded ? "md:col-span-2 xl:col-span-2" : ""}`}>
                          <div
                            className="bg-gray-100 dark:bg-gray-800 p-4 flex justify-between items-center cursor-pointer"
                            onClick={() => {
                              const currentExpanded = JSON.parse(localStorage.getItem("expandedProviders") || "{}")
                              const newExpanded = {
                                ...currentExpanded,
                                [provider.name]:
                                  currentExpanded[provider.name] === undefined ? true : !currentExpanded[provider.name],
                              }
                              localStorage.setItem("expandedProviders", JSON.stringify(newExpanded))
                              // Force re-render
                              setFilters({ ...filters })
                            }}
                          >
                            <h3 className="text-lg font-medium">{provider.name}</h3>
                            <Button variant="ghost" size="sm" type="button">
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${isExpanded ? "" : "rotate-180"}`}
                              />
                            </Button>
                          </div>

                          {isExpanded && (
                            <div className="p-4 space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`${provider.name}-key`}>API Key</Label>
                                <Input
                                  id={`${provider.name}-key`}
                                  type="password"
                                  placeholder={
                                    provider.name === "openai"
                                      ? "sk-..."
                                      : provider.name === "anthropic"
                                        ? "sk-ant-..."
                                        : provider.name === "google"
                                          ? "AIza..."
                                          : provider.name === "xai"
                                            ? "grok-..."
                                            : provider.name === "deepseek"
                                              ? "dsk-..."
                                              : provider.name === "ollama"
                                                ? "http://localhost:11434"
                                                : provider.name === "perplexity"
                                                  ? "pplx-..."
                                                  : "mis-..."
                                  }
                                  value={provider.apiKey || ''}
                                  onChange={(e) => handleInputChange(index, 'apiKey', e.target.value)}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`${provider.name}-model`}>Model</Label>
                                <Select
                                  value={provider.model}
                                  onValueChange={(value) => handleInputChange(index, 'model', value)}
                                >
                                  <SelectTrigger id={`${provider.name}-model`}>
                                    <SelectValue placeholder="Select Model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[...new Set(provider.models)].map((model) => (
                                      <SelectItem key={model} value={model}>
                                        {model}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label htmlFor={`${provider.name}-temperature`}>Temperature</Label>
                                  <span className="text-sm text-muted-foreground" id={`${provider.name}-temp-value`}>
                                    {provider.temperature ?? 0.7}
                                  </span>
                                </div>
                                <Input
                                  id={`${provider.name}-temperature`}
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={provider.temperature ?? 0.7}
                                  onChange={(e) => handleInputChange(index, 'temperature', parseFloat(e.target.value))}
                                  className="w-full"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`${provider.name}-max-tokens`}>Max Tokens</Label>
                                <Input
                                  id={`${provider.name}-max-tokens`}
                                  type="number"
                                  min="100"
                                  max="8000"
                                  step="100"
                                  value={provider?.maxTokens || 1000}
                                  onChange={(e) => handleInputChange(index, 'maxTokens', parseInt(e.target.value))}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Button onClick={updateApiProviders} className="mt-4 bg-primary-red hover:bg-red-700" type="submit">
                    Save AI Platform Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="manage-prompts">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-primary-red mb-1">Manage Templates</CardTitle>
                    <CardDescription>View and manage all prompt templates</CardDescription>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                    <Button
                      className="bg-primary-red hover:bg-red-700"
                      onClick={() => {
                        setCurrentPrompt({
                          heading: "",
                          objective: "",
                          initialGreetingsMessage: "",
                          questions: [""],
                          knowledgeBase: "",
                          promptTemplate: "",
                          defaultAiProvider: {
                            name: "",
                            model: ""
                          }
                        } as PromptInterface)
                        setActiveTab("create-prompt")
                      }}
                    >
                      Create New Template
                    </Button>
                  </div>

                </CardHeader>
                <CardContent>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div>
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
                    </div>

                    <div>
                      <Label htmlFor="tool-filter">Tool</Label>
                      <Select value={filters.tool} onValueChange={(value) => handleFilterChange("tool", value)}>
                        <SelectTrigger id="tool-filter">
                          <SelectValue placeholder="All tools" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All tools</SelectItem>
                          {[...new Set(promptsData.map(item => item.heading))]?.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="api-filter">API Used</Label>
                      <Select value={filters.api} onValueChange={(value) => handleFilterChange("api", value)}>
                        <SelectTrigger id="api-filter">
                          <SelectValue placeholder="All APIs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All APIs</SelectItem>
                          {[...new Set(promptsData.map(item => item.defaultAiProvider?.name))]?.map((api) => (
                            <SelectItem key={api} value={api}>
                              {api}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Template Name</TableHead>
                          <TableHead>Objective</TableHead>
                          <TableHead>Default AI</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead >Created</TableHead>
                          <TableHead>Last Modified</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTemplates?.map((prompt) => (
                          <TableRow key={prompt._id}>
                            <TableCell className="font-medium">{prompt.heading}</TableCell>
                            <TableCell>{prompt.objective}</TableCell>
                            <TableCell>
                              {prompt.defaultAiProvider.name} ({prompt.defaultAiProvider.model})
                            </TableCell>
                            <TableCell style={{ whiteSpace: "nowrap" }}>{formatDateTime(prompt.createdAt)}</TableCell>

                            <TableCell style={{ whiteSpace: "nowrap" }}>{prompt?.category || "--"}</TableCell>
                            <TableCell style={{ whiteSpace: "nowrap" }}>{formatDateTime(prompt.updatedAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">

                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Edit"
                                  onClick={() => handleEditPrompt(prompt._id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-red-500" title="Remove">
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this template? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => {
                                          axios.delete(`/prompt/${prompt._id}`)
                                            .then(() => {
                                              toast.success("Template deleted successfully");
                                              getPrompts();

                                            })
                                            .catch(error => {
                                              console.error(error);
                                              toast.error("Failed to delete template");
                                            });
                                        }}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create-prompt">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary-red">{activeTab === "create-prompt" ? "Create Template" : "Edit Template"}</CardTitle>
                  <Button style={{ minWidth: "100px" }} variant="ghost" className="mr-4"
                    onClick={() => setActiveTab('manage-prompts')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>

                <CardDescription>
                  {currentPrompt ? "Modify an existing prompt template" : "Design a new prompt template for your tools"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt-heading">Template Heading</Label>
                      <Input
                        id="prompt-heading"
                        placeholder="Enter a title for this prompt"
                        defaultValue={currentPrompt?.heading || ""}
                        onChange={(e) => handleChangePrompt("heading", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Category">Category</Label>
                      <Select value={currentPrompt?.category || ""} onValueChange={(val) => handleChangePrompt("category", val)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            templateCategories.map(item => {
                              return <SelectItem value={item}>{item}</SelectItem>
                            })
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Visibility">Visibility</Label>
                      <Select value={String(Number(currentPrompt?.visibility)) || ""} onValueChange={(val) => handleChangePrompt("visibility", !!+val)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={"1"}>Show</SelectItem>
                          <SelectItem value={"0"}>Hide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-objective">Objective</Label>
                    <Textarea
                      id="prompt-objective"
                      placeholder="What is the purpose of this prompt?"
                      defaultValue={currentPrompt?.objective || ""}
                      onChange={(e) => handleChangePrompt("objective", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initial-greeting">Initial Greeting Message</Label>
                    <Textarea
                      id="initial-greeting"
                      placeholder="Enter the initial greeting message"
                      defaultValue={currentPrompt?.initialGreetingsMessage || ""}
                      onChange={(e) => handleChangePrompt("initialGreetingsMessage", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Questions to Collect Information</Label>
                    <div className="border rounded-md p-4 space-y-4">
                      {/* Questions will be dynamically added here */}
                      <div id="questions-container">
                        {
                          (currentPrompt?.questions || []).map((question, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <Input placeholder={`Question ${index + 1}`} defaultValue={question} onChange={(e) => handleChangePromptQuestion(index, e.target.value)} />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleUpdateQuestions(currentPrompt.questions.filter((_, i) => i !== index))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        }
                      </div>
                      <Button
                        disabled={currentPrompt?.questions?.length == 15}
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          handleUpdateQuestions([...currentPrompt.questions, ""])
                        }}
                      >
                        Add Question
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="knowledge-base">Knowledge Base</Label>
                    <Textarea
                      id="knowledge-base"
                      placeholder="Enter relevant information, context or data for the AI"
                      className="min-h-[100px]"
                      defaultValue={currentPrompt?.knowledgeBase || ""}
                      onChange={(e) => handleChangePrompt("knowledgeBase", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-template">Prompt Template</Label>
                    <Textarea
                      id="prompt-template"
                      placeholder="Design the prompt that will be sent to the AI"
                      className="min-h-[100px]"
                      defaultValue={currentPrompt?.promptTemplate || ""}
                      onChange={(e) => handleChangePrompt("promptTemplate", e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Use placeholders: {"{objective}"}, {"{user_info}"}, {"{knowledge_base}"}, {"{query}"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Default AI Provider & Model</Label>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Provider Dropdown */}
                      <Select onValueChange={handleProviderChange} value={selectedProviderName}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiProviders?.map((provider) => {
                            if (provider.models.length === 0 || !provider.apiKey) return ""
                            return <SelectItem key={provider._id} value={provider.name}>
                              {provider.name}
                            </SelectItem>
                          })}
                        </SelectContent>
                      </Select>

                      {/* Model Dropdown */}
                      <Select onValueChange={handleModelChange} value={selectedModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                          {models?.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="destructive">Delete</Button>

                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setActiveTab("manage-prompts")}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveOrCreatePrompt} className="bg-primary-red hover:bg-red-700">
                        {!currentPrompt ? "Update Template" : "Save Template"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit-prompt">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary-red">{"Edit Template"}</CardTitle>
                  <Button style={{ minWidth: "100px" }} variant="ghost" className="mr-4"
                    onClick={() => setActiveTab('manage-prompts')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </div>

                <CardDescription>
                  Modify an existing prompt template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt-heading">Template Heading</Label>
                      <Input
                        id="prompt-heading"
                        placeholder="Enter a title for this prompt"
                        defaultValue={currentPrompt?.heading || ""}
                        onChange={(e) => handleChangePrompt("heading", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Category">Category</Label>
                      <Select value={currentPrompt?.category || ""} onValueChange={(val) => handleChangePrompt("category", val)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            templateCategories.map(item => {
                              return <SelectItem value={item}>{item}</SelectItem>
                            })
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="Visibility">Visibility</Label>
                      <Select value={String(Number(currentPrompt?.visibility)) || ""} onValueChange={(val) => handleChangePrompt("visibility", !!+val)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={"1"}>Show</SelectItem>
                          <SelectItem value={"0"}>Hide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-objective">Objective</Label>
                    <Textarea
                      id="prompt-objective"
                      placeholder="What is the purpose of this prompt?"
                      defaultValue={currentPrompt?.objective || ""}
                      onChange={(e) => handleChangePrompt("objective", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initial-greeting">Initial Greeting Message</Label>
                    <Textarea
                      id="initial-greeting"
                      placeholder="Enter the initial greeting message"
                      defaultValue={currentPrompt?.initialGreetingsMessage || ""}
                      onChange={(e) => handleChangePrompt("initialGreetingsMessage", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Questions to Collect Information</Label>
                    <div className="border rounded-md p-4 space-y-4">
                      {/* Questions will be dynamically added here */}
                      <div id="questions-container">
                        {
                          (currentPrompt?.questions || []).map((question, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <Input placeholder={`Question ${index + 1}`} defaultValue={question} onChange={(e) => handleChangePromptQuestion(index, e.target.value)} />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  handleUpdateQuestions(currentPrompt.questions.filter((_, i) => i !== index))
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        }
                      </div>
                      <Button
                        disabled={currentPrompt?.questions.length == 15}
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          handleUpdateQuestions([...(currentPrompt?.questions || []), ""])
                        }}
                      >
                        Add Question
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="knowledge-base">Knowledge Base</Label>
                    <Textarea
                      id="knowledge-base"
                      placeholder="Enter relevant information, context or data for the AI"
                      className="min-h-[100px]"
                      defaultValue={currentPrompt?.knowledgeBase || ""}
                      onChange={(e) => handleChangePrompt("knowledgeBase", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-template">Prompt Template</Label>
                    <Textarea
                      id="prompt-template"
                      placeholder="Design the prompt that will be sent to the AI"
                      className="min-h-[100px]"
                      defaultValue={currentPrompt?.promptTemplate || ""}
                      onChange={(e) => handleChangePrompt("promptTemplate", e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Use placeholders: {"{objective}"}, {"{user_info}"}, {"{knowledge_base}"}, {"{query}"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Default AI Provider & Model</Label>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Provider Dropdown */}
                      <Select onValueChange={handleProviderChange}
                        value={selectedProviderName}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiProviders?.map((provider) => {
                            if (provider.models.length === 0 || !provider.apiKey) return ""
                            return <SelectItem key={provider._id} value={provider.name}>
                              {provider.name}
                            </SelectItem>
                          })}
                        </SelectContent>
                      </Select>

                      {/* Model Dropdown */}
                      <Select onValueChange={handleModelChange}
                        value={selectedModel}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((model) => {
                            return <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </div>


                  </div>

                  <div className="flex justify-between pt-4">

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Template</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this template? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              axios.delete(`/prompt/${currentPrompt._id}`)
                                .then(() => {
                                  toast.success("Template deleted successfully");
                                  getPrompts();
                                  setActiveTab("manage-prompts")
                                })
                                .catch(error => {
                                  console.error(error);
                                  toast.error("Failed to delete template");
                                });
                            }}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <div className="space-x-2">
                      <Button variant="outline" onClick={() => setActiveTab("manage-prompts")}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveOrCreatePrompt} className="bg-primary-red hover:bg-red-700">
                        Update Prompt
                      </Button>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div >
  )
}




export function formatDateTime(dateString) {
  const date = new Date(dateString);

  const options = {
    day: '2-digit',
    month: 'short', // Apr
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  // @ts-ignore
  return date.toLocaleString('en-US', options).replace(',', '');
}
