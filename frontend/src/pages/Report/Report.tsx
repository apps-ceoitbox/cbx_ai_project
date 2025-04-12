
import { useState, useEffect } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Mail, FileText, Loader2 } from "lucide-react"
import { toolsData } from "@/lib/tools"
import { useData } from "@/context/AppContext"
import html2pdf from 'html2pdf.js'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx"
import { saveAs } from "file-saver"
import { toast } from "sonner"

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
  const nav = useNavigate();
  const params = useParams();
  const { userAuth, generateResponse } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

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

    // Get the report content element
    const reportElement = document.getElementById('report-content')

    if (!reportElement) {
      toast.error("Could not generate PDF. Please try again.")
      return
    }

    // Configure PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `${tool?.title || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    // Generate and download PDF
    html2pdf()
      .set(options)
      .from(reportElement)
      .save()
      .then(() => {
        toast.success("PDF Downloaded")
      })
      .catch(error => {
        console.error("PDF generation error:", error)
        toast.error("Failed to download PDF. Please try again.")
      })
  }

  const handleDownloadDOCX = () => {
    if (!report) {
      toast.error("No report data available.")
      return
    }

    try {
      // Create a new Document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: report.title,
              heading: HeadingLevel.TITLE,
              thematicBreak: true,
            }),
            new Paragraph({
              text: `Generated on ${new Date().toLocaleDateString()}`,
              style: "Normal",
            }),
          ]
        }]
      })

      // Create an array to hold all section paragraphs
      const sectionParagraphs = []

      // Add each section as paragraphs
      report.sections.forEach(section => {
        // Strip markdown bold syntax from strings for DOCX
        const title = section.title.replace(/\*\*/g, '')
        const content = section.content.replace(/\*\*/g, '')

        sectionParagraphs.push(
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 400,
              after: 200,
            },
          })
        )

        sectionParagraphs.push(
          new Paragraph({
            text: content,
            style: "Normal",
          })
        )
      })

      // Add a new section with all content
      doc.addSection({
        children: sectionParagraphs
      })

      // Generate and download DOCX
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${tool?.title || 'Report'}_${new Date().toISOString().split('T')[0]}.docx`)
        toast.success("DOCX Downloaded")
      }).catch(error => {
        console.error("DOCX generation error:", error)
        toast.error("Failed to export DOCX. Please try again.")

      })
    } catch (error) {
      console.error("DOCX generation error:", error)
      toast.error("Failed to create DOCX. Please try again.")

    }
  }


  const handleSendEmail = () => {
    toast.success(`Your report has been sent to ${userAuth?.user?.email}`)
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
              className="text-black border-white hover:bg-primary-red hover:text-white"
              onClick={() => nav("/dashboard")}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <Button style={{ minWidth: "100px" }} variant="ghost" className="mr-4" onClick={() => nav("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 style={{ minWidth: "100px" }} className="text-2xl font-bold">{tool ? tool.title : "Report"} Results</h1>
          <div style={{ minWidth: "100px" }} ></div>
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

              <CardContent id="report-content" className="pt-6">
                {report?.sections?.map((section: any, index: number) => (
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
