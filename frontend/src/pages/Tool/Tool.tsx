"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { type Question, toolsData } from "@/lib/tools"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function ToolQuestionsPage() {
  const nav = useNavigate()
  const params = useParams()
  const { isAuthenticated, user } = useAuth()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const toolId = params.toolId as string
  const tool = toolsData[toolId]

  useEffect(() => {
    if (!isAuthenticated) {
      nav("/login")
    }

    if (!tool) {
      nav("/dashboard")
    }
  }, [isAuthenticated, tool, nav])

  if (!isAuthenticated || !user || !tool) {
    return null
  }

  const currentQuestion = tool.questions[currentQuestionIndex]

  const handleNext = () => {
    const questionId = currentQuestion.id

    // Validate current question
    if (currentQuestion.required && !answers[questionId]) {
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

  const handleSubmit = () => {
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setShowConfirmation(true)

      // Redirect to report page after 2 seconds
      setTimeout(() => {
        nav(`/reports/${toolId}`)
      }, 2000)
    }, 1500)
  }

  const renderQuestionInput = (question: Question) => {
    const questionId = question.id

    switch (question.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>{question.label}</Label>
            <Input
              id={questionId}
              value={answers[questionId] || ""}
              onChange={(e) => handleChange(questionId, e.target.value)}
              className={errors[questionId] ? "border-red-500" : ""}
            />
            {errors[questionId] && <p className="text-red-500 text-sm">{errors[questionId]}</p>}
          </div>
        )

      case "dropdown":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>{question.label}</Label>
            <Select value={answers[questionId] || ""} onValueChange={(value) => handleChange(questionId, value)}>
              <SelectTrigger id={questionId} className={errors[questionId] ? "border-red-500" : ""}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[questionId] && <p className="text-red-500 text-sm">{errors[questionId]}</p>}
          </div>
        )

      case "date":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>{question.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={questionId}
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !answers[questionId] && "text-muted-foreground",
                    errors[questionId] && "border-red-500",
                  )}
                >
                  {answers[questionId] ? format(new Date(answers[questionId]), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={answers[questionId] ? new Date(answers[questionId]) : undefined}
                  onSelect={(date) => handleChange(questionId, date ? date.toISOString() : "")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors[questionId] && <p className="text-red-500 text-sm">{errors[questionId]}</p>}
          </div>
        )

      case "radio":
        return (
          <div className="space-y-2">
            <Label htmlFor={questionId}>{question.label}</Label>
            <RadioGroup
              value={answers[questionId] || ""}
              onValueChange={(value) => handleChange(questionId, value)}
              className="flex flex-col space-y-1"
            >
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${questionId}-${option}`} />
                  <Label htmlFor={`${questionId}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {errors[questionId] && <p className="text-red-500 text-sm">{errors[questionId]}</p>}
          </div>
        )

      default:
        return null
    }
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
          <h1 className="text-2xl font-bold">{tool.title}</h1>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {tool.questions.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentQuestionIndex + 1) / tool.questions.length) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-red h-2 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / tool.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{currentQuestion.label}</CardTitle>
              <CardDescription>
                Question {currentQuestionIndex + 1} of {tool.questions.length}
              </CardDescription>
            </CardHeader>

            <CardContent>{renderQuestionInput(currentQuestion)}</CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button onClick={handleNext} className="bg-primary-red hover:bg-red-700">
                {currentQuestionIndex < tool.questions.length - 1 ? (
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
                  Your {tool.title.toLowerCase()} is being generated...
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
