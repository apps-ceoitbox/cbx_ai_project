
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';


type Question = {
  question: string;
  options: string[];
  isCollapsed?: boolean;
};

type AddPromptsDialogBoxProps = {
  formData: Record<string, any>
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (p: { promptContent: string, questions: Question[] }) => void;
};


const AddPromptsDialogBox: React.FC<AddPromptsDialogBoxProps> = ({ formData, open, setOpen, onSubmit }) => {
  const [promptContent, setPromptContent] = useState(formData?.promptContent || '');
  const [questions, setQuestions] = useState(formData?.questions || [
    { question: '', options: ['', '', '', ''], isCollapsed: false }
  ]);

  const addQuestion = () => {
    if (questions.length < 15) {
      setQuestions([...questions, { question: '', options: ['', '', '', ''], isCollapsed: false }]);
    }
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const updateQuestion = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const toggleCollapse = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].isCollapsed = !updatedQuestions[index].isCollapsed;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = () => {
    // Format all data including prompt and questions
    const formData: { promptContent: string, questions: Question[] } = {
      promptContent,
      questions: questions.filter(q => q.question.trim() !== '').map(q => ({
        question: q.question,
        options: q.options.filter(opt => opt.trim() !== '')
      }))
    };

    console.log(formData?.promptContent)

    if (onSubmit) {
      onSubmit(formData);
    }
    toast.success("Prompt Updated")
    setOpen(false);
  };

  useEffect(() => {
    setPromptContent(formData?.promptContent || "")
    setQuestions(formData?.questions || [])
  }, [formData])

  return (
    <div >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="text-white border-white bg-red-500 hover:bg-red-600 hover:text-white flex items-center gap-2"
          >
            <Plus size={16} />
            Add Details
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Prompt</DialogTitle>
            <DialogDescription>
              Create a new prompt template with questions to use in your conversations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="promptContent">Prompt Content</Label>
              <Textarea
                id="promptContent"
                placeholder="Enter your prompt here..."
                className="h-32"
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <DialogHeader className="mb-4">
              <div className="flex justify-between items-center">
                <DialogTitle>Questions ({(questions || [])?.length}/15)</DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                  disabled={(questions || []).length >= 15}
                  className="flex items-center gap-1"
                >
                  <Plus size={16} /> Add Question
                </Button>
              </div>
              <DialogDescription>
                Add up to 15 questions with a maximum of 4 options each.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border rounded-md bg-gray-50 overflow-hidden">
                  <div
                    className="flex justify-between items-center px-4 py-3 bg-gray-100 cursor-pointer"
                    onClick={() => toggleCollapse(qIndex)}
                  >
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded-full hover:bg-gray-200">
                        {question.isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>
                      <h4 className="font-medium">
                        Question {qIndex + 1}
                        {question.question && <span className="ml-2 text-gray-500 text-sm truncate max-w-xs">
                          - {question.question}
                        </span>}
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(qIndex);
                      }}
                      className="text-red-500 hover:text-red-700 p-1 h-auto"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {!question.isCollapsed && (
                    <div className="p-4 space-y-4">
                      <div>
                        <Label htmlFor={`question-${qIndex}`}>Question Text</Label>
                        <Input
                          id={`question-${qIndex}`}
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, e.target.value)}
                          placeholder="Enter your question here"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Options (4 max)</Label>
                        <div className="grid gap-2 mt-1">
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <span className="text-sm font-medium w-6">{oIndex + 1}.</span>
                              <Input
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                placeholder={`Option ${oIndex + 1}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={handleSubmit}
            >
              {formData?.promptContent ? "Update Prompt" : "Save Prompt"}

            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddPromptsDialogBox;

