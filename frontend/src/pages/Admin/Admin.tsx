
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Download,
  Eye,
  Search,
  Settings,
  Users,
  FileText,
  X,
  Edit,
  Trash,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// Sample submissions data
const submissionsData = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    company: "Acme Inc",
    tool: "Business Plan Generator",
    date: "2023-04-01T10:30:00Z",
    status: "Completed",
    apiUsed: "ChatGPT",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    company: "Tech Solutions",
    tool: "Weekly Schedule Creator",
    date: "2023-04-02T14:15:00Z",
    status: "Completed",
    apiUsed: "Claude",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    company: "Global Services",
    tool: "Lead Nurturing Creator",
    date: "2023-04-03T09:45:00Z",
    status: "Completed",
    apiUsed: "Gemini",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    company: "Creative Solutions",
    tool: "Purpose Master",
    date: "2023-04-04T16:20:00Z",
    status: "Completed",
    apiUsed: "Grok",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael@example.com",
    company: "Innovative Tech",
    tool: "Core Values Generator",
    date: "2023-04-05T11:10:00Z",
    status: "Completed",
    apiUsed: "Mistral",
  },
]

// Sample API providers
const apiProviders = [
  { id: "openai", name: "ChatGPT (OpenAI)" },
  { id: "anthropic", name: "Claude (Anthropic)" },
  { id: "google", name: "Gemini (Google)" },
  { id: "xai", name: "Grok (xAI)" },
  { id: "deepseek", name: "Deepseek" },
  { id: "ollama", name: "Ollama (Self-hosted)" },
  { id: "perplexity", name: "Perplexity" },
  { id: "mistral", name: "Mistral" },
]

// Sample tools
const tools = [
  { id: "business-plan", name: "Business Plan Generator" },
  { id: "weekly-schedule", name: "Weekly Schedule Creator" },
  { id: "lead-nurturing", name: "Lead Nurturing Creator" },
  { id: "purpose-master", name: "Purpose Master" },
  { id: "core-values", name: "Core Values Generator" },
]

// Sample prompts data
const promptsData = [
  {
    id: "1",
    name: "Business Plan Generator",
    objective: "Create comprehensive business plans",
    defaultAI: "ChatGPT",
    defaultModel: "GPT-4o",
    created: "2023-04-10",
    modified: "2024-03-15",
    greeting:
      "Welcome to the Business Plan Generator! I'll help you create a comprehensive business plan tailored to your needs.",
    questions: [
      "What's your business name?",
      "What industry are you in?",
      "Describe your target market",
      "Explain your business model",
      "Who are your main competitors?",
    ],
    knowledgeBase:
      "Business plans typically include executive summary, company description, market analysis, organization structure, product/service line, marketing strategy, financial projections, and funding requests.",
    promptTemplate:
      "Create a comprehensive business plan for {{business_name}} in the {{industry}} industry. Their target market is {{target_market}} and their business model is {{business_model}}. Their main competitors are {{competitors}}.",
  },
  {
    id: "2",
    name: "Weekly Schedule Creator",
    objective: "Generate optimized weekly schedules",
    defaultAI: "Claude",
    defaultModel: "Claude 3 Sonnet",
    created: "2023-05-22",
    modified: "2024-02-28",
    greeting: "Welcome to the Weekly Schedule Creator! I'll help you organize your week efficiently.",
    questions: [
      "What are your typical working hours?",
      "What are your top 3 priorities this week?",
      "How many hours do you want to allocate for meetings?",
      "How many hours do you need for deep work?",
      "When should this schedule start?",
    ],
    knowledgeBase:
      "Effective schedules balance deep work, meetings, breaks, and personal time. The Pomodoro technique suggests working in 25-minute focused sessions with 5-minute breaks.",
    promptTemplate:
      "Create a weekly schedule starting on {{start_date}} with working hours of {{work_hours}}. Allocate {{meetings}} hours for meetings and {{deep_work}} hours for deep work. The top priorities are {{priorities}}.",
  },
  {
    id: "3",
    name: "Lead Nurturing Creator",
    objective: "Create lead nurturing strategies",
    defaultAI: "Gemini",
    defaultModel: "Gemini Pro",
    created: "2023-06-15",
    modified: "2024-01-10",
    greeting:
      "Welcome to the Lead Nurturing Creator! I'll help you develop effective strategies to nurture and convert your leads.",
    questions: [
      "What type of business do you run?",
      "Where do most of your leads come from?",
      "How long is your typical sales cycle?",
      "What are the main pain points of your customers?",
      "Do you currently have a follow-up process?",
    ],
    knowledgeBase:
      "Lead nurturing involves developing relationships with buyers at every stage of the sales funnel. Effective strategies include personalized emails, content marketing, social media engagement, and targeted offers.",
    promptTemplate:
      "Create a lead nurturing strategy for a {{business_type}} business where leads primarily come from {{lead_source}}. The sales cycle is {{sales_cycle}} and customer pain points include {{pain_points}}. They {{follow_up}} currently have a follow-up process.",
  },
]

