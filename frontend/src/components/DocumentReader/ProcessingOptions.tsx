
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, HelpCircle, Brain, BarChartBig } from "lucide-react";


export type ProcessingOptionType = "summarize" | "questions" | "insights" | "report" | null;

interface ProcessingOptionsProps {
    onOptionSelect: (option: ProcessingOptionType) => void;
    selectedOption: ProcessingOptionType;
    disabled: boolean;
}

export const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
    onOptionSelect,
    selectedOption,
    disabled,
}) => {
    const options = [
        {
            id: "summarize",
            title: "Summarize Document",
            description: "Generate a quick executive summary (100-300 words)",
            icon: FileText,
        },
        {
            id: "questions",
            title: "Ask Questions",
            description: "Ask up to 10 specific questions about the document",
            icon: HelpCircle,
        },
        {
            id: "insights",
            title: "Auto Insights",
            description: "Get key takeaways, strengths, gaps and action points",
            icon: Brain,
        },
        {
            id: "report",
            title: "Generate Custom Report",
            description: "Create a downloadable PDF with insights and recommendations",
            icon: BarChartBig,
        },
    ] as const;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                    <Card
                        key={option.id}
                        className={`transition-all cursor-pointer hover:shadow-md ${isSelected ? "ring-2 ring-appRed" : "hover:border-appRed/50"
                            } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                        onClick={() => !disabled && onOptionSelect(option.id)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <option.icon
                                    className={`h-6 w-6 ${isSelected ? "text-appRed" : "text-appGray-500"}`}
                                />
                                <div className="h-4 w-4 rounded-full border-2 flex items-center justify-center">
                                    {isSelected && <div className="h-2 w-2 rounded-full bg-appRed"></div>}
                                </div>
                            </div>
                            <CardTitle className="text-lg">{option.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{option.description}</CardDescription>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
