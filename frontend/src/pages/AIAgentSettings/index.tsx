

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, AlertCircle, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  icon: string;
  gradient: string;
  color: string;
  description: string;
}

const agentCategories: AgentCategory[] = [
  {
    id: "zoomary",
    title: "Zoomary AI",
    icon: "🤖",
    gradient: "bg-gradient-to-br from-red-500 to-red-800",
    color: "bg-red-600",
    description: "Zoom meeting summariser agent"
  },
  {
    id: "hr",
    title: "Company Profile",
    icon: "🔍",
    gradient: "bg-gradient-to-br from-red-600 to-black",
    color: "bg-red-600",
    description: "Extracts and researches company details from Gmail."
  },
  {
    id: "resume",
    title: "Resume Analyzer",
    icon: "📄",
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

  const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
    const saved = localStorage.getItem('zoomary_model');
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
        name: "Zoomary",
        aiProvider: {
          name: provider.name,
          model: selectedModel,
        },
        apikey: provider.apiKey,
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


      const provider = apiProviders?.find(
        (p) => p.name === zoomarySetting.aiProvider?.name
      );

      if (provider?._id) {
        setSelectedProviderId(provider._id);
      }
    });
  }, [apiProviders]);

  const selectedProvider = apiProviders?.find((p) => p._id === selectedProviderId);



  return (
    <div className="ml-12 mt-2 space-y-6">

      <div className="flex items-center  gap-8">
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

  const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
    const saved = localStorage.getItem('perplexity_model');
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
        name: "CompanyProfile",
        aiProvider: {
          name: provider.name,
          model: selectedModel,
        },
        apikey: provider.apiKey,
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


      const provider = apiProviders?.find(
        (p) => p.name === companyProfileSetting.aiProvider?.name
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
const AIMailSenderSettings = () => {
  // Initialize webhook URL from localStorage if available
  const [webhookUrl, setWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('mail_sender_webhook_url') || "https://vimes85.app.n8n.cloud/webhook-test/chatbot-agent";
  });

  const [savedSettings, setSavedSettings] = useState<boolean>(false);

  const saveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('mail_sender_webhook_url', webhookUrl);

    toast.success("AI Mail Sender settings saved successfully");
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="ml-12 mt-2 space-y-6">
      <div className="bg-white border border-red-100 rounded-lg p-6">
        <h4 className="font-semibold text-lg text-gray-900 mb-4">n8n Webhook URL</h4>
        <div className="space-y-1">
          <Input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="Enter your n8n webhook URL"
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            The n8n webhook URL that processes email requests
          </p>
        </div>

        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                You need a configured n8n workflow to handle email requests. Make sure your
                webhook accepts a message parameter and returns appropriate response data.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-0">
        <Button
          onClick={saveSettings}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          disabled={savedSettings}
        >
          <Save size={16} />
          {savedSettings ? "Settings Saved!" : "Save Mail Sender Settings"}
        </Button>
      </div>
    </div>
  );
};

const AIAgentSettingsPage = () => {
  return (
    <div className="w-full" >
      <Card className="bg-white shadow-md" >
        <CardHeader className="border-b">
          <CardTitle className="text-3xl font-semibold text-red-600 flex items-center gap-3">
            <Settings size={28} />
            AI Agents Settings
          </CardTitle>
          <CardDescription className="text-gray-600">
            Configure and customize your AI agents to match your specific needs
          </CardDescription>
        </CardHeader>

        <CardContent className="py-6">
          <Accordion type="single" collapsible className="w-full">
            {agentCategories.map((agent) => (
              <AccordionItem key={agent.id} value={agent.id}>
                <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-md hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className={`${agent.gradient} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                      {agent.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{agent.title} Settings</h3>
                      <p className="text-sm text-gray-500">{agent.description}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {agent.id === "zoomary" ? (
                    <ZoomarySettings />
                  ) : agent.id === "hr" ? (
                    <CompanyProfileSettings />
                  ) : agent.id === "resume" ? (
                    <ResumeAnalyzerSettings />
                  ) : agent.id === "mail" ? (
                    <AIMailSenderSettings />
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
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentSettingsPage;
