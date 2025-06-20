import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
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
  Loader2,
  Mail,
  CheckCircle,
  Info,
  EyeOff,
  Play,
  Copy,
  RefreshCcw,
  HelpCircle,
  Grip,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import html2pdf from 'html2pdf.js'
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import AdminHeader from "@/components/Custom/AdminHeader"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DynamicPagination from "@/components/dynamicPagination"
import MultiSelect from "@/components/MultipleSelect/MultipleSelect"

// import { Document, Packer, Paragraph, HeadingLevel } from "docx"
// import { saveAs } from "file-saver"
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';


export const templateCategories = [
  // "Compliances",
  "Finance",
  "HR",
  "Marketing",
  "Operations",
  "Sales",
  "Strategy",
];

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
  group: string[];
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
  const axios = useAxios("admin");

  const { adminAuth, userAuth, apiLink, setGenerateResponse, setSubmissionID } = useData();
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [submissions, setSubmissions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  const [apiProviders, setApiProviders] = useState<AiSettingsInterface[]>([]);
  const prevApiProviderString = useRef("");
  const [promptsData, setPromptsData] = useState<PromptInterface[]>([]);
  const [selectedProviderName, setSelectedProviderName] = useState("ChatGPT (OpenAI)");
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSuccessOpen, setEmailSuccessOpen] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(null);

  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState(null);
  const [apis, setApis] = useState(null);

  const [filters, setFilters] = useState({
    tool: "",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    api: "",
    search: "",
    group: "",
  })

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // const fileToBase64 = (file) => {

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



  const [currentPrompt, setCurrentPrompt] = useState<PromptInterface | null>(null);
  const [groups, setGroups] = useState([]);
  const prevcurrentPrompt = useRef("");

  const handleInputChange = (index, field, value) => {
    setApiProviders(prevState => {
      const temp = [...prevState]
      temp[index][field] = value
      return temp
    });
  };

  // Handle form submission
  const handleFormSubmit = (e) => e.preventDefault();

  const getAllUsersSubmissionsData = async () => {
    try {
      const params = {
        page: String(currentPage),
        limit: "10",
        tool: filters.tool || "",
        category: filters.group || "",
        dateFrom: filters?.dateFrom ? new Date(filters?.dateFrom)?.toISOString() : "",
        dateTo: filters?.dateTo ? new Date(filters?.dateTo)?.toISOString() : "",
        api: filters.api || "",
        search: filters.search || "",
      };
      const queryString = new URLSearchParams(params).toString();
      const res = await axios.get(`/submission?${queryString}`);
      setTotalPages(res.data.totalPages || 0);
      setSubmissions(res?.data?.data)
    } catch (error) {
      console.log(error)
    }

  }

  const getFieldValues = async () => {
    try {
      setIsLoading(true);
      const { data: res } = await axios.get(`/submission/fieldValues`);
      setTools(res?.data?.tool || []);
      setCategories(res?.data?.category || []);
      setApis(res?.data?.apiUsed || []);
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false);
    }

  }

  const getApiProviders = async () => {
    try {
      let res = await axios.get("/aiSettings");
      setApiProviders(res?.data?.data)
      prevApiProviderString.current = JSON.stringify(res?.data?.data)
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
    if (adminAuth.user) {
      setIsAdmin(true)
    }
    if (!adminAuth.user) {
      nav("/admin/login")
    }
    getApiProviders()
    getPrompts()
  }, [adminAuth.user])

  useEffect(() => {
    getAllUsersSubmissionsData();
  }, [filters, currentPage])

  useEffect(() => {
    getFieldValues();
  }, [])

  const handleSendEmail = async (submission) => {
    setIsEmailSending(true);
    try {
      const reportElement = document.getElementById('report-content');

      if (!reportElement) {
        toast.error("Content not found. Please try again.");
        setIsEmailSending(false);
        return;
      }

      const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
              font-family: 'Segoe UI', sans-serif;
              color: #333;
            }
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 10px;
              padding: 32px;
            }
            h1 {
              color: #d32f2f;
              font-size: 24px;
              margin-bottom: 16px;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
            }
            .btn-container {
              margin-top: 32px;
              text-align: center;
            }
            .view-button {
              background-color: #d32f2f;
              color: #ffffff;
              text-decoration: none;
              padding: 14px 26px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
              display: inline-block;
            }
            .view-button:hover {
              background-color: #b71c1c;
            }
        
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1>Your Report is Ready</h1>
            <p>Hi ${submission?.name},</p>
            <p>We've prepared your ${submission?.tool || 'requested'} report. You can view it by clicking the button below.</p>
            <div class="btn-container">
              <a href="https://ai.ceoitbox.com/view/${submission?._id}" target="_blank" class="view-button" style="color: #ffffff">
                View Your Report
              </a>
            </div>
          </div>
        
        </body>
      </html>
    `;


      await axios.post("/users/email", {
        to: submission?.email,
        subject: submission?.tool || "Report",
        body: fullHTML,
        // attachment: base64PDF
      });

      // Success
      setSentToEmail(submission?.email);
      setEmailSuccessOpen(true);
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsEmailSending(false);
    }
  };


  const filteredTemplates = promptsData?.filter((submission) => {
    // Filter by tool
    if (filters.tool && filters.tool !== "all" && (submission?.heading || "") !== filters.tool) {
      return false
    }

    // Filter by group
    if (filters.group && filters.group !== "all" && (submission?.category || "") !== filters.group) {
      return false;
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
      group: "",
    })
  }

  const handleEditPrompt = (promptId: string) => {
    const prompt = promptsData.find((p) => p._id === promptId)
    prevcurrentPrompt.current = JSON.stringify(prompt)
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

  const handleDownloadPDF = (submission) => {
    const reportElement = document.getElementById('report-content')
    console.log("reportElement", reportElement)


    if (!reportElement) {
      toast.error("Could not generate PDF. Please try again.")
      return
    }

    // Optimize SVG elements for PDF
    const svgElements = reportElement.querySelectorAll('svg');
    svgElements.forEach(svg => {
      svg.style.setProperty('height', '100%', 'important');
      svg.style.setProperty('width', '100%', 'important');
    });

    // Add CSS classes to prevent breaking
    const addPageBreakStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        .pdf-no-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pdf-page-break-before {
          page-break-before: always !important;
          break-before: page !important;
        }
        .pdf-page-break-after {
          page-break-after: always !important;
          break-after: page !important;
        }
      `;
      document.head.appendChild(style);
      return style;
    };

    const styleElement = addPageBreakStyles();


    const options = {
      margin: [5, 5, 5, 5],
      filename: `${submission.tool || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: {
        type: 'jpeg',
        quality: 0.95
      },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        letterRendering: true,
        logging: false,
        height: null,
        width: null,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.pdf-page-break-before',
        after: '.pdf-page-break-after',
        avoid: '.pdf-no-break'
      }
    }

    // Generate and download PDF
    html2pdf()
      .set(options)
      .from(reportElement)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        return pdf;
      })
      .save()
      .then(() => {
        toast.success("PDF Downloaded Successfully")
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      })
      .catch(error => {
        console.error("PDF generation error:", error)
        toast.error("Failed to download PDF. Please try again.")
        // Clean up added styles on error too
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      })
  }



  const handleDuplicatePrompt = async (promptId: string) => {
    try {
      await axios.post("/prompt/duplicate", { promptId })
      toast.success("Prompt Duplicated Successfully!")
      getPrompts()
    } catch (error) {
      console.log(error);
    }

  }

  const handleRegenerate = async (submission: {
    _id: string;
    name: string;
    email: string;
    company: string;
    category: string;
    tool: string;
    date: string;
    status: string;
    apiUsed: string;
    questionsAndAnswers: Record<string, string>;
    generatedContent: string;
    createdAt: Date;
    updatedAt: Date;
  }) => {
    const toolId = promptsData.find((p) => {
      return p.heading === submission.tool
    })?._id;
    setIsSubmitting(submission._id)
    const res = await fetch(`${apiLink}prompt/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${userAuth?.token}` // Add the token here
      },
      body: JSON.stringify({
        questions: submission.questionsAndAnswers,
        toolId: toolId
      }),
    });
    setGenerateResponse("")
    setIsSubmitting(null)
    nav(`/reports/${toolId}`)

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk.startsWith("{ID}-")) {
        setSubmissionID(chunk.split("{ID}-")[1].trim());
      }
      else {
        setGenerateResponse(p => p + chunk)
      }
    }
  }

  const handleToggleVisibility = async (promptId: string) => {
    await axios.post(`/prompt/toggle-visibility/${promptId}`)
    toast.success("Prompt Visibility Toggled Successfully!")
    getPrompts()
  }

  const handleCopyContent = async () => {
    const contentElement = document.getElementById("report-content");
    if (!contentElement) {
      toast.error("Content not found");
      return;
    }

    const fullHTML = `
      <div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6;">
        ${contentElement.innerHTML}
      </div>
    `;

    if (navigator.clipboard && window.ClipboardItem) {
      try {
        const blob = new Blob([fullHTML], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        await navigator.clipboard.write([clipboardItem]);
        toast.success("Report copied to clipboard!");
      } catch (err) {
        console.error("Copy failed:", err);
        toast.error("Failed to copy.");
      }
    } else {
      toast.error("Clipboard API not supported.");
    }
  };


  // @ts-ignore
  const isAiProvidersChanged = !(JSON.stringify(apiProviders) == prevApiProviderString.current)
  const isCurrentPromptChanged = !(JSON.stringify(currentPrompt) == prevcurrentPrompt.current)


  useEffect(() => {
    fetch("https://auth.ceoitbox.com/getGroupNames").then(res => res.json()).then(res => setGroups([...new Set(res)]))
  }, [])


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

  return (
    <div className="min-h-screen bg-gray-50" >
      {isMobile &&
        <AdminHeader />}

      <main className=" mx-auto py-8 px-10">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-500">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger
              value="dashboard"
              className="flex items-center justify-center py-2 text-black bg-white border border-gray-200 
               data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
            >
              <Users className="mr-2 h-4 w-4" />
              Submissions
            </TabsTrigger>

            <TabsTrigger
              value="ai-settings"
              className="flex items-center justify-center py-2 text-black bg-white border border-gray-200 
               data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
            >
              <Settings className="mr-2 h-4 w-4" />
              AI Platform Settings
            </TabsTrigger>

            <TabsTrigger
              value="manage-prompts"
              className="flex items-center justify-center py-2 text-black bg-white border border-gray-200 
               data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
            >
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-[12px] h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Template Name, category..."
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
                        {(tools || [])?.map((item) => (
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
                        {(categories || [])?.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group}
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
                        {(apis || []).filter(item => item)?.map((api) => (
                          <SelectItem key={api._id} value={api}>
                            {api}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="flex items-center gap-4"> */}
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
                  {/* </div> */}
                </div>


                {/* Submissions table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader className="bg-primary-red" >
                      <TableRow className="hover:bg-primary-red rounded-[10px]">
                        <TableHead className="text-white font-[700]">Name</TableHead>
                        <TableHead className="text-white font-[700]">Email</TableHead>
                        <TableHead className="text-white font-[700]">Company</TableHead>
                        <TableHead className="text-white font-[700]">Tool</TableHead>
                        <TableHead className="text-white font-[700]">Category</TableHead>
                        <TableHead className="text-white font-[700]">API Used</TableHead>
                        <TableHead className="text-white font-[700]">Tokens Used</TableHead>
                        <TableHead className="text-white font-[700]">Date</TableHead>
                        <TableHead className="text-white font-[700]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions?.length > 0 ? (
                        (submissions || []).map((submission) => (
                          <TableRow key={submission.id} className="h-8 px-2" >
                            <TableCell className="font-medium py-2">{submission.name} {submission.type && `(${submission.type})`}</TableCell>
                            <TableCell className="py-2">{submission.email}</TableCell>
                            <TableCell className="py-2">{submission.company || "--"}</TableCell>
                            <TableCell className="py-2">{submission.tool}</TableCell>
                            <TableCell className="py-2">{submission?.category || "--"}</TableCell>
                            <TableCell className="py-2">{submission.apiUsed}</TableCell>
                            <TableCell className="py-2">{submission.tokensUsed}</TableCell>
                            <TableCell className="py-2">{formatDateTime(submission.date)}</TableCell>
                            <TableCell className="py-2">
                              <div className="flex space-x-2" >
                                <Button variant="outline" size="sm" title="Regenerate" onClick={() => handleRegenerate(submission)}>
                                  <RefreshCcw className={`h-4 w-4 ${isSubmitting == submission._id ? "animate-spin" : ""}`} />
                                </Button>


                                <Dialog >
                                  <DialogTrigger asChild>
                                    <Button className="text-black hover:text-red-500 hover:border-red-500" variant="outline" size="sm" title="View">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>

                                  <DialogContent
                                    style={{ maxWidth: "90vw", maxHeight: "90vh" }}
                                  // className="w-full max-w-[85%] max-h-[90vh] overflow-auto"

                                  >
                                    <Tabs defaultValue="result" className="w-full" style={{ overflow: "hidden" }}>
                                      <TabsList className="mb-4 mt-3 w-full" >
                                        <TabsTrigger
                                          value="question"
                                          className="flex items-center justify-center gap-2 text-black bg-white border border-gray-200 data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
                                          style={{ width: "50%" }}
                                        >
                                          <HelpCircle className="w-4 h-4" /> Q & A
                                        </TabsTrigger>

                                        <TabsTrigger
                                          value="result"
                                          className="flex items-center justify-center gap-2 text-black bg-white border border-gray-200 data-[state=active]:bg-[#e50914] data-[state=active]:text-white"
                                          style={{ width: "50%" }}
                                        >
                                          <FileText className="w-4 h-4" /> Result
                                        </TabsTrigger>
                                      </TabsList>


                                      {/* Result Tab */}
                                      <TabsContent value="result" className="overflow-auto max-h-[70vh]">
                                        <Card
                                          className="mb-6 border-2 w-full max-w-[100%]  mx-auto mt-4 "
                                          style={{ width: "100%" }}
                                        >
                                          <CardHeader className="bg-primary-red text-white rounded-t-lg">
                                            <CardTitle className="text-2xl">{submission?.tool || "Report"}</CardTitle>
                                            <CardDescription className="text-gray-100">
                                              Generated on {formatDateTime(submission.createdAt)}
                                            </CardDescription>
                                          </CardHeader>

                                          <CardContent
                                            dangerouslySetInnerHTML={{ __html: submission?.generatedContent }}
                                            id="report-content"
                                            className="pt-6"
                                            style={{ padding: "0px" }}
                                          />

                                          <CardFooter className="flex flex-wrap gap-4 justify-center mt-6">
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
                                              onClick={handleCopyContent}
                                            >
                                              <Copy className="mr-2 h-4 w-4" />
                                              Copy
                                            </Button>

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
                                      </TabsContent>


                                      {/* Question Tab */}
                                      <TabsContent value="question" style={{ overflowY: "auto", maxHeight: "70vh" }}>
                                        <div className="space-y-6 px-4 py-6">
                                          {Object?.entries(submission?.questionsAndAnswers || {})?.map(([question, answer], index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded shadow">
                                              <p className="font-semibold text-gray-800 mb-2">Q {index + 1}. {question}</p>
                                              <p className="text-gray-600"><b>Ans.</b> {answer as string}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </TabsContent>
                                    </Tabs>
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
                          <TableCell colSpan={8} className="h-24 text-center">
                            No submissions found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                </div>
                <div className="text-sm text-muted-foreground mt-2 font-[600]">
                  Showing {submissions?.length} of {submissions?.length} submissions
                </div>
              </CardContent>
            </Card>
            <DynamicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
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

                                <Label htmlFor={`${provider.name}-key`} className="flex items-center gap-1">
                                  API Key
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </Label>

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
                                <Label htmlFor={`${provider.name}-model`} className="flex items-center gap-1">
                                  Model
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </Label>
                                <Select
                                  value={provider.model}
                                  onValueChange={(value) => handleInputChange(index, 'model', value)}
                                >
                                  <SelectTrigger id={`${provider.name}-model`}>
                                    <SelectValue placeholder="Select Model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[...new Set(provider.models)].filter(model => model).map((model) => (
                                      <SelectItem key={model} value={model}>
                                        {model}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label htmlFor={`${provider.name}-temperature`} className="flex items-center gap-1">
                                    Temperature
                                    <Info className="w-4 h-4 text-muted-foreground" />
                                  </Label>
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
                                <Label htmlFor={`${provider.name}-max-tokens`} className="flex items-center gap-1">
                                  Max Tokens
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </Label>
                                <Input
                                  id={`${provider.name}-max-tokens`}
                                  type="number"
                                  min="100"
                                  max="8000000000"
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
                  <Button disabled={!isAiProvidersChanged} onClick={updateApiProviders} className="mt-4 bg-primary-red hover:bg-red-700" type="submit">
                    Save AI Platform Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent id="manage-prompts" value="manage-prompts">
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
                          group: [],
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
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
                          {[...new Set(promptsData.map(item => item.heading))].filter(i => i)?.map((item) => (
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
                          {[...new Set(promptsData?.map(item => item.category))].filter(i => i)?.map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
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
                          {[...new Set(promptsData.map(item => item.defaultAiProvider?.name))].filter(i => i)?.map((api) => (
                            <SelectItem key={api} value={api}>
                              {api}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* <div className="flex items-center gap-4"> */}
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
                    {/* </div> */}
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader className="bg-primary-red">
                        <TableRow className=" hover:bg-primary-red rounded-[10px]">
                          <TableHead className="text-white font-[700]">Template Name</TableHead>
                          <TableHead className="text-white font-[700]">Objective</TableHead>
                          <TableHead className="text-white font-[700]">Default AI</TableHead>
                          <TableHead className="text-white font-[700]">Group</TableHead>
                          <TableHead className="text-white font-[700]">Created</TableHead>
                          <TableHead className="text-white font-[700]">Last Modified</TableHead>
                          <TableHead className="text-white font-[700]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTemplates?.map((prompt) => (
                          <TableRow key={prompt._id}>
                            <TableCell >
                              <div className="flex items-center gap-2 " >
                                <p> {prompt.heading}</p>
                                <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(prompt._id)}>
                                  {prompt.visibility ? (
                                    <Eye size={16} className="text-gray-500" />
                                  ) : (
                                    <EyeOff size={16} className="text-gray-500" />
                                  )}
                                </Button>
                              </div>

                            </TableCell>
                            <TableCell>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="max-w-[200px] truncate cursor-pointer">
                                    {prompt.objective || "--"}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-[300px]" side="top">
                                  {prompt.objective || "--"}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              {prompt.defaultAiProvider.name} ({prompt.defaultAiProvider.model})
                            </TableCell>
                            <TableCell style={{ whiteSpace: "nowrap" }}>{prompt?.category || "--"}</TableCell>
                            <TableCell style={{ whiteSpace: "nowrap" }}>{formatDateTime(prompt.createdAt)}</TableCell>
                            <TableCell style={{ whiteSpace: "nowrap" }}>{formatDateTime(prompt.updatedAt)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">


                                <AlertDialog>
                                  <AlertDialogTrigger asChild>

                                    <Button
                                      variant="outline"
                                      size="sm"
                                      title="Duplicate"

                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Duplicate Submission</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to Duplicate this Submission? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDuplicatePrompt(prompt._id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Copy
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Start"
                                  onClick={() => nav(`/tools/${prompt._id}`)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>

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
                  <Button style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
                    className="mr-4 bg-primary-red  hover:bg-red-700 transition-colors duration-200" variant="ghost"
                    onClick={() => {
                      setActiveTab('manage-prompts')
                      setTimeout(() => {
                        document.getElementById("manage-prompts")?.scrollIntoView({ behavior: 'auto' })
                      }, 100)
                    }}>
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
                  <div className="grid grid-cols-4 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="group">Group</Label>
                      <MultiSelect
                        options={groups.map(item => {
                          return { value: item, label: item }
                        })}
                        value={currentPrompt?.group || []}
                        onChange={(val) => handleChangePrompt("group", val)}
                        placeholder="Groups"
                        searchPlaceholder="Search Groups..."
                      />
                      {/* <Select value={currentPrompt?.group || ""} onValueChange={(val) => handleChangePrompt("group", val)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            groups.map((item) => {
                              return <SelectItem value={item}>{item}</SelectItem>
                            })
                          }
                        </SelectContent>
                      </Select> */}
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
                      Questions will be dynamically added here
                      {/* <div id="questions-container">
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
                      </div> */}

                      <QuestionList questions={currentPrompt?.questions || []} setQuestions={(val) => setCurrentPrompt(prev => ({ ...prev, questions: val }))} handleChangePromptQuestion={handleChangePromptQuestion} handleUpdateQuestions={handleUpdateQuestions} />

                    </div>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        handleUpdateQuestions([...currentPrompt.questions, ""])
                      }}
                    >
                      Add Question
                    </Button>
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
                      <Button variant="outline" onClick={() => {
                        setActiveTab("manage-prompts")
                        setTimeout(() => {
                          document.getElementById("manage-prompts")?.scrollIntoView({ behavior: 'auto' })
                        }, 100)
                      }}>
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
                  <Button style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
                    className="mr-4 bg-primary-red  hover:bg-red-700 transition-colors duration-200" variant="ghost"
                    onClick={() => {
                      setActiveTab('manage-prompts')
                      setTimeout(() => {
                        document.getElementById("manage-prompts")?.scrollIntoView({ behavior: 'auto' })
                      }, 100)
                    }}>
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
                  <div className="grid grid-cols-4 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="group">Group</Label>
                      <MultiSelect
                        options={groups.map(item => {
                          return { value: item, label: item }
                        })}
                        value={currentPrompt?.group || []}
                        onChange={(val) => handleChangePrompt("group", val)}
                        placeholder="Groups"
                        searchPlaceholder="Search Groups..."
                      />
                      {/* <Select value={currentPrompt?.group || ""} onValueChange={(val) => handleChangePrompt("group", val)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {
                            groups.map((item) => {
                              return <SelectItem value={item}>{item}</SelectItem>
                            })
                          }
                        </SelectContent>
                      </Select> */}
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
                      {/* <div id="questions-container">
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
                      </div> */}

                      <QuestionList questions={currentPrompt?.questions || []} setQuestions={(val) => setCurrentPrompt(prev => ({ ...prev, questions: val }))} handleChangePromptQuestion={handleChangePromptQuestion} handleUpdateQuestions={handleUpdateQuestions} />


                      <Button
                        // disabled={currentPrompt?.questions.length == 15}
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
                      <Button variant="outline" onClick={() => {
                        setActiveTab("manage-prompts")
                        setTimeout(() => {
                          document.getElementById("manage-prompts")?.scrollIntoView({ behavior: 'auto' })
                        }, 100)
                      }}>
                        Cancel
                      </Button>
                      <Button disabled={!isCurrentPromptChanged} onClick={handleSaveOrCreatePrompt} className="bg-primary-red hover:bg-red-700">
                        Update Prompt
                      </Button>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>



        </Tabs>

        {isLoading &&
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
          </div>
        }
      </main>

      {/* Success Email Dialog */}
      <Dialog open={emailSuccessOpen} onOpenChange={setEmailSuccessOpen}>
        <DialogContent className="sm:max-w-md border-2 border-primary-red">
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
    </div >
  )
}


function SortableQuestion({ id, index, value, onChange, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="border rounded p-2 bg-white flex items-center space-x-2"
    >
      <Button {...listeners} variant="ghost" size="icon" >
        <Grip className="h-4 w-4" />
      </Button>
      <Input
        placeholder={`Question ${index + 1}`}
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
      />
      <Button variant="ghost" size="icon" onClick={() => onRemove(index)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

function QuestionList({ questions, setQuestions, handleChangePromptQuestion, handleUpdateQuestions }) {

  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = questions.findIndex((_, i) => `question-${i}` === active.id)
      const newIndex = questions.findIndex((_, i) => `question-${i}` === over.id)
      const newQuestions = arrayMove(questions, oldIndex, newIndex)
      setQuestions(newQuestions)
      handleUpdateQuestions(newQuestions)
    }
  }

  const handleChange = (index, value) => {
    const updated = [...questions]
    updated[index] = value
    setQuestions(updated)
    handleChangePromptQuestion(index, value)
  }

  const handleRemove = (index) => {
    const updated = questions.filter((_, i) => i !== index)
    setQuestions(updated)
    handleUpdateQuestions(updated)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={questions.map((_, index) => `question-${index}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2" id="questions-container">
          {questions.map((q, index) => (
            <SortableQuestion
              key={`question-${index}`}
              id={`question-${index}`}
              index={index}
              value={q}
              onChange={handleChange}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
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
