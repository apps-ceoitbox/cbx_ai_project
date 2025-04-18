import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CustomizationForm } from "@/components/DocumentReader/CustomizationForm";
import { ResultsDisplay } from "@/components/DocumentReader/ResultsDisplay";
import { FileUploadZone } from "@/components/DocumentReader/FileUploadZone";
import { ProcessingStatus } from "@/components/DocumentReader/ProcessingStatus";
import { ProcessingOptions, ProcessingOptionType } from "@/components/DocumentReader/ProcessingOptions";
import { processDocument } from "../services/documentProcessingService";
import Header from "./Header";
import axios from "axios";
import { useAxios } from "@/context/AppContext";

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  

const DocumentReader = () => {
    const axios = useAxios("user")
    const [files, setFiles] = useState<File[]>([]);
    const [processingOption, setProcessingOption] = useState<ProcessingOptionType>(null);
    const [documentType, setDocumentType] = useState("");
    const [goal, setGoal] = useState("");
    const [status, setStatus] = useState<"idle" | "processing" | "complete" | "error">("idle");
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | undefined>();

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        // Reset other states if files change
        if (selectedFiles.length === 0) {
            resetStates();
        }
    };

    const resetStates = () => {
        setProcessingOption(null);
        setDocumentType("");
        setGoal("");
        setStatus("idle");
        setProgress(0);
        setResults(null);
        setError(undefined);
    };

    const handleProcessDocument = async () => {
        if (files.length === 0) {
            toast.error("Please upload at least one file");
            return;
        }

        if (!processingOption) {
            toast.error("Please select a processing option");
            return;
        }

        try {
            setStatus("processing");
            setProgress(0);
            // setError(undefined);

            let tempFiles:any[] = files.map((file) => fileToBase64(file));
            tempFiles = await Promise.all(tempFiles);
            tempFiles = files.map((file, index) => {
                return {
                    name: file.name,
                    base64: tempFiles[index],
                    type: file.type
                }
            });
            const temp = {
                files: tempFiles,
                processingOption: processingOption,
                documentType: documentType,
                goal: goal
            }

            const response = await axios.post("/document/process", temp);
            setResults({
                processingOption,
                result: response.data
            })

            console.log(response);
            // const result = await processDocument(
            //     files,
            //     processingOption,
            //     documentType,
            //     goal,
            //     (progressValue) => {
            //         setProgress(progressValue);
            //     }
            // );

            // setResults(result);
            setStatus("complete");
            toast.success("Document processed successfully");
        } catch (err) {
            console.error("Error processing document:", err);
            setStatus("error");
            setError(err instanceof Error ? err.message : "Unknown error occurred");
            toast.error("Failed to process document");
        }
    };

    const handleReset = () => {
        setFiles([]);
        resetStates();
    };

    const handleCancel = () => {
        setStatus("idle");
        toast.info("Document processing cancelled");
    };

    const isReadyToProcess = files.length > 0 && processingOption !== null;

    return (
        <div>
            <Header />
            <div className="max-w-5xl mx-auto min-h-screen pt-5">


                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-red mb-2">Smart Document Reader</h1>
                    <p className="text-appGray-700">
                        Upload business documents to analyze, summarize, and extract insights using AI
                    </p>
                </header>

                {status !== "complete" ? (
                    <>
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-appBlack mb-4">1. Upload Your Documents</h2>
                            <FileUploadZone
                                onFilesSelected={handleFilesSelected}
                                maxFileSize={10}
                                maxTotalSize={50}
                                maxFiles={5}
                                acceptedFileTypes={[
                                    ".pdf",
                                    ".docx",
                                    ".txt",
                                    ".csv",
                                    ".md",
                                    "application/pdf",
                                    "text/plain",
                                  
                                    // Image extensions
                                    ".jpg",
                                    ".jpeg",
                                    ".png",
                                    ".gif",
                                    ".bmp",
                                    ".webp",
                                    ".svg",
                                  
                                    // Image MIME types
                                    "image/jpeg",
                                    "image/png",
                                    "image/gif",
                                    "image/bmp",
                                    "image/webp",
                                    "image/svg+xml"
                                  ]
                                  }
                            />
                        </section>

                        {files.length > 0 && (
                            <section className="mb-8 animate-fade-in">
                                <h2 className="text-xl font-semibold text-appBlack mb-4">
                                    2. Choose Analysis Method
                                </h2>
                                <ProcessingOptions
                                    onOptionSelect={setProcessingOption}
                                    selectedOption={processingOption}
                                    disabled={status === "processing"}
                                />
                            </section>
                        )}

                        {processingOption && (
                            <section className="mb-8">
                                <h2 className="text-xl font-semibold text-appBlack mb-4">
                                    3. Customize Your Analysis (Optional)
                                </h2>
                                <CustomizationForm
                                    processingOption={processingOption}
                                    disabled={status === "processing"}
                                    onDocumentTypeChange={setDocumentType}
                                    onGoalChange={setGoal}
                                    documentType={documentType}
                                    goal={goal}
                                />
                            </section>
                        )}

                        <ProcessingStatus
                            status={status}
                            progress={progress}
                            processingOption={processingOption}
                            onCancel={handleCancel}
                            error={error}
                        />

                        {isReadyToProcess && status !== "processing" && (
                            <div className="mt-6 flex justify-end">
                                <Button
                                    onClick={handleProcessDocument}
                                    className="bg-appRed hover:bg-appRed/90 text-white"
                                >
                                    Process Document
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <ResultsDisplay
                        results={results}
                        onReset={handleReset}
                    />
                )}
            </div>
        </div>
    );
};

export default DocumentReader;