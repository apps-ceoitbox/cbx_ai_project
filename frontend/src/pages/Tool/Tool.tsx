import { useState, useEffect } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useAxios, useData } from "@/context/AppContext"
import { PromptInterface } from "../Admin/Admin"
import Header from "../Dashboard/Header"
import { Textarea } from "@/components/ui/textarea"

export default function ToolQuestionsPage() {
  const axios = useAxios("user");
  const nav = useNavigate();
  const params = useParams();
  const { userAuth, setGenerateResponse, apiLink } = useData();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const toolId = params.toolId as string
  const [tool, setTool] = useState<PromptInterface | null>(null)

  useEffect(() => {
    const fetchTool = async () => {
      const response = await axios.get(`/prompt/${toolId}`)
      setTool(response.data.data)
    }
    fetchTool()
  }, [toolId])

  const currentQuestion = tool?.questions[currentQuestionIndex]

  const handleNext = () => {
    const questionId = currentQuestion

    // Validate current question
    if (!answers[questionId]) {
      setErrors({ [questionId]: "This field is required" })
      return
    }

    if (currentQuestionIndex < tool.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Submit form
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))

    // Clear error when user answers
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[questionId]
        return newErrors
      })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const res = await fetch(`${apiLink}prompt/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${userAuth?.token}` // Add the token here
      },
      body: JSON.stringify({
        questions: answers,
        toolId: toolId
      }),
    });
    setGenerateResponse("")
    setIsSubmitting(false)
    setShowConfirmation(true)
    nav(`/reports/${toolId}`)

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value, { stream: true });
      setGenerateResponse(p => p + chunk)
      console.log(chunk)
    }

    // axios.post(`/prompt/generate`, {
    //   questions: answers,
    //   toolId: toolId
    // }).then((res) => {
    //   setGenerateResponse(res.data.data)
    //   setIsSubmitting(false)
    //   setShowConfirmation(true)
    //   nav(`/reports/${toolId}`)
    //   console.log(res.data.data)
    // })
  }

  if (!userAuth.user) {
    return <Navigate to="/login" />
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 mx-auto py-8">
        {/* <div className="flex items-center justify-between mb-8" >
          <Button
            style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
            className=" bg-primary-red  hover:bg-red-700 transition-colors duration-200"
            variant="ghost" onClick={() => nav("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 style={{ minWidth: "100px" }} className="text-2xl font-bold">{tool?.heading}</h1>
          <div style={{ minWidth: "100px" }}></div>
        </div> */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <Button
            style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
            className="bg-primary-red hover:bg-red-700 transition-colors duration-200"
            variant="ghost"
            onClick={() => nav("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left min-w-[100px]">
            {tool?.heading}
          </h1>

          <div className="min-w-[100px] h-0 sm:h-auto" />
        </div>

        <div className="w-full max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {tool?.questions.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentQuestionIndex + 1) / tool?.questions.length) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-red h-2 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / tool?.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{currentQuestion}</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {tool?.questions.length}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={currentQuestion}>{currentQuestion}</Label>
                <Textarea
                  id={currentQuestion}
                  value={answers[currentQuestion] || ""}
                  onChange={(e) => handleChange(currentQuestion, e.target.value)}
                  className={errors[currentQuestion] ? "border-red-500" : ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.shiftKey === false) {
                      e.preventDefault()
                      handleNext()
                    }
                  }}
                />
                {errors[currentQuestion] && <p className="text-red-500 text-sm">{errors[currentQuestion]}</p>}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button onClick={handleNext} className="bg-primary-red hover:bg-red-700">
                {currentQuestionIndex < tool?.questions?.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Confirmation modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Thank you!</CardTitle>
                <CardDescription className="text-lg">
                  Your {tool.heading.toLowerCase()} is being generated...
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <Loader2 className="h-16 w-16 text-primary-red animate-spin" />
          </div>
        )}
      </main>
    </div>
  )
}

