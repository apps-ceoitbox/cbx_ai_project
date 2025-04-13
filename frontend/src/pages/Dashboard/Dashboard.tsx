import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"
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

export default function Dashboard() {
  const { userAuth, setUserAuth } = useData();
  const axios = useAxios("user");
  const nav = useNavigate();

  const [tools, setTools] = useState<PromptInterface[]>([])
  const [selectedCategory, setSelectedCategory] = useState(null);
  useEffect(() => {
    if (!userAuth.user) {
      nav("/login")
    }
  }, [userAuth, nav])

  if (!userAuth.user) {
    return null
  }

  const handleToolClick = (toolId: string) => {

    nav(`/tools/${toolId}`)
  }

  useEffect(() => {
    const fetchTools = async () => {
      const response = await axios.get("/prompt")
      setTools(response.data.data)
    }
    fetchTools()
  }, [])

  const filteredTools = tools?.filter(tool => tool.category == selectedCategory && tool.visibility)

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">{userAuth.user.name}</div>
              <div className="text-gray-300">{userAuth.user.company}</div>
            </div>

            <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
              onClick={() => {
                nav("/generated-plans")
              }}
            >
              Generated Plans
            </Button>
            <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white" onClick={() => {
              localStorage.removeItem("userToken")
              setUserAuth(p => ({ ...p, user: null, token: null }))
              nav("/login")
            }}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex  justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {userAuth.user.userName}</h1>
            <p className="text-gray-600 mb-8">Select a {selectedCategory ? "tool" : "category"} to get started</p>
          </div>
          {selectedCategory &&
            <Button onClick={() => setSelectedCategory(null)}
              style={{ minWidth: "100px" }} variant="ghost" className="mr-4" >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          }
        </div>


        {!selectedCategory && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateCategories.map((category) => (
            <Card
              key={category}
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary-red"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary-red text-white">
                    {categoryIcons[category] || <FileText className="h-6 w-6" />}
                  </div>
                  <CardTitle className="text-xl">{category}</CardTitle>
                </div>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setSelectedCategory(category)} variant="ghost" className="w-full text-primary-red hover:bg-red-50">
                  Start Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>}

        {selectedCategory && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {
            filteredTools.length === 0 ?
              <div className="w-full flex flex-col col-span-3 items-center justify-center text-gray-500 py-8 gap-2">
                <FolderX className="w-10 h-10 text-primary-red" />
                <div className="text-lg font-semibold">No tools found</div>
                <div className="text-sm text-center max-w-md">
                  It looks like there’s no tool data available in this category. Please select another or check back later.
                </div>
              </div>
              :

              tools.filter(tool => tool.category == selectedCategory && tool.visibility).map((tool) => (

                <Card
                  key={tool._id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary-red"
                  onClick={() => handleToolClick(tool._id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-primary-red text-white">
                        <FileText className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{tool.heading}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{tool.objective}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full text-primary-red hover:bg-red-50">
                      Start Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}


        </div>}
      </main>
    </div>
  )
}
