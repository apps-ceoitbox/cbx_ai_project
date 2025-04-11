"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar, Users, Target, Heart } from "lucide-react"

const tools = [
  {
    id: "business-plan",
    title: "Business Plan Generator",
    description: "Create a comprehensive business plan for your company",
    icon: FileText,
  },
  {
    id: "weekly-schedule",
    title: "Weekly Schedule Creator",
    description: "Organize your week with an AI-generated schedule",
    icon: Calendar,
  },
  {
    id: "lead-nurturing",
    title: "Lead Nurturing Creator",
    description: "Develop strategies to nurture and convert leads",
    icon: Users,
  },
  {
    id: "purpose-master",
    title: "Purpose Master",
    description: "Define and refine your business purpose and mission",
    icon: Target,
  },
  {
    id: "core-values",
    title: "Core Values Generator",
    description: "Identify and articulate your organization's core values",
    icon: Heart,
  },
]

export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      nav("/login")
    }
  }, [isAuthenticated, nav])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleToolClick = (toolId: string) => {
    nav(`/tools/${toolId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">{user.name}</div>
              <div className="text-gray-300">{user.company}</div>
            </div>
            <Button variant="outline" className="text-black border-white hover:bg-primary-red" onClick={() => logout()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.name}</h1>
        <p className="text-gray-600 mb-8">Select a tool to get started</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary-red"
              onClick={() => handleToolClick(tool.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary-red text-white">
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{tool.description}</CardDescription>
                {/* {tool?.promptName && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Prompt:</span> {tool?.promptName}
                  </div>
                )} */}
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
