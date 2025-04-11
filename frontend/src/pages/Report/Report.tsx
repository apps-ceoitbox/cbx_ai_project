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
function formatBoldText(text) {
  // Replace **bold** text with <strong>bold</strong>
  return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
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
            Back
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
                    <h3 className="text-xl font-semibold mb-2">{formatBoldText(section.title)}</h3>
                    <p className="whitespace-pre-line">{formatBoldText(section.content)}</p>
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
