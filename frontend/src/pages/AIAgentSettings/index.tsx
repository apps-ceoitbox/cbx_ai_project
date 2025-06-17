import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, AlertCircle, Save, Sparkles, Search, FileText, Eye, EyeOff } from "lucide-react";
// import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAxios } from "@/context/AppContext";

// AI Agent data from the AI Agents page
interface AgentCategory {
  id: string;
  title: string;
  icon: any;
  gradient: string;
  color: string;
  description: string;
}

const agentCategories: AgentCategory[] = [
  {
    id: "Zoomary",
    title: "Zoom AI",
    icon: <Sparkles />,
    gradient: "bg-gradient-to-br from-red-500 to-red-800",
    color: "bg-red-600",
    description: "Enter a Zoom recording URL or upload a transcript file to generate a detailed meeting summary"
  },
  {
    id: "CompanyProfile",
    title: "Company Profile",
    icon: <Search />,
    gradient: "bg-gradient-to-br from-red-600 to-black",
    color: "bg-red-600",
    description: "Extracts and researches company details from Gmail."
  },
  {
    id: "ResumeAnalyzer",
    title: "Resume Analyzer",
    icon: <FileText />,
    gradient: "bg-gradient-to-br from-red-600 to-blue-800",
    color: "bg-red-600",
    description: "Analyzes and ranks candidate resumes against job requirements"
  },
  // {
  //   id: "mail",
  //   title: "AI Mail Sender",
  //   icon: "✉️",
  //   gradient: "bg-gradient-to-br from-red-500 to-red-700",
  //   color: "bg-red-600",
  //   description: "Smart email automation with AI-generated content"
  // }
];

// AI Model types for AI agents
type AIModelType = "gemini" | "openai" | "anthropic" | "groq";