export default function AdminDashboard() {
  const nav = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [submissions, setSubmissions] = useState(submissionsData)
  const [filters, setFilters] = useState({
    tool: "",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    api: "",
    search: "",
  })
  const [currentPrompt, setCurrentPrompt] = useState<any>(null)

  // Simulate admin check
  useEffect(() => {
    // Check if admin is authenticated
    const adminAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    setIsAdmin(adminAuthenticated)

    // If not authenticated, redirect to admin login
    if (!adminAuthenticated) {
      nav("/admin/login")
    }
  }, [nav])

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

  const filteredSubmissions = submissions.filter((submission) => {
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

  const handleViewReport = (id: string) => {
    // In a real app, this would navigate to the specific report
    console.log(`Viewing report ${id}`)
  }

  const handleDownloadReport = (id: string) => {
    // In a real app, this would download the report
    console.log(`Downloading report ${id}`)
  }

  const handleEditPrompt = (promptId: string) => {
    const prompt = promptsData.find((p) => p.id === promptId)
    if (prompt) {
      setCurrentPrompt(prompt)
      setActiveTab("create-prompt")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-primary-red hover:text-white"
              onClick={() => {
                localStorage.removeItem("adminAuthenticated")
                nav("/admin/login")
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="ai-settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              AI Platform Settings
            </TabsTrigger>
            <TabsTrigger value="manage-prompts" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Manage Prompts
            </TabsTrigger>
            <TabsTrigger value="admin-settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Admin Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Submissions</CardTitle>
                <CardDescription>View and manage all user submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                        {tools.map((tool) => (
                          <SelectItem key={tool.id} value={tool.name}>
                            {tool.name}
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
                        {apiProviders.map((api) => (
                          <SelectItem key={api.id} value={api.name.split(" ")[0]}>
                            {api.name}
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

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredSubmissions.length} of {submissions.length} submissions
                  </div>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>

                {/* Submissions table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Tool</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>API Used</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.name}</TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell>{submission.company}</TableCell>
                            <TableCell>{submission.tool}</TableCell>
                            <TableCell>{new Date(submission.date).toLocaleDateString()}</TableCell>
                            <TableCell>{submission.apiUsed}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewReport(submission.id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDownloadReport(submission.id)}>
                                  <Download className="h-4 w-4" />
                                </Button>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-settings">
            <Card>
              <CardHeader>
                <CardTitle>AI Platform Settings</CardTitle>
                <CardDescription>Configure API keys and models for each AI platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {apiProviders.map((provider) => (
                    <div key={provider.id} className="border rounded-md overflow-hidden">
                      <div
                        className="bg-gray-100 dark:bg-gray-800 p-4 flex justify-between items-center cursor-pointer"
                        onClick={() => {
                          const currentExpanded = JSON.parse(localStorage.getItem("expandedProviders") || "{}")
                          const newExpanded = {
                            ...currentExpanded,
                            [provider.id]:
                              currentExpanded[provider.id] === undefined ? true : !currentExpanded[provider.id],
                          }
                          localStorage.setItem("expandedProviders", JSON.stringify(newExpanded))
                          // Force re-render
                          setFilters({ ...filters })
                        }}
                      >
                        <h3 className="text-lg font-medium">{provider.name}</h3>
                        <Button variant="ghost" size="sm">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              JSON.parse(localStorage.getItem("expandedProviders") || "{}")[provider.id] === false
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>

                      {JSON.parse(localStorage.getItem("expandedProviders") || "{}")[provider.id] !== false && (
                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${provider.id}-key`}>API Key</Label>
                            <Input
                              id={`${provider.id}-key`}
                              type="password"
                              placeholder={
                                provider.id === "openai"
                                  ? "sk-..."
                                  : provider.id === "anthropic"
                                    ? "sk-ant-..."
                                    : provider.id === "google"
                                      ? "AIza..."
                                      : provider.id === "xai"
                                        ? "grok-..."
                                        : provider.id === "deepseek"
                                          ? "dsk-..."
                                          : provider.id === "ollama"
                                            ? "http://localhost:11434"
                                            : provider.id === "perplexity"
                                              ? "pplx-..."
                                              : "mis-..."
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${provider.id}-model`}>Model</Label>
                            <Select
                              defaultValue={
                                provider.id === "openai"
                                  ? "gpt-4o"
                                  : provider.id === "anthropic"
                                    ? "claude-3-opus"
                                    : provider.id === "google"
                                      ? "gemini-pro"
                                      : provider.id === "xai"
                                        ? "grok-1"
                                        : provider.id === "deepseek"
                                          ? "deepseek-coder"
                                          : provider.id === "ollama"
                                            ? "llama3"
                                            : provider.id === "perplexity"
                                              ? "pplx-7b-online"
                                              : "mistral-large"
                              }
                            >
                              <SelectTrigger id={`${provider.id}-model`}>
                                <SelectValue placeholder="Select Model" />
                              </SelectTrigger>
                              <SelectContent>
                                {provider.id === "openai" && (
                                  <>
                                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                  </>
                                )}
                                {provider.id === "anthropic" && (
                                  <>
                                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                                    <SelectItem value="claude-2">Claude 2</SelectItem>
                                  </>
                                )}
                                {provider.id === "google" && (
                                  <>
                                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                  </>
                                )}
                                {provider.id === "xai" && <SelectItem value="grok-1">Grok-1</SelectItem>}
                                {provider.id === "deepseek" && (
                                  <>
                                    <SelectItem value="deepseek-coder">Deepseek Coder</SelectItem>
                                    <SelectItem value="deepseek-chat">Deepseek Chat</SelectItem>
                                  </>
                                )}
                                {provider.id === "ollama" && (
                                  <>
                                    <SelectItem value="llama3">Llama 3</SelectItem>
                                    <SelectItem value="mistral">Mistral</SelectItem>
                                    <SelectItem value="codellama">CodeLlama</SelectItem>
                                    <SelectItem value="phi3">Phi-3</SelectItem>
                                  </>
                                )}
                                {provider.id === "perplexity" && (
                                  <>
                                    <SelectItem value="pplx-7b-online">Perplexity 7B Online</SelectItem>
                                    <SelectItem value="pplx-70b-online">Perplexity 70B Online</SelectItem>
                                  </>
                                )}
                                {provider.id === "mistral" && (
                                  <>
                                    <SelectItem value="mistral-large">Mistral Large</SelectItem>
                                    <SelectItem value="mistral-medium">Mistral Medium</SelectItem>
                                    <SelectItem value="mistral-small">Mistral Small</SelectItem>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor={`${provider.id}-temperature`}>Temperature</Label>
                              <span className="text-sm text-muted-foreground" id={`${provider.id}-temp-value`}>
                                0.7
                              </span>
                            </div>
                            <Input
                              id={`${provider.id}-temperature`}
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              defaultValue="0.7"
                              onChange={(e) => {
                                document.getElementById(`${provider.id}-temp-value`).textContent = e.target.value
                              }}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${provider.id}-max-tokens`}>Max Tokens</Label>
                            <Input
                              id={`${provider.id}-max-tokens`}
                              type="number"
                              min="100"
                              max="8000"
                              step="100"
                              defaultValue="1000"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <Button className="w-full mt-4 bg-primary-red hover:bg-red-700">Save AI Platform Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-prompts">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Manage Prompts</CardTitle>
                    <CardDescription>View and manage all prompt templates</CardDescription>
                  </div>
                  <Button
                    className="bg-primary-red hover:bg-red-700"
                    onClick={() => {
                      setCurrentPrompt(null)
                      setActiveTab("create-prompt")
                    }}
                  >
                    Create New Prompt
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Prompt Name</TableHead>
                          <TableHead>Objective</TableHead>
                          <TableHead>Default AI</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Modified</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promptsData.map((prompt) => (
                          <TableRow key={prompt.id}>
                            <TableCell className="font-medium">{prompt.name}</TableCell>
                            <TableCell>{prompt.objective}</TableCell>
                            <TableCell>
                              {prompt.defaultAI} ({prompt.defaultModel})
                            </TableCell>
                            <TableCell>{prompt.created}</TableCell>
                            <TableCell>{prompt.modified}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  title="Edit"
                                  onClick={() => handleEditPrompt(prompt.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" title="Documentation">
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500" title="Remove">
                                  <Trash className="h-4 w-4" />
                                </Button>
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
                <CardTitle>{currentPrompt ? "Edit Prompt" : "Create Prompt"}</CardTitle>
                <CardDescription>
                  {currentPrompt ? "Modify an existing prompt template" : "Design a new prompt template for your tools"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="prompt-heading">Prompt Heading</Label>
                    <Input
                      id="prompt-heading"
                      placeholder="Enter a title for this prompt"
                      defaultValue={currentPrompt?.name || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-objective">Objective</Label>
                    <Textarea
                      id="prompt-objective"
                      placeholder="What is the purpose of this prompt?"
                      defaultValue={currentPrompt?.objective || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initial-greeting">Initial Greeting Message</Label>
                    <Textarea
                      id="initial-greeting"
                      placeholder="Enter the initial greeting message"
                      defaultValue={currentPrompt?.greeting || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Questions to Collect Information</Label>
                    <div className="border rounded-md p-4 space-y-4">
                      {/* Questions will be dynamically added here */}
                      <div id="questions-container">
                        {currentPrompt ? (
                          currentPrompt.questions.map((question, index) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <Input placeholder={`Question ${index + 1}`} defaultValue={question} />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.currentTarget.parentElement.remove()
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex items-center space-x-2 mb-2">
                              <Input placeholder="Question 1" />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.currentTarget.parentElement.remove()
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Input placeholder="Question 2" />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.currentTarget.parentElement.remove()
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          const container = document.getElementById("questions-container")
                          const questionCount = container.children.length + 1
                          const questionDiv = document.createElement("div")
                          questionDiv.className = "flex items-center space-x-2 mb-2"
                          questionDiv.innerHTML = `
                            <input class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Question ${questionCount}">
                            <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 p-0" data-variant="ghost" data-size="icon">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-4 w-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                            </button>
                          `
                          container.appendChild(questionDiv)

                          // Add event listener to the remove button
                          const removeButton = questionDiv.querySelector("button")
                          removeButton.addEventListener("click", () => {
                            questionDiv.remove()
                          })
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-template">Prompt Template</Label>
                    <Textarea
                      id="prompt-template"
                      placeholder="Design the prompt that will be sent to the AI"
                      className="min-h-[100px]"
                      defaultValue={currentPrompt?.promptTemplate || ""}
                    />
                    <p className="text-sm text-muted-foreground">
                      Use placeholders: {"{objective}"}, {"{user_info}"}, {"{knowledge_base}"}, {"{query}"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Default AI Provider & Model</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Select defaultValue={currentPrompt?.defaultAI?.toLowerCase() || "openai"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">ChatGPT (OpenAI)</SelectItem>
                          <SelectItem value="anthropic">Claude (Anthropic)</SelectItem>
                          <SelectItem value="google">Gemini (Google)</SelectItem>
                          <SelectItem value="xai">Grok (xAI)</SelectItem>
                          <SelectItem value="deepseek">Deepseek</SelectItem>
                          <SelectItem value="ollama">Ollama (Self-hosted)</SelectItem>
                          <SelectItem value="perplexity">Perplexity</SelectItem>
                          <SelectItem value="mistral">Mistral</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select defaultValue={currentPrompt?.defaultModel || "gpt-4o"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
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
                      <Button className="bg-primary-red hover:bg-red-700">
                        {currentPrompt ? "Update Prompt" : "Save Prompt"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin-settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Manage admin users and system settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Add Admin User</Label>
                    <div className="flex space-x-2">
                      <Input id="admin-email" type="email" placeholder="admin@example.com" />
                      <Button>Add</Button>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="font-medium mb-2">Current Admins</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>admin@ceoitbox.com</span>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          Remove
                        </Button>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>manager@ceoitbox.com</span>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-logo">Company Logo</Label>
                    <Input id="company-logo" type="file" />
                  </div>

                  <Button className="w-full mt-4 bg-primary-red hover:bg-red-700">Save Admin Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
