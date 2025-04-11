"use client"

import { useState, useEffect } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Mail, FileText, Loader2 } from "lucide-react"
import { toolsData } from "@/lib/tools"
import { useToast } from "@/components/ui/use-toast"
import { useData } from "@/context/AppContext"

// Sample report data
const generateSampleReport = (toolId: string) => {
  switch (toolId) {
    case "business-plan":
      return {
        title: "Business Plan",
        sections: [
          {
            title: "Executive Summary",
            content:
              "This business plan outlines the strategy and roadmap for growth and success. The company aims to provide innovative solutions in the technology sector, targeting small to medium-sized businesses.",
          },
          {
            title: "Company Description",
            content:
              "The company is a technology solutions provider focused on delivering high-quality software and services to help businesses streamline their operations and increase efficiency.",
          },
          {
            title: "Market Analysis",
            content:
              "The target market consists of small to medium-sized businesses in need of technology solutions. The market is growing at a rate of 15% annually, with increasing demand for digital transformation services.",
          },
          {
            title: "Organization & Management",
            content:
              "The company is led by an experienced management team with expertise in technology, business development, and customer service. The organizational structure is designed to be agile and responsive to market changes.",
          },
          {
            title: "Financial Projections",
            content:
              "Based on market analysis and growth projections, the company is expected to achieve profitability within 18 months. Revenue is projected to grow by 25% year-over-year for the first three years.",
          },
        ],
      }
    case "weekly-schedule":
      return {
        title: "Weekly Schedule",
        sections: [
          {
            title: "Monday",
            content:
              "8:00 AM - 10:00 AM: Deep work session\n10:30 AM - 12:00 PM: Team meeting\n1:00 PM - 3:00 PM: Client calls\n3:30 PM - 5:00 PM: Project planning",
          },
          {
            title: "Tuesday",
            content:
              "8:00 AM - 11:00 AM: Deep work session\n11:30 AM - 12:30 PM: Department meeting\n1:30 PM - 4:00 PM: Product development\n4:00 PM - 5:00 PM: Email and administrative tasks",
          },
          {
            title: "Wednesday",
            content:
              "8:00 AM - 9:00 AM: Weekly review\n9:30 AM - 12:00 PM: Client meetings\n1:00 PM - 3:00 PM: Deep work session\n3:30 PM - 5:00 PM: Team collaboration",
          },
          {
            title: "Thursday",
            content:
              "8:00 AM - 10:00 AM: Strategic planning\n10:30 AM - 12:00 PM: Team check-in\n1:00 PM - 4:00 PM: Deep work session\n4:00 PM - 5:00 PM: Progress review",
          },
          {
            title: "Friday",
            content:
              "8:00 AM - 10:00 AM: Client follow-ups\n10:30 AM - 12:00 PM: Team meeting\n1:00 PM - 3:00 PM: Project wrap-up\n3:30 PM - 5:00 PM: Weekly reflection and planning",
          },
        ],
      }
    default:
      return {
        title: toolsData[toolId]?.title || "Report",
        sections: [
          {
            title: "Section 1",
            content:
              "This is a sample report generated based on your inputs. The actual report would contain detailed information and analysis tailored to your specific needs and requirements.",
          },
          {
            title: "Section 2",
            content:
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.",
          },
          {
            title: "Section 3",
            content:
              "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          },
        ],
      }
  }
}

export default function ReportPage() {
  const nav = useNavigate()
  const params = useParams()
  const { userAuth, generateResponse } = useData()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [report, setReport] = useState<any>(null)

  const toolId = params.toolId as string
  const tool = toolsData[toolId]

  useEffect(() => {
    // Simulate API call to get report
    const timer = setTimeout(() => {
      setReport(generateResponse)
      // setReport(generateSampleReport(toolId))
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [userAuth?.user, tool, toolId, nav])

  const handleDownloadPDF = () => {
    // Simulate PDF download
    toast({
      title: "PDF Downloaded",
      description: "Your report has been downloaded as a PDF file.",
    })
  }

  const handleDownloadDOCX = () => {
    // Simulate DOCX download
    toast({
      title: "DOCX Downloaded",
      description: "Your report has been downloaded as a DOCX file.",
    })
  }

  const handleSendEmail = () => {
    // Simulate sending email
    toast({
      title: "Email Sent",
      description: `Your report has been sent to ${userAuth?.user?.email}`,
    })
  }

  if (!userAuth?.user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="font-medium">{userAuth?.user?.name}</div>
              <div className="text-gray-300">{userAuth?.user?.company}</div>
            </div>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-primary-red"
              onClick={() => nav("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Button variant="ghost" className="mr-4" onClick={() => nav("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">{tool ? tool.title : "Report"} Results</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-16 w-16 text-primary-red animate-spin mb-4" />
            <p className="text-lg">Generating your report...</p>
          </div>
        ) : report ? (
          <div className="w-full max-w-4xl mx-auto" >
            <Card className="mb-6 border-2">
              <CardHeader className="bg-primary-red text-white rounded-t-lg">
                <CardTitle className="text-2xl">{report.title}</CardTitle>
                <CardDescription className="text-gray-100">
                  Generated on {new Date().toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                {report.sections.map((section: any, index: number) => (
                  <div key={index} className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                    <p className="whitespace-pre-line">{section.content}</p>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" className="flex items-center" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex items-center" onClick={handleDownloadDOCX}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export DOCX
                </Button>
                <Button className="bg-primary-red hover:bg-red-700 flex items-center" onClick={handleSendEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send to Email
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg">No report found. Please try again.</p>
            <Button className="mt-4 bg-primary-red hover:bg-red-700" onClick={() => nav("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