// Zoomary Settings Component
const ZoomarySettings = () => {
  const axios = useAxios("admin");
  const [apiProviders, setApiProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [promptContent, setPromptContent] = useState<string>("");

  const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
    const saved = localStorage.getItem('zoomary_model');
    return (saved as AIModelType) || "gemini";
  });

  // Default prompt content to use if none is saved
  const defaultPromptContent = `
    You are an expert meeting summarizer.Please create a comprehensive, detailed, and professional summary 
    of the following meeting transcript.Your summary should be:

1. Well - structured and organized with clear sections
2. Include key points, action items, and decisions made
3. Maintain a professional tone
4. Highlight important deadlines or follow - ups
5. Include a "Meeting Topics with Timestamps" section with ACCURATE timestamps extracted from the transcript
6. Meeting Title
    
    Format your response as HTML with visually appealing styling:
- Main heading: <h1 style="color: #0E72ED; font-size: 1.8rem; border-bottom: 2px solid #0E72ED; padding-bottom: 0.5rem; margin-bottom: 1.5rem;">Meeting Summary</h1>
  - Section headings: <h2 style="color: #9b87f5; font-size: 1.5rem; margin-top: 1.5rem; border-bottom: 1px solid #E5DEFF; padding-bottom: 0.3rem;">Section Name</h2>
    - Subsections: <h3 style="color: #0E72ED; font-size: 1.2rem; margin-top: 1rem;">Subsection Name</h3>
      - Meeting Topics section: <h2 style="color: #9b87f5; font-size: 1.5rem; margin-top: 1.5rem; border-bottom: 1px solid #E5DEFF; padding-bottom: 0.3rem;">Meeting Topics with Timestamps</h2>
        - For each topic with timestamp:
        <div style="margin-bottom: 1.2rem; padding: 0.6rem; background-color: #F9F8FF; border-radius: 0.3rem; border-left: 3px solid #9b87f5;">
          <span style="color: #0E72ED; font-weight: bold; font-family: monospace; background-color: #E8F4FE; padding: 0.2rem 0.4rem; border-radius: 0.2rem; margin-right: 0.5rem;">00:00:00</span>
          <span style="font-weight: 500;">Topic description</span>
        </div>
          - Paragraphs: <p style="margin-bottom: 1rem; line-height: 1.6;">Content</p>
            - Bullet points: <ul style="margin-bottom: 1rem; padding-left: 1.5rem;"><li style="margin-bottom: 0.5rem;">Point</li></ul>
              - Important notes: <div style="background-color: #E5DEFF; border-left: 4px solid #9b87f5; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;">Important note</div>
                - Action items: <div style="background-color: #E8F4FE; border-left: 4px solid #0E72ED; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;"><span style="font-weight: bold; color: #0E72ED;">Action Item: </span>Description</div>
                  - Decisions: <div style="background-color: #E8FCEF; border-left: 4px solid #10B981; padding: 0.8rem; margin: 1rem 0; border-radius: 0.2rem;"><span style="font-weight: bold; color: #10B981;">Decision: </span>Description</div>
    
    IMPORTANT INSTRUCTIONS FOR TIMESTAMPS:
1. Carefully extract REAL timestamps from the transcript.Do not make up or estimate timestamps.
    2. If the transcript includes timestamps(e.g., [00:05: 30]), use these exact timestamps.
    3. Include timestamps for at least 5 - 8 key discussion topics to provide a helpful timeline.
    4. Present timestamps in the format HH: MM:SS or MM:SS if less than an hour.
    5. Organize topics chronologically according to when they appear in the transcript.
    6. Each timestamp entry should clearly describe the specific topic being discussed at that time.

  IMPORTANT: DO NOT include markdown code blocks or any triple backticks in your response.Provide clean HTML only.
    
    Always include these sections:
1. Meeting Title
2. Executive Summary
3. Key Discussion Points
4. Meeting Topics with Timestamps(with ACCURATE timestamps from the transcript)
5. Action Items
6. Decisions Made
7. Follow - ups and Next Steps
  `;

  // Initialize promptContent with default if empty
  useEffect(() => {
    if (!promptContent) {
      setPromptContent(defaultPromptContent);
    }
  }, []);

  const saveSettings = async () => {
    if (!selectedProviderId || !selectedModel) {
      toast.error("Please select a provider, model, and enter an API key");
      return;
    }

    setIsSaving(true);
    try {
      const provider = apiProviders?.find((p) => p._id === selectedProviderId);

      if (!provider) {
        toast.error("Selected provider not found");
        setIsSaving(false);
        return;
      }

      const payload = {
        name: "Zoomary",
        aiProvider: {
          name: provider.name,
          model: selectedModel,
        },
        apikey: provider.apiKey,
        promptContent: promptContent,
      };

      await axios.post("/aiagentsettings/addAiCredentials", payload);

      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };


  useEffect(() => {
    axios.get("/aiSettings").then(res => {
      setApiProviders(res?.data?.data.filter(item => {
        return item.apiKey && item.models.length > 0
      }))
    })
  }, [])


  useEffect(() => {
    if (apiProviders.length === 0) return;

    axios.get("/aiagentsettings").then((res) => {
      const settings = res?.data?.data;

      if (!Array.isArray(settings)) return;

      const zoomarySetting = settings?.find(item => item.name === "Zoomary");

      if (!zoomarySetting) return;

      setSelectedModel(zoomarySetting.aiProvider?.model || "");

      // Set prompt content if it exists in the settings
      if (zoomarySetting.promptContent) {
        setPromptContent(zoomarySetting.promptContent);
      } else {
        setPromptContent(defaultPromptContent);
      }

      const provider = apiProviders?.find(
        (p) => p.name === zoomarySetting.aiProvider?.name
      );

      if (provider?._id) {
        setSelectedProviderId(provider._id);
      }
    });
  }, [apiProviders]);

  const selectedProvider = apiProviders?.find((p) => p._id === selectedProviderId);

  const resetToDefault = () => {
    setPromptContent(defaultPromptContent);
    toast.success("Prompt reset to default");
  };



  return (
    <div className="ml-12 mt-2 space-y-6">

      <div className="flex items-center gap-8">
        <div className="min-w-[40%]">
          <Select
            value={selectedProviderId}
            onValueChange={(value) => {
              setSelectedProviderId(value);
              setSelectedModel("gemini" as AIModelType);
            }}

          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Provider" />
            </SelectTrigger>
            <SelectContent>
              {apiProviders.map((provider) => (
                <SelectItem key={provider._id} value={provider._id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Select */}
        <div className="min-w-[40%]">
          <Select
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as any)}
            disabled={!selectedProvider}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {selectedProvider?.models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* System Prompt Configuration */}
      <div className="bg-white border border-red-100 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg text-gray-900">System Prompt</h4>
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Reset to Default
          </Button>
        </div>
        <textarea
          value={promptContent}
          onChange={(e) => setPromptContent(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter system prompt for Zoomary AI"
        />
        <p className="text-sm text-gray-500 mt-2">
          This prompt will be used to guide the AI in generating meeting summaries. Customize it to match your specific requirements.
        </p>
      </div>

      <div className="ml-0">
        <Button
          onClick={saveSettings}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Zoomary Settings"}
        </Button>
      </div>
    </div>
  );
};

// Company Profile Settings Component
const CompanyProfileSettings = () => {
  const axios = useAxios("admin");
  const [apiProviders, setApiProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [promptContent, setPromptContent] = useState<string>("");

  const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
    const saved = localStorage.getItem('perplexity_model');
    return (saved as AIModelType) || "gemini";
  });

  // Default prompt content to use if none is saved
  const defaultPromptContent = `You are an AI researcher specialized in extracting company information from emails and conducting thorough research.Present your findings as a comprehensive company profile in markdown format with clear, structured sections.

Your profile should include:
- Company name as a main heading(##)
  - Contact information(emails, phone numbers found in the text)
    - Company website(if found in the text or through research)
- Industry / sector classification
  - Company size(employees, revenue if available)
  - Key products / services
    - Main competitors
      - Recent news or developments
        - Company leadership / executives
          - Social media presence
            - Company location(s)

Follow these guidelines:
1. Extract all relevant company information from the provided email
2. Conduct additional research to fill in missing details
3. Present information in a clear, professional format
4. Use bullet points for lists and proper markdown formatting
5. Include a brief executive summary at the beginning
6. Cite sources for any external information
7. Maintain a neutral, factual tone

If certain information is not available, indicate this clearly rather than making assumptions.`;

  // Initialize promptContent with default if empty
  useEffect(() => {
    if (!promptContent) {
      setPromptContent(defaultPromptContent);
    }
  }, []);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const saveSettings = async () => {
    if (!selectedProviderId || !selectedModel) {
      toast.error("Please select a provider, model, and enter an API key");
      return;
    }

    setIsSaving(true);
    try {
      const provider = apiProviders?.find((p) => p._id === selectedProviderId);

      if (!provider) {
        toast.error("Selected provider not found");
        setIsSaving(false);
        return;
      }

      const payload = {
        name: "CompanyProfile",
        aiProvider: {
          name: provider.name,
          model: selectedModel,
        },
        apikey: provider.apiKey,
        promptContent: promptContent,
      };

      await axios.post("/aiagentsettings/addAiCredentials", payload);

      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    axios.get("/aiSettings").then(res => {
      setApiProviders(res?.data?.data.filter(item => {
        return item.apiKey && item.models.length > 0
      }))
    })
  }, [])

  useEffect(() => {
    if (apiProviders.length === 0) return;

    axios.get("/aiagentsettings").then((res) => {
      const settings = res?.data?.data;

      if (!Array.isArray(settings)) return;

      const companyProfileSetting = settings?.find(item => item.name === "CompanyProfile");

      if (!companyProfileSetting) return;

      setSelectedModel(companyProfileSetting.aiProvider?.model || "");

      // Set prompt content if it exists in the settings
      if (companyProfileSetting.promptContent) {
        setPromptContent(companyProfileSetting.promptContent);
      } else {
        setPromptContent(defaultPromptContent);
      }

      const provider = apiProviders?.find(
        (p) => p.name === companyProfileSetting.aiProvider?.name
      );

      if (provider?._id) {
        setSelectedProviderId(provider._id);
      }
    });
  }, [apiProviders]);

  const selectedProvider = apiProviders?.find((p) => p._id === selectedProviderId);

  const resetToDefault = () => {
    setPromptContent(defaultPromptContent);
    toast.success("Prompt reset to default");
  };

  return (
    <div className="ml-12 mt-2 space-y-6">
      <div className="flex items-center gap-8">
        <div className="min-w-[40%]">
          <Select
            value={selectedProviderId}
            onValueChange={(value) => {
              setSelectedProviderId(value);
              setSelectedModel("gemini" as AIModelType);
            }}

          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Provider" />
            </SelectTrigger>
            <SelectContent>
              {apiProviders?.map((provider) => (
                <SelectItem key={provider._id} value={provider._id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Select */}
        <div className="min-w-[40%]">
          <Select
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as any)}
            disabled={!selectedProvider}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {selectedProvider?.models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* System Prompt Configuration */}
      <div className="bg-white border border-red-100 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg text-gray-900">System Prompt</h4>
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Reset to Default
          </Button>
        </div>
        <textarea
          value={promptContent}
          onChange={(e) => setPromptContent(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Enter system prompt for Company Profile AI"
        />
        <p className="text-sm text-gray-500 mt-2">
          This prompt will be used to guide the AI in generating company profiles. Customize it to match your specific requirements.
        </p>
      </div>

      <div className="ml-0">
        <Button
          onClick={saveSettings}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Company Profile Settings"}
        </Button>
      </div>
    </div>
  );
};

// Resume Analyzer Settings Component
const ResumeAnalyzerSettings = () => {
  const axios = useAxios("admin");
  const [apiProviders, setApiProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
    const saved = localStorage.getItem('resume_analyzer_model');
    return (saved as AIModelType) || "gemini";
  });



  const [isSaving, setIsSaving] = useState<boolean>(false);

  const saveSettings = async () => {
    if (!selectedProviderId || !selectedModel) {
      toast.error("Please select a provider, model, and enter an API key");
      return;
    }

    setIsSaving(true);
    try {
      const provider = apiProviders?.find((p) => p._id === selectedProviderId);

      if (!provider) {
        toast.error("Selected provider not found");
        setIsSaving(false);
        return;
      }

      const payload = {
        name: "ResumeAnalyzer",
        aiProvider: {
          name: provider.name,
          model: selectedModel,
        },
        apikey: provider.apiKey,
      };

      // Save to backend
      await axios.post("/aiagentsettings/addAiCredentials", payload);

      // Also save to localStorage for backward compatibility
      localStorage.setItem('resume_analyzer_model', selectedModel);
      localStorage.setItem('resume_analyzer_api_key', provider.apiKey);

      toast.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.response?.data?.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    axios.get("/aiSettings").then(res => {
      setApiProviders(res?.data?.data.filter(item => {
        return item.apiKey && item.models.length > 0
      }))
    })
  }, [])

  useEffect(() => {
    if (apiProviders.length === 0) return;

    axios.get("/aiagentsettings").then((res) => {
      const settings = res?.data?.data;

      if (!Array.isArray(settings)) return;

      const resumeAnalyzerSetting = settings?.find(item => item.name === "ResumeAnalyzer");

      if (!resumeAnalyzerSetting) return;

      setSelectedModel(resumeAnalyzerSetting.aiProvider?.model || "");


      const provider = apiProviders?.find(
        (p) => p.name === resumeAnalyzerSetting.aiProvider?.name
      );

      if (provider?._id) {
        setSelectedProviderId(provider._id);
      }
    });
  }, [apiProviders]);

  const selectedProvider = apiProviders?.find((p) => p._id === selectedProviderId);

  return (
    <div className="ml-12 mt-2 space-y-6">
      <div className="flex items-center gap-8">
        <div className="min-w-[40%]">
          <Select
            value={selectedProviderId}
            onValueChange={(value) => {
              setSelectedProviderId(value);
              setSelectedModel("gemini" as AIModelType);
            }}

          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Provider" />
            </SelectTrigger>
            <SelectContent>
              {apiProviders.map((provider) => (
                <SelectItem key={provider._id} value={provider._id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Select */}
        <div className="min-w-[40%]">
          <Select
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as any)}
            disabled={!selectedProvider}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select AI Model" />
            </SelectTrigger>
            <SelectContent>
              {selectedProvider?.models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="ml-0">
        <Button
          onClick={saveSettings}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          disabled={isSaving}
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Resume Analyzer Settings"}
        </Button>
      </div>
    </div>
  );
};

// AI Mail Sender Settings Component
// const AIMailSenderSettings = () => {
//   // Initialize webhook URL from localStorage if available
//   const [webhookUrl, setWebhookUrl] = useState<string>(() => {
//     return localStorage.getItem('mail_sender_webhook_url') || "https://vimes85.app.n8n.cloud/webhook-test/chatbot-agent";
//   });

//   const [savedSettings, setSavedSettings] = useState<boolean>(false);

//   const saveSettings = () => {
//     // Save settings to localStorage
//     localStorage.setItem('mail_sender_webhook_url', webhookUrl);

//     toast.success("AI Mail Sender settings saved successfully");
//     setSavedSettings(true);
//     setTimeout(() => setSavedSettings(false), 3000);
//   };

//   return (
//     <div className="ml-12 mt-2 space-y-6">
//       <div className="bg-white border border-red-100 rounded-lg p-6">
//         <h4 className="font-semibold text-lg text-gray-900 mb-4">n8n Webhook URL</h4>
//         <div className="space-y-1">
//           <Input
//             type="text"
//             value={webhookUrl}
//             onChange={(e) => setWebhookUrl(e.target.value)}
//             placeholder="Enter your n8n webhook URL"
//             className="w-full"
//           />
//           <p className="text-sm text-gray-500 mt-1">
//             The n8n webhook URL that processes email requests
//           </p>
//         </div>

//         <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="text-red-600 h-5 w-5 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="text-sm text-gray-600">
//                 You need a configured n8n workflow to handle email requests. Make sure your
//                 webhook accepts a message parameter and returns appropriate response data.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="ml-0">
//         <Button
//           onClick={saveSettings}
//           className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
//           disabled={savedSettings}
//         >
//           <Save size={16} />
//           {savedSettings ? "Settings Saved!" : "Save Mail Sender Settings"}
//         </Button>
//       </div>
//     </div>
//   );
// };

const AIAgentSettingsPage = () => {
  const axios = useAxios("admin");
  const [prompt, setPrompt] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");


  const fetchAiAgents = async () => {
    try {
      const res = await axios.get("/aiagentsettings");
      const settings = res?.data?.data || [];
      setPrompt(settings);
    } catch (error) {
      console.error("Failed to fetch AI agent settings:", error);
    }
  };

  useEffect(() => {
    fetchAiAgents();
  }, [])


  const handleToggleVisibility = async (promptId: string) => {
    try {
      await axios.post(`/aiagentsettings/${promptId}`);
      toast.success("Agent visibility toggled successfully!");
      fetchAiAgents();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Failed to toggle agent visibility.");
    }
  };



  return (
    <div className="w-full" >
      <Card className="bg-white shadow-md" >


        <CardHeader className="border-b">
          <div className="w-full flex justify-between">
            <div>
              <CardTitle className="text-3xl font-semibold text-red-600 flex items-center gap-3">
                <Settings size={28} />
                AI Agents Settings
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configure and customize your AI agents to match your specific needs
              </CardDescription>
            </div>
            <div className="">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search AI Agent Settings..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-6">
          <Accordion type="single" collapsible className="w-full">
            {agentCategories?.filter((agent) =>
              agent.title.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((agent) => {
              const matchingPrompt = prompt?.find((item) => item.name === agent.id);

              return (
                <AccordionItem key={agent.id} value={agent.id}>
                  <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-md hover:no-underline">
                    <div className="flex items-center gap-3">
                      {matchingPrompt && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVisibility(matchingPrompt._id);
                          }}
                        >
                          {matchingPrompt.visibility ? (
                            <Eye className="text-gray-500" />
                          ) : (
                            <EyeOff className="text-gray-500" />
                          )}
                        </Button>
                      )}

                      <div
                        className="bg-red-500 p-3 rounded-full flex items-center justify-center text-white text-2xl shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                        {agent.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {agent.title} Settings
                        </h3>
                        <p className="text-sm text-gray-500">{agent.description}</p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4">
                    {agent.id === "Zoomary" ? (
                      <ZoomarySettings />
                    ) : agent.id === "CompanyProfile" ? (
                      <CompanyProfileSettings />
                    ) : agent.id === "ResumeAnalyzer" ? (
                      <ResumeAnalyzerSettings />
                    ) : (
                      <div className="ml-12 mt-2 bg-red-50 border border-red-100 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-red-600 h-6 w-6 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-lg text-red-700">Coming Soon</h4>
                            <p className="text-gray-600 mt-2">
                              Settings for {agent.title} are currently in development. You'll soon be able to customize:
                            </p>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                              <li>Default AI model preferences</li>
                              <li>Output format customization</li>
                              <li>Data processing parameters</li>
                              <li>Integration settings</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>

      </Card>
    </div>
  );
};

export default AIAgentSettingsPage;