


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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
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


const AddDoucmentReaderPromt: React.FC<AddPromptsDialogBoxProps> = ({ formData, open, setOpen, onSubmit }) => {
    const [promptContent, setPromptContent] = useState(formData?.promptContent || '');
    const [questions, setQuestions] = useState(formData?.questions || [
        { question: '', options: ['', '', '', ''], isCollapsed: false }
    ]);


    const handleSubmit = () => {
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
                        Add Prompt
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add New Prompt</DialogTitle>
                        <DialogDescription>
                            Create a new prompt template to use in your conversations.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="promptContent">Prompt Content</Label>
                            <Textarea
                                id="promptContent"
                                placeholder="Enter your prompt here..."
                                className="h-36"
                                value={promptContent}
                                onChange={(e) => setPromptContent(e.target.value)}
                            />
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

export default AddDoucmentReaderPromt;

