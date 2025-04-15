
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DiscQuizProps {
  onComplete: (results: DiscResults) => void;
}

export interface DiscResults {
  d: number;
  i: number;
  s: number;
  c: number;
  dominantType: "D" | "I" | "S" | "C";
}

// Sample DISC questions
const questions = [
  {
    id: 1,
    question: "In a group setting, I tend to:",
    options: [
      { id: "d1", label: "Take charge and make decisions quickly", type: "d" },
      { id: "i1", label: "Engage and energize others", type: "i" },
      { id: "s1", label: "Listen carefully and support the team", type: "s" },
      { id: "c1", label: "Analyze all options before proceeding", type: "c" },
    ],
  },
  {
    id: 2,
    question: "When facing a challenge, I typically:",
    options: [
      { id: "d2", label: "Address it head-on with direct action", type: "d" },
      { id: "i2", label: "Look for creative solutions and involve others", type: "i" },
      { id: "s2", label: "Take a steady, patient approach", type: "s" },
      { id: "c2", label: "Thoroughly research and plan my approach", type: "c" },
    ],
  },
  {
    id: 3,
    question: "Others would likely describe me as:",
    options: [
      { id: "d3", label: "Confident, assertive, and results-oriented", type: "d" },
      { id: "i3", label: "Enthusiastic, expressive, and optimistic", type: "i" },
      { id: "s3", label: "Patient, reliable, and team-oriented", type: "s" },
      { id: "c3", label: "Precise, analytical, and detail-oriented", type: "c" },
    ],
  },
  {
    id: 4,
    question: "My ideal work environment is one that:",
    options: [
      { id: "d4", label: "Offers autonomy and opportunities to lead", type: "d" },
      { id: "i4", label: "Is social and collaborative with variety", type: "i" },
      { id: "s4", label: "Is stable and emphasizes teamwork", type: "s" },
      { id: "c4", label: "Is structured with clear expectations", type: "c" },
    ],
  },
  {
    id: 5,
    question: "When communicating, I prefer to:",
    options: [
      { id: "d5", label: "Be direct and get to the point quickly", type: "d" },
      { id: "i5", label: "Be animated and share stories", type: "i" },
      { id: "s5", label: "Be supportive and listen attentively", type: "s" },
      { id: "c5", label: "Be precise and focus on facts and details", type: "c" },
    ],
  },
];

export function DiscQuiz({ onComplete }: DiscQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);

  const handleNextQuestion = () => {
    if (currentAnswer) {
      const newAnswers = { ...answers, [currentQuestionIndex]: currentAnswer };
      setAnswers(newAnswers);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer(null);
      } else {
        // Calculate DISC results
        const results = calculateDiscResults(newAnswers);
        onComplete(results);
      }
    }
  };

  const calculateDiscResults = (answers: Record<number, string>): DiscResults => {
    // Initialize counters for each type
    const counts = { d: 0, i: 0, s: 0, c: 0 };

    // Count selected options by type
    Object.values(answers).forEach(answerId => {
      const questionIndex = parseInt(answerId.substring(1, 2)) - 1;
      const optionIndex = questions[questionIndex].options.findIndex(opt => opt.id === answerId);
      const type = questions[questionIndex].options[optionIndex].type;
      counts[type as keyof typeof counts] += 1;
    });

    // Determine dominant type
    let dominantType: "D" | "I" | "S" | "C" = "D";
    let maxScore = counts.d;

    if (counts.i > maxScore) {
      dominantType = "I";
      maxScore = counts.i;
    }
    if (counts.s > maxScore) {
      dominantType = "S";
      maxScore = counts.s;
    }
    if (counts.c > maxScore) {
      dominantType = "C";
      maxScore = counts.c;
    }

    return {
      d: counts.d,
      i: counts.i,
      s: counts.s,
      c: counts.c,
      dominantType
    };
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Personality Assessment</h2>
        <p className="text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <Progress value={progress} className="mt-4 h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border border-border shadow-sm">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-4">{currentQuestion.question}</h3>

              <RadioGroup
                value={currentAnswer || ""}
                onValueChange={setCurrentAnswer}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-2 rounded-md border p-3 transition-colors ${currentAnswer === option.id
                      ? "border-brand-red bg-primary/5"
                      : "hover:bg-muted/50"
                      }`}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="text-brand-red"
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>

            <CardFooter className="border-t p-4 flex justify-end">
              <Button
                onClick={handleNextQuestion}
                disabled={!currentAnswer}
                className="bg-brand-red hover:bg-opacity-90"
              >
                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Assessment"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
