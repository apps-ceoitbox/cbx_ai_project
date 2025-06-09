// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Settings, AlertCircle, Save, ExternalLink } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { useAxios } from "@/context/AppContext";

// // AI Agent data from the AI Agents page
// interface AgentCategory {
//   id: string;
//   title: string;
//   icon: string;
//   gradient: string;
//   color: string;
//   description: string;
// }

// const agentCategories: AgentCategory[] = [
//   {
//     id: "zoomary",
//     title: "Zoomary AI",
//     icon: "🤖",
//     gradient: "bg-gradient-to-br from-red-500 to-red-800",
//     color: "bg-red-600",
//     description: "Zoom meeting summariser agent"
//   },
//   {
//     id: "hr",
//     title: "Company Profile",
//     icon: "🔍",
//     gradient: "bg-gradient-to-br from-red-600 to-black",
//     color: "bg-red-600",
//     description: "Extracts and researches company details from Gmail."
//   },
//   {
//     id: "resume",
//     title: "Resume Analyzer",
//     icon: "📄",
//     gradient: "bg-gradient-to-br from-red-600 to-blue-800",
//     color: "bg-red-600",
//     description: "Analyzes and ranks candidate resumes against job requirements"
//   },
//   // {
//   //   id: "mail",
//   //   title: "AI Mail Sender",
//   //   icon: "✉️",
//   //   gradient: "bg-gradient-to-br from-red-500 to-red-700",
//   //   color: "bg-red-600",
//   //   description: "Smart email automation with AI-generated content"
//   // }
// ];

// // AI Model types for AI agents
// type AIModelType = "gemini" | "openai" | "anthropic" | "groq";

// interface AIModel {
//   id: AIModelType;
//   name: string;
//   description: string;
// }

// const aiModels: AIModel[] = [
//   {
//     id: "gemini",
//     name: "Google Gemini 2.0 Flash",
//     description: "Fast and efficient summarization"
//   },
//   {
//     id: "openai",
//     name: "OpenAI GPT-4o-mini",
//     description: "Balanced performance and quality"
//   },
//   {
//     id: "anthropic",
//     name: "Anthropic Claude 3.7 Sonnet",
//     description: "High quality detailed summaries"
//   },
//   {
//     id: "groq",
//     name: "Groq Llama 4 Scout",
//     description: "Fast processing with good accuracy"
//   }
// ];

// // Zoomary Settings Component
// const ZoomarySettings = () => {
//   const axios = useAxios("admin");
//   const [apiProviders, setApiProviders] = useState([]);
//   const [selectedProviderId, setSelectedProviderId] = useState<string>("");
//   const [isSaving, setIsSaving] = useState<boolean>(false);

//   console.log("apiProviders", apiProviders)

//   const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
//     const saved = localStorage.getItem('zoomary_model');
//     return (saved as AIModelType) || "gemini";
//   });

//   const [apiKey, setApiKey] = useState<string>(() => {
//     return localStorage.getItem('zoomary_api_key') || "";
//   });

//   const [isLoading, setIsLoading] = useState<boolean>(false);



//   const saveSettings = async () => {
//     if (!selectedProviderId || !selectedModel) {
//       toast.error("Please select a provider, model, and enter an API key");
//       return;
//     }

//     setIsSaving(true);
//     try {
//       const provider = apiProviders?.find((p) => p._id === selectedProviderId);

//       const payload = {
//         name: "Zoomary",
//         aiProvider: {
//           name: provider?.name,
//           model: selectedModel,
//         },
//         apikey: provider.apiKey,
//       };

//       const res = await axios.post("/aiagentsettings/addAiCredentials", payload);

//       toast.success("Settings saved successfully");
//     } catch (error: any) {
//       console.error("Save error:", error);
//       toast.error(error?.response?.data?.message || "Failed to save settings");
//     } finally {
//       setIsSaving(false);
//     }
//   };


//   useEffect(() => {
//     axios.get("/aiSettings").then(res => {
//       setApiProviders(res?.data?.data.filter(item => {
//         return item.apiKey && item.models.length > 0
//       }))
//     })
//   }, [])


//   useEffect(() => {
//     if (apiProviders.length === 0) return;

