import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useAxios, useData } from "@/context/AppContext"



export interface PromptInterface {
  _id: string;
  heading: string;
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
        <h1 className="text-3xl font-bold mb-2">Welcome, {userAuth.user.userName}</h1>
        <p className="text-gray-600 mb-8">Select a tool to get started</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
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
        </div>
      </main>
    </div>
  )
}
