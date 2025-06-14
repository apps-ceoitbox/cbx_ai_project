import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import Header from "./Header";
import { ArrowRight, Sparkles, Search, FileText, } from "lucide-react";

interface AgentCategory {
  id: string;
  title: string;
  icon: any;
  gradient: string;
  color: string;
  description: string;
  bgImage?: string;
}

const agentCategories: AgentCategory[] = [
  {
    id: "zoomary",
    title: "AI Zoom Summary",
    icon: <Sparkles />,
    gradient: "bg-gradient-to-br from-red-500 to-red-800",
    color: "bg-red-600",
    description: "Enter a Zoom recording URL to generate a detailed meeting summary.",
    bgImage: "url('https://t4.ftcdn.net/jpg/03/44/90/71/240_F_344907190_hpw23uwfISWQWCxxhvt0wuO3t86RHOSo.jpg')"
  },
  {
    id: "hr",
    title: "Company Profile",
    icon: <Search />,
    gradient: "bg-gradient-to-br from-red-700 to-blue-900",
    color: "bg-red-600",
    description: "Extracts and researches company details from Gmail.",
    bgImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')"
  },
  {
    id: "resume",
    title: "AI Resume Analyzer",
    icon: <FileText />,
    gradient: "bg-gradient-to-br from-red-700 to-blue-900",
    color: "bg-red-600",
    description: "Upload multiple resumes and job descriptions to rank candidates.",
    bgImage: "url('https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070')"
  },
  // {
  //   id: "attendance",
  //   title: "Attendance Monitor",
  //   icon: "📊",
  //   gradient: "bg-gradient-to-br from-red-600 to-red-900",
  //   color: "bg-red-600",
  //   description: "Detect anomalies in attendance patterns using AI.",
  //   bgImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070')"
  // },
  // {
  //   id: "mail",
  //   title: "AI Mail Sender",
  //   icon: "✉️",
  //   gradient: "bg-gradient-to-br from-red-500 to-red-700",
  //   color: "bg-red-600",
  //   description: "Smart email automation with AI-generated content.",
  //   bgImage: "url('https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=1974')"
  // }
];

const AIAgentsPage = () => {
  const { categoryId } = useParams();

  // If a specific category is selected, show only that category's agents
  if (categoryId) {
    // For "zoomary" and "hr" categories, we have implemented pages
    if (categoryId === "zoomary") {
      // This is handled by the router directly through the Zoomary component
      return null;
    }

    if (categoryId === "hr") {
      // This is handled by the router directly through the CompanyProfile component
      return null;
    }

    // For all other categories, show the coming soon message
    return (
      <>
        <Header />
        <div className="container py-8">
          <div className="flex items-center mb-8">
            <Link to="/ai-agents">
              <Button variant="outline" className="mr-4 border-gray-300 hover:border-red-600 hover:text-red-600">← Back</Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              {categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} AI Agents
            </h1>
          </div>

          <div className="p-8 bg-gray-100 rounded-lg border border-gray-200 hover:border-red-400 transition-all duration-300">
            <p className="text-lg text-center text-gray-700">
              Coming soon: AI agents for {categoryId}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Otherwise show all categories
  return (
    <>
      <Header />
      <div className="container py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900 pb-1 inline-block">AI Agents</span>
        </h1>
        <p className="text-gray-600 mb-8">Advanced AI systems designed to assist with multiple tasks and workflows efficiently.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agentCategories.map((category) => (
            <Link to={category.id === "zoomary" ? `/ai-agents/zoomary` : `/ai-agents/${category.id}`} className="block">
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-lg border-2 transition-all duration-300 hover:shadow-xl hover:border-red-600 hover:translate-y-[-8px] border-gray-200 bg-white"
                style={{
                  height: '220px',
                  backgroundImage: category.bgImage,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Semi-transparent overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40 z-10"></div>

                {/* Content Area */}
                <div className="relative h-full flex flex-col justify-between z-20 p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="bg-red-500 p-3 rounded-full flex items-center justify-center text-white text-2xl shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-red-100 transition-colors duration-300">{category.title}</h3>
                  </div>

                  <p className="text-white/80 text-sm mt-3">{category.description}</p>

                  <div className="mt-auto space-y-2">
                    {/* History buttons removed as requested */}

                    <Link to={category.id === "zoomary" ? `/ai-agents/zoomary` : `/ai-agents/${category.id}`} className="block">
                      <Button
                        variant="outline"
                        className="w-full py-2 rounded-md text-center font-medium transition-all duration-300 group-hover:bg-red-600 group-hover:text-white bg-white/90 text-red-600 border-0"
                      >
                        <span>Try {category.title}</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default AIAgentsPage;