//     axios.get("/aiagentsettings").then((res) => {
//       const settings = res?.data?.data;

//       if (!Array.isArray(settings)) return;

//       const zoomarySetting = settings?.find(item => item.name === "Zoomary");

//       if (!zoomarySetting) return;

//       setSelectedModel(zoomarySetting.aiProvider?.model || "");
//       setApiKey(zoomarySetting.apiKey || "");

//       const provider = apiProviders?.find(
//         (p) => p.name === zoomarySetting.aiProvider?.name
//       );

//       if (provider?._id) {
//         setSelectedProviderId(provider._id);
//       }
//     });
//   }, [apiProviders]);

//   const selectedProvider = apiProviders?.find((p) => p._id === selectedProviderId);



//   return (
//     <div className="ml-12 mt-2 space-y-6">

//       <div className="flex items-center  gap-8">
//         <div className="min-w-[40%]">
//           <Select
//             value={selectedProviderId}
//             onValueChange={(value) => {
//               setSelectedProviderId(value);
//               setSelectedModel('');
//             }}
//             disabled={isLoading}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select AI Provider" />
//             </SelectTrigger>
//             <SelectContent>
//               {apiProviders.map((provider) => (
//                 <SelectItem key={provider._id} value={provider._id}>
//                   {provider.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Model Select */}
//         <div className="min-w-[40%]">
//           <Select
//             value={selectedModel}
//             onValueChange={(value) => setSelectedModel(value as any)}
//             disabled={!selectedProvider || isLoading}
//           >
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select AI Model" />
//             </SelectTrigger>
//             <SelectContent>
//               {selectedProvider?.models.map((model) => (
//                 <SelectItem key={model} value={model}>
//                   {model}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <div className="ml-0">
//         <Button
//           onClick={saveSettings}
//           className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
//           disabled={isSaving}
//         >
//           <Save size={16} />
//           {isSaving ? "Saving..." : "Save Zoomary Settings"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// // Company Profile Settings Component
// const CompanyProfileSettings = () => {
//   const [savedSettings, setSavedSettings] = useState<boolean>(false);

//   const [apiKey, setApiKey] = useState<string>(() => {
//     return localStorage.getItem('perplexity_api_key') || "";
//   });



//   const saveSettings = () => {
//     // Save settings to localStorage
//     localStorage.setItem('perplexity_api_key', apiKey);

//     toast.success("Company Profile settings saved successfully");
//     setSavedSettings(true);
//     setTimeout(() => setSavedSettings(false), 3000);
//   };

//   return (
//     <div className="ml-12 mt-2 space-y-6">
//       <div className="bg-white border border-red-100 rounded-lg p-6">
//         <h4 className="font-semibold text-lg text-gray-900 mb-4">Perplexity API Key</h4>
//         <Input
//           type="password"
//           placeholder="Enter your Perplexity API key"
//           value={apiKey}
//           onChange={(e) => setApiKey(e.target.value)}
//           className="w-full mb-2"
//         />
//         <p className="text-sm text-gray-500 mb-2">
//           This API key is required for the Company Profile agent to research companies.
//         </p>
//         <a
//           href="https://perplexity.ai/settings/api"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="inline-flex items-center text-sm text-red-600 hover:underline"
//         >
//           <ExternalLink className="w-3 h-3 mr-1" />
//           Get your Perplexity API key
//         </a>
//       </div>

//       <div className="ml-0">
//         <Button
//           onClick={saveSettings}
//           className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
//           disabled={savedSettings}
//         >
//           <Save size={16} />
//           {savedSettings ? "Settings Saved!" : "Save Company Profile Settings"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// // Resume Analyzer Settings Component
// const ResumeAnalyzerSettings = () => {
//   // Initialize state from localStorage if available
//   const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
//     const saved = localStorage.getItem('resume_analyzer_model');
//     return (saved as AIModelType) || "gemini";
//   });

//   const [apiKey, setApiKey] = useState<string>(() => {
//     return localStorage.getItem('resume_analyzer_api_key') || "";
//   });

//   const [savedSettings, setSavedSettings] = useState<boolean>(false);

