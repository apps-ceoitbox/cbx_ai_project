
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProcessingOptionType } from "./ProcessingOptions";

interface CustomizationFormProps {
    processingOption: ProcessingOptionType;
    disabled: boolean;
    onDocumentTypeChange: (value: string) => void;
    onGoalChange: (value: string) => void;
    documentType: string;
    goal: string;
}

export const CustomizationForm: React.FC<CustomizationFormProps> = ({
    processingOption,
    disabled,
    onDocumentTypeChange,
    onGoalChange,
    documentType,
    goal,
}) => {
    if (!processingOption || disabled) return null;

    const documentTypes = [
        "Proposal",
        "Report",
        "Standard Operating Procedure",
        "Meeting Notes",
        "Training Manual",
        "Business Plan",
        "Contract",
        "Other",
    ];

    let goalPlaceholder = "What specific insights are you looking for?";

    switch (processingOption) {
        case "summarize":
            goalPlaceholder = "What aspects should the summary focus on?";
            break;
        case "questions":
            goalPlaceholder = "Enter your questions (one per line)";
            break;
        case "insights":
            goalPlaceholder = "What specific insights are you looking for?";
            break;
        case "report":
            goalPlaceholder = "What should the report focus on?";
            break;
    }

    return (
        <Card className="animate-fade-in">
            <CardHeader>
                <CardTitle className="text-lg">Customize Your Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="document-type">What kind of document is this?</Label>
                    <Select value={documentType} onValueChange={onDocumentTypeChange} disabled={disabled}>
                        <SelectTrigger id="document-type">
                            <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                            {documentTypes.map((type) => (
                                <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="goal">
                        {processingOption === "questions"
                            ? "What questions do you have? (Up to 10)"
                            : "What do you want to achieve with this document?"}
                    </Label>
                    <Textarea
                        id="goal"
                        value={goal}
                        onChange={(e) => onGoalChange(e.target.value)}
                        placeholder={goalPlaceholder}
                        rows={5}
                        disabled={disabled}
                        className="resize-none"
                    />
                    {processingOption === "questions" && (
                        <p className="text-xs text-appGray-500">
                            Enter one question per line. Maximum 10 questions.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};