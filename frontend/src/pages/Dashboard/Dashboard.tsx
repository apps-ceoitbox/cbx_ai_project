import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Loader2 } from "lucide-react"
import { useAxios, useData } from "@/context/AppContext"
import { templateCategories } from "../Admin/Admin"
import {
  Settings,
  Megaphone,
  HandCoins,
  Banknote,
  Users,
  BarChart,
  ShieldCheck,
  FolderX
} from "lucide-react";
import Header from "./Header"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export interface PromptInterface {
  _id: string;
  heading: string;
  category: string;
  visibility: boolean;
  objective: string;
  initialGreetingsMessage: string;
  questions: string[];
  knowledgeBase: string[];
  promptTemplate: string;
  defaultAiProvider: DefaultAiProvider;
  createdAt: Date;
  updatedAt: Date;
}

interface DefaultAiProvider {
  name: string;
  model: string;
}

// Category card component with animations and backgrounds 
const CategoryCard = ({ category, onClick, icon }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Background patterns and images specific to each category
  const getCategoryBackground = () => {
    switch (category) {
      case 'Operations':
        return {
          backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070')",
          backgroundPattern: "radial-gradient(circle, rgba(255,0,0,0.1) 10%, transparent 10.5%), radial-gradient(circle, rgba(255,0,0,0.1) 10%, transparent 10.5%)",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0",
        };
      case 'Marketing':
        return {
          backgroundImage: "url('https://t4.ftcdn.net/jpg/05/89/42/79/240_F_589427987_DHuYZn4ZIhPQVSA5aoQYiWw5inuKCWig.jpg')",
          backgroundPattern: "linear-gradient(45deg, rgba(255,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(255,0,0,0.1) 50%, rgba(255,0,0,0.1) 75%, transparent 75%, transparent)",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Sales':
        return {
          backgroundImage: "url('https://t3.ftcdn.net/jpg/01/93/45/64/240_F_193456449_YNEfRylKS3ftw3gMtqeDD3oMo9rZduH1.jpg')",
          backgroundPattern: "linear-gradient(90deg, rgba(255,0,0,0.1) 50%, transparent 50%)",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Finance':
        return {
          backgroundImage: "url('https://t4.ftcdn.net/jpg/02/68/73/69/240_F_268736974_pFiPUxyhe3nT1ziSUQ229N1hRt89n8IS.jpg')",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'HR':
        return {
          backgroundImage: "url('https://t3.ftcdn.net/jpg/04/06/02/96/240_F_406029666_HXoRQoU8ojjpcDiSKRSe34DOF5EIyeP5.jpg')",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Strategy':
        return {
          backgroundImage: "url('https://t4.ftcdn.net/jpg/10/68/79/25/240_F_1068792506_Qr9ytC1SGzCFh0lQKwOWiKs7mUAU07hv.jpg')",
          backgroundSize: "cover, 20px 20px",
          backgroundPosition: "center, 0 0"
        };
      case 'Compliances':
        return {
          backgroundImage: "url('https://t4.ftcdn.net/jpg/11/14/07/35/240_F_1114073584_IR0CLjhz0C48WnTKdxbFwLlsnK5R2qRh.jpg')",
          backgroundSize: "cover, 50px 50px",
          backgroundPosition: "center, 0 0"
        };
      default:
        return {
          backgroundImage: "url('https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=2071')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        };
    }
  };

  const bgStyles = getCategoryBackground();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 cursor-pointer ${isHovered ? "border-red-600 shadow-lg translate-y-[-8px]" : "border-gray-200"
        }`}
      style={{
        height: '220px',
        // backgroundImage: `${bgStyles.backgroundPattern || ''}, ${bgStyles.backgroundImage}`,
        backgroundImage: ` ${bgStyles.backgroundImage}`,
        backgroundSize: bgStyles.backgroundSize,
        backgroundPosition: bgStyles.backgroundPosition
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 z-10"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between z-20 p-5">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full bg-red-600 text-white transition-all duration-300 ${isHovered ? "rotate-12 scale-110" : ""
            }`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{category}</h3>
        </div>

        <div className="mt-auto">
          <button
            className={`w-full py-2 rounded-md text-center font-medium transition-all duration-300 ${isHovered
              ? "bg-red-600 text-white"
              : "bg-white/90 text-red-600"
              }`}
          >
            Click here
            <span className={`ml-2 inline-block transition-transform duration-300 ${isHovered ? "translate-x-1" : ""
              }`}>
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Tool card component with consistent height and "see more" functionality
const ToolCard = ({ tool, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`flex flex-col justify-between h-70 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        isHovered ? "border-red-600 shadow-lg" : "border-gray-200"
      }`}
      onClick={() => onClick(tool._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex gap-2">
            <div className={`p-1.5 flex items-start h-fit rounded-full bg-red-600 text-white transition-transform duration-300 ${
              isHovered ? "scale-110" : ""
            }`}>
              <FileText className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold line-clamp-2">{tool.heading}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col px-4 pb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-1">
                  <CardDescription className="text-sm leading-relaxed line-clamp-3 cursor-help">
                    {tool.objective}
                  </CardDescription>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs whitespace-pre-line">
                {tool.objective}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </div>
      <CardFooter className="pt-2">
        <Button 
          variant="ghost" 
          className="w-full text-red-600 hover:bg-red-50 font-medium text-sm py-2"
        >
          Start Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function Dashboard() {
  const { userAuth } = useData();
  const axios = useAxios("user");
  const nav = useNavigate();

  const [tools, setTools] = useState<PromptInterface[]>([])
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [toolName, setToolName] = useState("__all__");

  const handleToolClick = (toolId: string) => {
    nav(`/tools/${toolId}`)
  }

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/prompt")
        setTools(response?.data?.data);
      } catch (error) {
        console.error("Error fetching tools:", error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchTools()
  }, [])

  useEffect(() => {
    if (!userAuth.user) {
      nav("/login")
    }
  }, [userAuth, nav])

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounced(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset filters when category changes
  useEffect(() => {
    setSearch("");
    setSearchDebounced("");
    setToolName("__all__");
  }, [selectedCategory]);

  if (!userAuth.user) {
    return null
  }

  // Filter tools by category, search, and toolName
  const filteredTools = tools?.filter(tool => {
    if (tool.category !== selectedCategory || !tool.visibility) return false;
    if (toolName !== "__all__" && tool.heading !== toolName) return false;
    if (searchDebounced) {
      const s = searchDebounced.toLowerCase();
      return (
        tool.heading.toLowerCase().includes(s) ||
        tool.objective.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const categoryIcons = {
    Operations: <Settings className="h-6 w-6" />,
    Marketing: <Megaphone className="h-6 w-6" />,
    Sales: <HandCoins className="h-6 w-6" />,
    Finance: <Banknote className="h-6 w-6" />,
    HR: <Users className="h-6 w-6" />,
    Strategy: <BarChart className="h-6 w-6" />,
    Compliances: <ShieldCheck className="h-6 w-6" />,
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Header />
      <main className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto py-8">
        <div className="flex justify-between">

          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
              Welcome, {userAuth?.user?.userName}
            </h1>

            <p className="text-gray-600 mb-8">Select a {selectedCategory ? "tool" : "category"} to get started</p>
          </div>

          {selectedCategory &&
            <Button
              onClick={() => setSelectedCategory(null)}
              style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
              className=" bg-primary-red  hover:bg-red-700 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          }

        </div>

        {!selectedCategory && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateCategories.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              icon={categoryIcons[category] || <FileText className="h-6 w-6" />}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>}

        {selectedCategory && <>
        <div className="mb-6 flex justify-end grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="tool-search">Search Tools</Label>
            <Input
              id="tool-search"
              placeholder="Type to search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tool-dropdown">Filter by Tool Name</Label>
            <Select
              value={toolName}
              onValueChange={setToolName}
            >
              <SelectTrigger id="tool-dropdown" className="mt-1">
                <SelectValue placeholder="All tools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All tools</SelectItem>
                {Array.from(new Set(tools.filter(t => t.category === selectedCategory && t.visibility).map(t => t.heading))).map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {
            filteredTools.length === 0 ?
              <div className="w-full flex flex-col col-span-full items-center justify-center text-gray-500 py-8 gap-2">
                <FolderX className="w-10 h-10 text-red-600" />
                <div className="text-lg font-semibold">No tools found</div>
                <div className="text-sm text-center max-w-md">
                  It looks like there's no tool data available in this category. Please select another or check back later.
                </div>
              </div>
              :
              filteredTools.map((tool) => (
                <ToolCard
                  key={tool._id}
                  tool={tool}
                  onClick={handleToolClick}
                />
              ))
          }
        </div>
        </>}
        {isLoading &&
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
          </div>
        }
      </main>

    </div>
  )
} 