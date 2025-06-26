import { useState, useEffect } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Mail, Loader2, CheckCircle, LayoutDashboard, Copy } from "lucide-react";
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
import { ResultsDisplay } from "@/components/DocumentReader/ResultsDisplay";
import { Textarea } from "@/components/ui/textarea";


// Sample report data
export function formatBoldText(text) {
  return text
}

// const fileToBase64 = (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       // @ts-ignore
//       const base64String = reader.result.split(',')[1]; // remove data:application/pdf;base64,
//       resolve(base64String);
//     };

//     reader.onerror = reject;

//     reader.readAsDataURL(file); // Triggers the conversion
//   });
// };



export default function ReportPage() {
  const nav = useNavigate();
  const params = useParams();
  const { userAuth, generateResponse, submissionID, apiLink } = useData();
  const [isLoading, setIsLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const axios = useAxios("user");
  const toolId = params.toolId as string;
  const [tool, setTool] = useState<PromptInterface | null>(null)
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSuccessOpen, setEmailSuccessOpen] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  // Enhance prompt modal states
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  // const [showChatInput, setShowChatInput] = useState(false);
  // const [firstChatInputShown, setFirstChatInputShown] = useState(false);
  // const assistantMsgIndexRef = useRef(null);


  useEffect(() => {
    const fetchTool = async () => {
      const response = await axios.get(`/prompt/${toolId}`);
      setTool(response?.data?.data);
    }
    fetchTool()
  }, [toolId])

  useEffect(() => {
    const timer = setTimeout(() => {
      setReport(generateResponse)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [userAuth?.user, tool, toolId, nav])

  const handleDownloadPDF = () => {
    // Get the report content element
    const reportElement = document.getElementById('report-contents')
    if (!reportElement) {
      toast.error("Could not generate PDF. Please try again.")
      return
    }

    const svgElements = reportElement.querySelectorAll('svg');
    svgElements.forEach(svg => {
      svg.style.setProperty('height', '100%', 'important');
      svg.style.setProperty('width', '100%', 'important');
    });

    // Configure PDF options
    const options = {
      margin: [10, 10, 10, 10],
      filename: `${tool?.heading || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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

  const handleSendEmail = async () => {
    setIsEmailSending(true);
    try {
      const reportElement = document.getElementById('report-contents');

      if (!reportElement) {
        toast.error("Content not found. Please try again.");
        setIsEmailSending(false);
        return;
      }

      // const options = {
      //   margin: [10, 10, 10, 10],
      //   filename: `${tool?.heading || "Report"}_${new Date().toISOString().split('T')[0]}.pdf`,
      //   image: { type: 'jpeg', quality: 0.98 },
      //   html2canvas: { scale: 2, useCORS: true },
      //   jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      // }

      // const worker = html2pdf().set(options).from(reportElement);

      // Get PDF as base64
      // const blob = await worker.outputPdf("blob");
      // const pdfFile = new File([blob], 'report.pdf', { type: 'application/pdf' });
      // let base64PDF = await fileToBase64(pdfFile)

      // Extract styled HTML content from report

      const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
              font-family: 'Segoe UI', sans-serif;
              color: #333;
            }
            .email-container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 10px;
              padding: 32px;
            }
            h1 {
              color: #d32f2f;
              font-size: 24px;
              margin-bottom: 16px;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
            }
            .btn-container {
              margin-top: 32px;
              text-align: center;
            }
            .view-button {
              background-color: #d32f2f;
              color: #ffffff;
              text-decoration: none;
              padding: 14px 26px;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
              display: inline-block;
            }
            .view-button:hover {
              background-color: #b71c1c;
            }
        
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1>Your Report is Ready</h1>
            <p>Hi ${userAuth?.user?.userName},</p>
            <p>We've prepared your ${tool?.heading || 'requested'} report. You can view it by clicking the button below.</p>
            <div class="btn-container">
              <a href="https://ai.ceoitbox.com/view/${submissionID}" target="_blank" class="view-button" style="color: #ffffff">
                View Your Report
              </a>
            </div>
          </div>
        
        </body>
      </html>
    `;



      await axios.post("/users/email", {
        to: userAuth?.user?.email,
        subject: tool?.heading || "Report",
        body: fullHTML,
        // attachment: base64PDF
      });

      // Success
      setSentToEmail(userAuth?.user?.email);
      setEmailSuccessOpen(true);
    } catch (error) {
      console.error("Email sending error:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleCopyContent = async () => {
    const contentElement = document.getElementById("report-contents");
    if (!contentElement) {
      toast.error("Content not found");
      return;
    }

    const fullHTML = `
        <div style="background-color: #fff; padding: 24px; color: #2c3e50; font-family: 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6;">
          ${contentElement.innerHTML}
        </div>
      `;

    if (navigator.clipboard && window.ClipboardItem) {
      try {
        const blob = new Blob([fullHTML], { type: "text/html" });
        const clipboardItem = new ClipboardItem({ "text/html": blob });
        await navigator.clipboard.write([clipboardItem]);
        toast.success("Report copied to clipboard!");
      } catch (err) {
        console.error("Copy failed:", err);
        toast.error("Failed to copy.");
      }
    } else {
      toast.error("Clipboard API not supported.");
    }
  };

  // Chat follow-up handler
  const handleSendQuery = async () => {
    if (!currentQuery.trim()) return;
    const userMsg = { role: "user", content: currentQuery, timestamp: Date.now() };

    // Add user message first
    setChatMessages(prev => [...prev, userMsg]);
    setCurrentQuery("");
    // setShowChatInput(true);

    // Wait for state to update
    await new Promise(r => setTimeout(r, 0));

    // Add empty assistant message
    const assistantMsg = { role: "assistant", content: "", timestamp: Date.now() };
    setChatMessages(prev => [...prev, assistantMsg]);

    // Wait for state to update
    await new Promise(r => setTimeout(r, 0));

    setIsStreaming(true);
    try {
      // Get current messages for context (including the user message we just added)
      const currentMessages = chatMessages.concat([userMsg]);
      const messageContext = currentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch(`${apiLink}prompt/generate-with-context`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userAuth?.token}`,
        },
        body: JSON.stringify({
          toolId: toolId,
          context: messageContext,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";
      console.log(res)

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
        console.log({streamedContent})
        setChatMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (newMessages[lastIndex] && newMessages[lastIndex].role === "assistant") {
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              content: streamedContent,
            };
          }
          console.log("this is the newMessage", newMessages)
          return newMessages;
        });
        await new Promise(r => setTimeout(r, 0));
      }
      setIsStreaming(false);
    } catch (err) {
      toast.error("Failed to get response from AI");
      console.error("Error in chat:", err);
      setIsStreaming(false);
    }
  };

  // Enhance Prompt handler
  const handleEnhancePrompt = async () => {
    if (!currentQuery.trim()) return;
    setIsEnhancing(true);
    try {
      const res = await fetch(`${apiLink}prompt/enchance-prompt-with-context`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${userAuth?.token}`,
        },
        body: JSON.stringify({
          initialResponse: generateResponse,
          userPrompt: currentQuery,
        }),
      });
      const data = await res.json();
      if (data.success && data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
        setIsEnhanceModalOpen(true);
      } else {
        toast.error(data.message || "Failed to enhance prompt");
      }
    } catch (err) {
      toast.error("Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  console.log({chatMessages})

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
          <div className="w-full max-w-[90%] mx-auto" >
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

              <CardContent dangerouslySetInnerHTML={{ __html: cleanCodeFences(generateResponse) }}
                id="report-contents"
                className="pt-6" />

              <CardFooter className="flex flex-wrap gap-4 justify-center mt-6">
                <Button variant="outline" className="flex items-center" onClick={handleDownloadPDF} disabled={isStreaming}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center"
                  onClick={handleCopyContent}
                  disabled={isStreaming}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>

                {/* <Button variant="outline" className="flex items-center" onClick={handleDownloadDOCX}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export DOCX
                </Button> */}

                <Button
                  className="bg-primary-red hover:bg-red-700 flex items-center"
                  onClick={handleSendEmail}
                  disabled={isEmailSending || isStreaming}
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
            {/* Chat UI below the report */}
            <div className="mt-10 space-y-6">
              <h2 className="text-xl font-semibold text-appBlack mb-4">Ask Follow-up Questions</h2>
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.timestamp}
                    className={`w-full ${message.role === "user" ? "flex justify-end" : ""}`}
                  >
                    {message.role === "user" ? (
                      <div className="max-w-[80%] bg-appRed/10 rounded-lg p-4">
                        <p className="text-sm font-medium mb-1 text-appRed">You</p>
                        <p>{message.content}</p>
                      </div>
                    ) : (
                      <div className="max-w-[90%]">
                        <ResultsDisplay
                          results={{
                            processingOption: "report",
                            result: message.content,
                          }}
                          onReset={() => {}}
                          isStreaming={isStreaming}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Only allow one follow-up question */}
              <div className="sticky bottom-0 bg-white p-4 border-t">
                <div className="flex flex-col gap-2 max-w-5xl mx-auto">
                  <div className="flex justify-between">
                  <div className="mb-1 text-xs text-gray-700 font-medium">
                    {chatMessages.filter((m) => m.role === "user").length === 0
                      ? "1 follow-up allowed"
                      : "No more follow-ups allowed"}
                  </div>
                  {/* Enhance Prompt Button */}
                  <Button
                      type="button"
                      className="flex items-center mr-[70px] justify-center h-6 w-fit px-1 rounded border border-gray-300 bg-primary-red text-white transition-colors duration-150 focus:outline-none"
                      title="Enhance Prompt"
                      tabIndex={-1}
                      disabled={!currentQuery.trim() || chatMessages.filter((m) => m.role === "user").length >= 1 || isEnhancing}
                      onClick={handleEnhancePrompt}
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Enchance Prompt"
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2 relative items-center">
                    <textarea
                      value={currentQuery}
                      onChange={(e) => setCurrentQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendQuery()}
                      placeholder="Ask a follow-up question about your report..."
                      className="flex-1 p-2 border rounded pr-10 resize-none leading-tight min-h-[40px] max-h-[120px]"
                      rows={3}
                      style={{overflow: 'auto'}}
                      disabled={chatMessages.filter((m) => m.role === "user").length >= 1}
                    />
                    <Button
                      onClick={handleSendQuery}
                      className="bg-primary-red hover:bg-red-700 text-white"
                      disabled={!currentQuery.trim() || chatMessages.filter((m) => m.role === "user").length >= 1}
                    >
                      Send
                    </Button>
                  </div>
                  {chatMessages.filter((m) => m.role === "user").length >= 1 && (
                    <p className="text-xs text-primary-red mt-1">You have reached the maximum of 1 follow-up question.</p>
                  )}
                </div>
              </div>
            </div>
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
          </DialogHeader>
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

      {/* Enhance Prompt Dialog */}
      <Dialog open={isEnhanceModalOpen} onOpenChange={setIsEnhanceModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enhanced Prompt</DialogTitle>
          </DialogHeader>
          <Textarea
            id="enhanced-prompt"
            placeholder="Enhanced prompt will appear here"
            className="min-h-[150px] flex-1"
            value={enhancedPrompt || ""}
            onChange={(e) => setEnhancedPrompt(e.target.value)}
          />
          <DialogFooter>
            <Button
              onClick={() => {
                setCurrentQuery(enhancedPrompt);
                toast.success("Prompt Replaced!");
                setIsEnhanceModalOpen(false);
              }}
              className="bg-primary-red hover:bg-red-700 text-white"
            >
              Replace
            </Button>
            <Button variant="outline" onClick={() => setIsEnhanceModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



// function cleanCodeFences(markdownString) {
//   if (typeof markdownString !== 'string') return '';

//   return markdownString
//     .replace(/^\s*```(?:html)?\s*/i, '')
//     .replace(/\s*```\s*$/i, '')
//     .trim();
// }

function cleanCodeFences(htmlString: string): string {
  if (typeof htmlString !== 'string') return '';
  return htmlString
      .replace(/^\s*```(?:html)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
}