//   const saveSettings = () => {
//     // Save settings to localStorage
//     localStorage.setItem('resume_analyzer_model', selectedModel);
//     localStorage.setItem('resume_analyzer_api_key', apiKey);

//     toast.success("Resume Analyzer settings saved successfully");
//     setSavedSettings(true);
//     setTimeout(() => setSavedSettings(false), 3000);
//   };

//   return (
//     <div className="ml-12 mt-2 space-y-6">
//       <div className="bg-white border border-red-100 rounded-lg p-6">
//         <h4 className="font-semibold text-lg text-gray-900 mb-4">AI Analysis Settings</h4>
//         <p className="text-sm text-gray-500 mb-4">Configure AI analysis parameters</p>

//         <h4 className="font-semibold text-lg text-gray-900 mb-2">Select AI Model</h4>
//         <Select
//           defaultValue={selectedModel}
//           onValueChange={(value) => setSelectedModel(value as AIModelType)}
//         >
//           <SelectTrigger className="w-full mb-2">
//             <SelectValue placeholder="Select an AI model" />
//           </SelectTrigger>
//           <SelectContent>
//             {aiModels.map((model) => (
//               <SelectItem key={model.id} value={model.id}>
//                 <div className="flex flex-col items-start">
//                   <span className="font-medium">{model.name}</span>
//                   <span className="text-xs text-gray-500">{model.description}</span>
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>

//         <h4 className="font-semibold text-lg text-gray-900 mt-4 mb-2">
//           {selectedModel === "gemini" ? "Gemini API Key" :
//             selectedModel === "openai" ? "OpenAI API Key" :
//               selectedModel === "anthropic" ? "Anthropic API Key" :
//                 selectedModel === "groq" ? "Groq API Key" : "API Key"}
//         </h4>
//         <Input
//           type="password"
//           placeholder={`Enter your ${selectedModel === "gemini" ? "Gemini" :
//             selectedModel === "openai" ? "OpenAI" :
//               selectedModel === "anthropic" ? "Anthropic" :
//                 selectedModel === "groq" ? "Groq" : ""} API key`}
//           value={apiKey}
//           onChange={(e) => setApiKey(e.target.value)}
//           className="w-full mb-2"
//         />
//         <p className="text-sm text-gray-500 mb-2">
//           Your API key is stored locally and never sent to our servers
//         </p>
//         <div className="text-xs text-gray-500 flex items-center">
//           {apiKey && <span className="text-green-600 mr-2">API key saved</span>}

//           {selectedModel === "gemini" && (
//             <a
//               href="https://ai.google.dev/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center text-sm text-red-600 hover:underline"
//             >
//               <ExternalLink className="w-3 h-3 mr-1" />
//               Get your Gemini API key
//             </a>
//           )}

//           {selectedModel === "openai" && (
//             <a
//               href="https://platform.openai.com/api-keys"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center text-sm text-red-600 hover:underline"
//             >
//               <ExternalLink className="w-3 h-3 mr-1" />
//               Get your OpenAI API key
//             </a>
//           )}

//           {selectedModel === "anthropic" && (
//             <a
//               href="https://console.anthropic.com/settings/keys"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center text-sm text-red-600 hover:underline"
//             >
//               <ExternalLink className="w-3 h-3 mr-1" />
//               Get your Anthropic API key
//             </a>
//           )}

//           {selectedModel === "groq" && (
//             <a
//               href="https://console.groq.com/keys"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="inline-flex items-center text-sm text-red-600 hover:underline"
//             >
//               <ExternalLink className="w-3 h-3 mr-1" />
//               Get your Groq API key
//             </a>
//           )}
//         </div>
//       </div>

//       <div className="ml-0">
//         <Button
//           onClick={saveSettings}
//           className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
//           disabled={savedSettings}
//         >
//           <Save size={16} />
//           {savedSettings ? "Settings Saved!" : "Save Resume Analyzer Settings"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// // AI Mail Sender Settings Component
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

// const AIAgentSettingsPage = () => {
//   return (
//     <div className="w-full" >
//       {/* <Link to="/ai-agents" className="mb-6 inline-block">
//         <Button variant="outline" className="mb-6 hover:border-red-600 hover:text-red-600">← Back to AI Agents</Button>
//       </Link> */}

