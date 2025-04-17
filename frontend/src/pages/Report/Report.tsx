
import { useState, useEffect } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Mail, Loader2, CheckCircle, LayoutDashboard } from "lucide-react";
import { useAxios, useData } from "@/context/AppContext";
import html2pdf from 'html2pdf.js';
// import { Document, Packer, Paragraph, HeadingLevel } from "docx";
// import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PromptInterface } from "../Admin/Admin"


// Sample report data
export function formatBoldText(text) {
  return text
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // @ts-ignore
      const base64String = reader.result.split(',')[1]; // remove data:application/pdf;base64,
      resolve(base64String);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file); // Triggers the conversion
  });
};



export default function ReportPage() {
  const nav = useNavigate();
  const params = useParams();
  const { userAuth, generateResponse } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const axios = useAxios("user");
  const toolId = params.toolId as string
  const [tool, setTool] = useState<PromptInterface | null>(null)
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSuccessOpen, setEmailSuccessOpen] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  useEffect(() => {
    const fetchTool = async () => {
      const response = await axios.get(`/prompt/${toolId}`)
      console.log(response.data.data)
      setTool(response.data.data)
    }
    fetchTool()
  }, [toolId])
  console.log({ tool })
  useEffect(() => {
    const timer = setTimeout(() => {
      setReport(generateResponse)
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
      filename: `${tool?.heading || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
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

  // const handleDownloadDOCX = () => {
  //   if (!report) {
  //     toast.error("No report data available.")
  //     return
  //   }

  //   try {
  //     // Create a new Document
  //     const doc = new Document({
  //       sections: [{
  //         properties: {},
  //         children: [
  //           new Paragraph({
  //             text: report.title,
  //             heading: HeadingLevel.TITLE,
  //             thematicBreak: true,
  //           }),
  //           new Paragraph({
  //             text: `Generated on ${new Date().toLocaleDateString()}`,
  //             style: "Normal",
  //           }),
  //         ]
  //       }]
  //     })

  //     // Create an array to hold all section paragraphs
  //     const sectionParagraphs = []

  //     // Add each section as paragraphs
  //     report.sections.forEach(section => {
  //       // Strip markdown bold syntax from strings for DOCX
  //       const title = section.title.replace(/\*\*/g, '')
  //       const content = section.content.replace(/\*\*/g, '')

  //       sectionParagraphs.push(
  //         new Paragraph({
  //           text: title,
  //           heading: HeadingLevel.HEADING_2,
  //           spacing: {
  //             before: 400,
  //             after: 200,
  //           },
  //         })
  //       )

  //       sectionParagraphs.push(
  //         new Paragraph({
  //           text: content,
  //           style: "Normal",
  //         })
  //       )
  //     })

  //     // @ts-ignore
  //     doc.addSection({
  //       children: sectionParagraphs
  //     })

  //     // Generate and download DOCX
  //     Packer.toBlob(doc).then(blob => {
  //       saveAs(blob, `${tool?.heading || 'Report'}_${new Date().toISOString().split('T')[0]}.docx`)
  //       toast.success("DOCX Downloaded")
  //     }).catch(error => {
  //       console.error("DOCX generation error:", error)
  //       toast.error("Failed to export DOCX. Please try again.")

  //     })
  //   } catch (error) {
  //     console.error("DOCX generation error:", error)
  //     toast.error("Failed to create DOCX. Please try again.")

  //   }
  // }


  const handleSendEmail = async () => {
    setIsEmailSending(true);
    try {
      const reportElement = document.getElementById('report-content')

      if (!reportElement) {
        toast.error("Could not generate PDF. Please try again.")
        setIsEmailSending(false);
        return
      }

      // Configure PDF options
      const options = {
        margin: [10, 10, 10, 10],
        filename: `${tool?.heading || "Report"}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      const worker = html2pdf().set(options).from(reportElement);

      // Get PDF as base64
      const blob = await worker.outputPdf("blob");
      const pdfFile = new File([blob], 'report.pdf', { type: 'application/pdf' });
      let base64PDF = await fileToBase64(pdfFile)

      await axios.post("/users/email", {
        to: userAuth.user?.email,
        subject: tool?.heading || "Report" || "",
        body: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <p>Dear ${userAuth?.user?.userName}</p>
            <p>Please find enclosed the ${tool?.heading} Plan as requested by you.</p>
          </body>
        </html>`,
        attachment: base64PDF
      })

      // Save the email for displaying in success popup
      setSentToEmail(userAuth.user?.email);

      // Show success popup
      setEmailSuccessOpen(true);
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      // Set loading state back to false
      setIsEmailSending(false);
    }
  }


  if (!userAuth?.user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4 shadow-md px-10">
        <div className=" mx-auto flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">

            <Button
              variant="outline"
              className="text-black border-white hover:bg-primary-red hover:text-white"
              onClick={() => nav("/dashboard")}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Button>

          </div>
        </div>
      </header>

      <main className="mx-auto py-8 px-10">
        <div className="flex items-center justify-between mb-8">
          <Button style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
            className="mr-4 bg-primary-red  hover:bg-red-700 transition-colors duration-200" variant="ghost" onClick={() => nav("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 style={{ minWidth: "100px" }} className="text-2xl font-bold">{tool ? tool.heading : "Report"} Results</h1>
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
                <CardTitle className="text-2xl">{tool?.heading || "Report"}</CardTitle>
                <CardDescription className="text-gray-100">
                  Generated on{" "}
                  {new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </CardDescription>

              </CardHeader>

              <CardContent dangerouslySetInnerHTML={{ __html: report }} id="report-content" className="pt-6">

              </CardContent>

              <CardFooter className="flex flex-wrap gap-4 justify-center">
                <Button variant="outline" className="flex items-center" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                {/* <Button variant="outline" className="flex items-center" onClick={handleDownloadDOCX}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export DOCX
                </Button> */}

                <Button
                  className="bg-primary-red hover:bg-red-700 flex items-center"
                  onClick={handleSendEmail}
                  disabled={isEmailSending}
                >
                  {isEmailSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send to Email
                    </>
                  )}
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


      {/* Success Email Dialog */}
      <Dialog open={emailSuccessOpen} onOpenChange={setEmailSuccessOpen}>
        <DialogContent className="sm:max-w-md border-2 border-primary-red">
          <DialogHeader className="bg-primary-red text-white rounded-t-lg p-4 mt-3">
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-6 w-6 text-white mr-2" />
              Email Sent Successfully
            </DialogTitle>
            {/* <DialogDescription className="text-gray-100">
              Your report has been sent to:
            </DialogDescription> */}
          </DialogHeader>
          {/* <div className="py-6 bg-white">
            <p className="text-center font-medium text-black">{sentToEmail}</p>
          </div> */}
          <div className="py-6 bg-white">
            <p className="text-center font-medium text-black">
              We have emailed the plan on{" "}
              <span className="text-primary-red font-semibold">{sentToEmail}</span> ID
            </p>
          </div>
          <DialogFooter className="p-4 bg-white">
            <Button
              className="w-full bg-primary-red hover:bg-red-700 text-white"
              onClick={() => setEmailSuccessOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
