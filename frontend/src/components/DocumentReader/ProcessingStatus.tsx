
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader, Bot, BookOpen, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProcessingOptionType } from "./ProcessingOptions";

interface ProcessingStatusProps {
    status: "idle" | "processing" | "complete" | "error";
    progress: number;
    processingOption: ProcessingOptionType;
    onCancel: () => void;
    error?: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
    status,
    progress,
    processingOption,
    onCancel,
    error,
}) => {
    if (status === "idle") return null;

    // Different messages based on processing option
    const getProcessingMessage = () => {
        switch (processingOption) {
            case "summarize":
                return "Summarizing your document...";
            case "questions":
                return "Finding answers to your questions...";
            case "insights":
                return "Extracting insights from your document...";
            case "report":
                return "Generating your custom report...";
            default:
                return "Processing your document...";
        }
    };

    // Different icons based on status
    const StatusIcon = () => {
        switch (status) {
            case "processing":
                return <Loader className="h-8 w-8 animate-spin-slow" />;
            case "complete":
                return <FileCheck className="h-8 w-8 text-green-500" />;
            case "error":
                return <Bot className="h-8 w-8 text-appRed" />;
            default:
                return <BookOpen className="h-8 w-8" />;
        }
    };

    return (
        <Card className="border border-appGray-300 animate-fade-in">
            <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <StatusIcon />
                    <div>
                        <h3 className="font-semibold text-lg">
                            {status === "processing"
                                ? getProcessingMessage()
                                : status === "complete"
                                    ? "Processing complete!"
                                    : "Error processing document"}
                        </h3>
                        {status === "error" && <p className="text-appRed text-sm mt-1">{error}</p>}
                    </div>

                    {status === "processing" && (
                        <div className="w-full space-y-1">
                            <div className="flex justify-between text-xs text-appGray-500">
                                <span>Processing</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    )}
                </div>
            </CardContent>

            {status === "processing" && (
                <CardFooter className="flex justify-center pb-6">
                    <Button
                        variant="outline"
                        className="border-appRed text-appRed hover:bg-appRed hover:text-white"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};