//       <Card className="bg-white shadow-md" >
//         <CardHeader className="border-b">
//           <CardTitle className="text-3xl font-semibold text-red-600 flex items-center gap-3">
//             <Settings size={28} />
//             AI Agents Settings
//           </CardTitle>
//           <CardDescription className="text-gray-600">
//             Configure and customize your AI agents to match your specific needs
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="py-6">
//           <Accordion type="single" collapsible className="w-full">
//             {agentCategories.map((agent) => (
//               <AccordionItem key={agent.id} value={agent.id}>
//                 <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-md hover:no-underline">
//                   <div className="flex items-center gap-3">
//                     <div className={`${agent.gradient} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
//                       {agent.icon}
//                     </div>
//                     <div className="text-left">
//                       <h3 className="text-lg font-semibold text-gray-900">{agent.title} Settings</h3>
//                       <p className="text-sm text-gray-500">{agent.description}</p>
//                     </div>
//                   </div>
//                 </AccordionTrigger>
//                 <AccordionContent className="px-4 pb-4">
//                   {agent.id === "zoomary" ? (
//                     <ZoomarySettings />
//                   ) : agent.id === "hr" ? (
//                     <CompanyProfileSettings />
//                   ) : agent.id === "resume" ? (
//                     <ResumeAnalyzerSettings />
//                   ) : agent.id === "mail" ? (
//                     <AIMailSenderSettings />
//                   ) : (
//                     <div className="ml-12 mt-2 bg-red-50 border border-red-100 rounded-lg p-6">
//                       <div className="flex items-start gap-3">
//                         <AlertCircle className="text-red-600 h-6 w-6 flex-shrink-0 mt-0.5" />
//                         <div>
//                           <h4 className="font-semibold text-lg text-red-700">Coming Soon</h4>
//                           <p className="text-gray-600 mt-2">
//                             Settings for {agent.title} are currently in development. You'll soon be able to customize:
//                           </p>
//                           <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
//                             <li>Default AI model preferences</li>
//                             <li>Output format customization</li>
//                             <li>Data processing parameters</li>
//                             <li>Integration settings</li>
//                           </ul>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </AccordionContent>
//               </AccordionItem>
//             ))}
//           </Accordion>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AIAgentSettingsPage;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, AlertCircle, Save, ExternalLink } from "lucide-react";
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

interface AIModel {
  id: AIModelType;
  name: string;
  description: string;
}

const aiModels: AIModel[] = [
  {
    id: "gemini",
    name: "Google Gemini 2.0 Flash",
    description: "Fast and efficient summarization"
  },
  {
    id: "openai",
    name: "OpenAI GPT-4o-mini",
    description: "Balanced performance and quality"
  },
  {
    id: "anthropic",
    name: "Anthropic Claude 3.7 Sonnet",
    description: "High quality detailed summaries"
  },
  {
    id: "groq",
    name: "Groq Llama 4 Scout",
    description: "Fast processing with good accuracy"
  }
];

// Zoomary Settings Component
const ZoomarySettings = () => {
  const axios = useAxios("admin");
  const [apiProviders, setApiProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  console.log("apiProviders", apiProviders)

  const [selectedModel, setSelectedModel] = useState<AIModelType>(() => {
    const saved = localStorage.getItem('zoomary_model');
    return (saved as AIModelType) || "gemini";
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('zoomary_api_key') || "";
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

      const res = await axios.post("/aiagentsettings/addAiCredentials", payload);

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
      setApiKey(zoomarySetting.apiKey || "");

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
            disabled={isLoading}
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
            disabled={!selectedProvider || isLoading}
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

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('perplexity_api_key') || "";
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

      const res = await axios.post("/aiagentsettings/addAiCredentials", payload);

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
      setApiKey(companyProfileSetting.apiKey || "");

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
            disabled={isLoading}
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
            disabled={!selectedProvider || isLoading}
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

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('resume_analyzer_api_key') || "";
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      const res = await axios.post("/aiagentsettings/addAiCredentials", payload);

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
      setApiKey(resumeAnalyzerSetting.apiKey || "");

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
            disabled={isLoading}
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
            disabled={!selectedProvider || isLoading}
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
