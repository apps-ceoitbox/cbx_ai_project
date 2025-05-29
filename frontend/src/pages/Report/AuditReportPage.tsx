
import { useState, useEffect } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Mail, Loader2, CheckCircle, LogOut } from "lucide-react";
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



export default function AuditReportPage() {
  const nav = useNavigate();
  const params = useParams();
  const { auditAuth, auditClientResponse, setUserAuth, setAdminAuth, setAuditAuth, submissionID } = useData();
  const axios = useAxios("audit");
  const toolId = params.toolId as string;
  const [tool, setTool] = useState<PromptInterface | null>(null)
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSuccessOpen, setEmailSuccessOpen] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");



  useEffect(() => {
    const fetchTool = async () => {
      const response = await axios.get(`/prompt/${toolId}`);
      setTool(response?.data?.data);
    }
    fetchTool()
  }, [toolId])


  // const handleDownloadPDF = () => {
  //   const reportElement = document.getElementById('audit-response')
  //   if (!reportElement) {
  //     toast.error("Could not generate PDF. Please try again.")
  //     return
  //   }

  //   const svgElements = reportElement.querySelectorAll('svg');
  //   svgElements.forEach(svg => {
  //     svg.style.setProperty('height', '100%', 'important');
  //     svg.style.setProperty('width', '100%', 'important');
  //   });


  //   // Configure PDF options
  //   const options = {
  //     margin: [5, 5, 5, 5],
  //     filename: `${tool?.heading || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { scale: 2, useCORS: true },
  //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  //     pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  //   }

  //   // Generate and download PDF
  //   html2pdf()
  //     .set(options)
  //     .from(reportElement)
  //     .save()
  //     .then(() => {
  //       toast.success("PDF Downloaded")
  //     })
  //     .catch(error => {
  //       console.error("PDF generation error:", error)
  //       toast.error("Failed to download PDF. Please try again.")
  //     })
  // }

  const handleDownloadPDF = () => {
    const reportElement = document.getElementById('audit-response')

    if (!reportElement) {
      toast.error("Could not generate PDF. Please try again.")
      return
    }

    // Optimize SVG elements for PDF
    const svgElements = reportElement.querySelectorAll('svg');
    svgElements.forEach(svg => {
      svg.style.setProperty('height', '100%', 'important');
      svg.style.setProperty('width', '100%', 'important');
    });

    // Add CSS classes to prevent breaking
    const addPageBreakStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
              .pdf-no-break {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }
              .pdf-page-break-before {
                page-break-before: always !important;
                break-before: page !important;
              }
              .pdf-page-break-after {
                page-break-after: always !important;
                break-after: page !important;
              }
            `;
      document.head.appendChild(style);
      return style;
    };

    const styleElement = addPageBreakStyles();

    // Configure PDF options with better page handling
    const options = {
      margin: [5, 5, 5, 5], // Reduced margins for less white space
      filename: `${tool?.heading || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: {
        type: 'jpeg',
        quality: 0.95 // Slightly reduced for better performance
      },
      html2canvas: {
        scale: 1.5, // Reduced scale for better performance and less memory usage
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        letterRendering: true,
        logging: false,
        height: null, // Let it calculate automatically
        width: null   // Let it calculate automatically
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.pdf-page-break-before',
        after: '.pdf-page-break-after',
        avoid: '.pdf-no-break'
      }
    }

    // Generate and download PDF
    html2pdf()
      .set(options)
      .from(reportElement)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        // Optional: Add custom page numbering or headers/footers here
        const totalPages = pdf.internal.getNumberOfPages();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          // Remove any extra margins or spacing
          pdf.setFontSize(8);
          // Optional: Add page numbers
          // pdf.text(`Page ${i} of ${totalPages}`, 200, 290);
        }

        return pdf;
      })
      .save()
      .then(() => {
        toast.success("PDF Downloaded Successfully")
        // Clean up added styles
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      })
      .catch(error => {
        console.error("PDF generation error:", error)
        toast.error("Failed to download PDF. Please try again.")
        // Clean up added styles on error too
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      })
  }

  const handleSendEmail = async () => {
    setIsEmailSending(true);
    try {
      const reportElement = document.getElementById('audit-response')

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
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      }

      const worker = html2pdf().set(options).from(reportElement);

      // Get PDF as base64
      const blob = await worker.outputPdf("blob");
      const pdfFile = new File([blob], 'report.pdf', { type: 'application/pdf' });
      let base64PDF = await fileToBase64(pdfFile)

      await axios.post("/users/email", {
        to: auditAuth.user?.email,
        subject: tool?.heading || "Report" || "",
        body: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
            <p>Dear ${auditAuth?.user?.userName},</p>
            <p>Please find enclosed the ${tool?.heading} Plan as requested by you.</p>
          </body>
        </html>`,
        attachment: base64PDF
      })

      // Save the email for displaying in success popup
      setSentToEmail(auditAuth?.user?.email);

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


  if (!auditAuth?.user) {
    return <Navigate to="/audit-login" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white p-4 shadow-md px-10">
        <div className=" mx-auto flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex items-center gap-4">

            <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
              onClick={() => {
                localStorage.removeItem("userToken")
                localStorage.removeItem("adminToken")
                localStorage.removeItem("auditToken")
                setUserAuth(p => ({ ...p, user: null, token: null }))
                setAdminAuth(p => ({ ...p, user: null, token: null }))
                setAuditAuth(p => ({ ...p, user: null, token: null }))
                toast.success("Logout successful")
                nav("/login")
              }}>
              <LogOut className="w-5 h-5" />
              Logout
            </Button>

          </div>
        </div>
      </header>

      <main className="mx-auto py-8 px-10">
        <div className="flex items-center justify-between mb-8">
          <Button style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
            className="mr-4 bg-primary-red  hover:bg-red-700 transition-colors duration-200" variant="ghost" onClick={() => nav("/audit-login")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 style={{ minWidth: "100px" }} className="text-2xl font-bold">{tool ? tool.heading : "Report"} Results</h1>
          <div style={{ minWidth: "100px" }} ></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-5">
          <div>
            {auditClientResponse ? (
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

                  <CardContent dangerouslySetInnerHTML={{ __html: auditClientResponse }} id="audit-response" className="pt-6" />

                  <CardFooter className="flex flex-wrap gap-4 justify-center">
                    <Button variant="outline" className="flex items-center" onClick={handleDownloadPDF}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>

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
          </div>
        </div>

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

