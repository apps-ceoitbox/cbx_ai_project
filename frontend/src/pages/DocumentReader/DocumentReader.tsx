import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CustomizationForm } from "@/components/DocumentReader/CustomizationForm";
import { ResultsDisplay } from "@/components/DocumentReader/ResultsDisplay";
import { FileUploadZone } from "@/components/DocumentReader/FileUploadZone";
import { ProcessingOptions, ProcessingOptionType } from "@/components/DocumentReader/ProcessingOptions";
// import { processDocument } from "../services/documentProcessingService";
import Header from "./Header";
import { useAxios, useData } from "@/context/AppContext";

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

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: number;
}

const DocumentReader = () => {
    const axios = useAxios("user");
    const { userAuth } = useData();
    const [files, setFiles] = useState<File[]>([]);
    const [processingOption, setProcessingOption] = useState<ProcessingOptionType>(null);
    const [documentType, setDocumentType] = useState("");
    const [goal, setGoal] = useState("");
    const [status, setStatus] = useState<"idle" | "processing" | "complete" | "error">("idle");
    // const [results, setResults] = useState<any>(null);
    const [error, setError] = useState<string | undefined>();
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [currentQuery, setCurrentQuery] = useState("");
    const [showChatInput, setShowChatInput] = useState(false);
    const [firstChatInputShown, setFirstChatInputShown] = useState(false);

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
        // setProgress(0);
        // setResults(null);
        setError(undefined);
        setChatMessages([]);
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
            // setProgress(0);

            let tempFiles: any[] = files.map((file) => fileToBase64(file));
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
                goal: goal,
                context: []
            }

            // Add initial empty message before starting the stream
            setChatMessages([{
                role: 'assistant',
                content: "",
                timestamp: Date.now()
            }]);
            setShowChatInput(false);

            const res = await fetch(`${axios.defaults.baseURL}/document/process-with-context`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userAuth?.token}`
                },
                body: JSON.stringify(temp)
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let streamedContent = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                streamedContent += chunk;
                
                // Update the message with the streamed content
                setChatMessages([{
                    role: 'assistant',
                    content: streamedContent,
                    timestamp: Date.now()
                }]);
            }

            setStatus("complete");
            toast.success("Document processed successfully");
            setShowChatInput(false);
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
        setShowChatInput(false);
    };

    // const handleCancel = () => {
    //     setStatus("idle");
    //     toast.info("Document processing cancelled");
    // };

    const isReadyToProcess = files.length > 0 && processingOption !== null;

    // const handleStartChat = () => {
    //     if (results && results.result) {
    //         setChatMessages([{ role: 'assistant', content: results.result, timestamp: Date.now() }]);
    //         setChatStarted(true);
    //         setShowChatInput(false);
    //     }
    // };

    const handleSendQuery = async () => {
        if (!currentQuery.trim()) return;

        const newUserMessage: ChatMessage = {
            role: 'user',
            content: currentQuery,
            timestamp: Date.now()
        };

        // Add user message to chat
        setChatMessages(prev => [...prev, newUserMessage]);
        setCurrentQuery("");
        setShowChatInput(true);

        try {
            // Format context as [{ role: 'user'|'system', response: string }]
            const messageContext = chatMessages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add the new user message to context
            messageContext.push({
                role: 'user',
                content: currentQuery
            });

            const res = await fetch(`${axios.defaults.baseURL}/document/process-with-context`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userAuth?.token}`
                },
                body: JSON.stringify({
                    files: [], // No new files needed for chat
                    processingOption: "chat",
                    documentType: "chat",
                    goal: "chat",
                    context: messageContext
                })
            });

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let streamedContent = "";

            // Add initial empty AI message
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: "",
                timestamp: Date.now()
            }]);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                streamedContent += chunk;
                
                // Update the last message with the streamed content
                setChatMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        role: 'assistant',
                        content: streamedContent,
                        timestamp: newMessages[newMessages.length - 1].timestamp
                    };
                    return newMessages;
                });
            }
        } catch (err) {
            toast.error("Failed to get response from AI");
            console.error("Error in chat:", err);
        }
    };

    return (
        <div>
            <Header />
            <div className="max-w-5xl mx-auto min-h-screen p-5">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-primary-red mb-2">Smart Document Reader</h1>
                    <p className="text-appGray-700">
                        Upload business documents to analyze, summarize, and extract insights using AI
                    </p>
                </header>

                {status === "complete" ? (
                    <div className="space-y-8">
                        <div className="flex justify-end">
                            <Button
                                variant="default"
                                onClick={handleReset}
                                className="bg-appRed hover:bg-appRed/90 text-white"
                            >
                                Analyze Another Document
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {chatMessages.map((message) => (
                                <div 
                                    key={message.timestamp} 
                                    className={`w-full ${message.role === 'user' ? 'flex justify-end' : ''}`}
                                >
                                    {message.role === 'user' ? (
                                        <div className="max-w-[80%] bg-appRed/10 rounded-lg p-4">
                                            <p className="text-sm font-medium mb-1 text-appRed">You</p>
                                            <p>{message.content}</p>
                                        </div>
                                    ) : (
                                        <div className="max-w-[90%]">
                                            <ResultsDisplay
                                                results={{
                                                    processingOption: processingOption,
                                                    result: message.content
                                                }}
                                                onReset={handleReset}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Show Continue button after first AI response, then show chat input after clicking Continue */}
                        {!showChatInput ? (
                            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-center">
                                <Button
                                    onClick={() => {
                                        setShowChatInput(true);
                                        setFirstChatInputShown(true);
                                    }}
                                    className="bg-appRed hover:bg-appRed/90 text-white"
                                >
                                    Continue
                                </Button>
                            </div>
                        ) : (
                            <div className="sticky bottom-0 bg-white p-4 border-t">
                                <div className="flex flex-col gap-2 max-w-5xl mx-auto">
                                    {/* Info about remaining followups */}
                                    <div className="mb-1 text-xs text-gray-700 font-medium">
                                        {5 - chatMessages.filter(m => m.role === 'user').length} followups remaining
                                    </div>
                                    {/* Show context info only the first time */}
                                    {firstChatInputShown && chatMessages.filter(m => m.role === 'user').length === 0 && (
                                        <div className="mb-1 text-xs text-gray-500">Only the last 5 messages are used as context.</div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            value={currentQuery}
                                            onChange={(e) => setCurrentQuery(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                                            placeholder="Ask a follow-up question... (last 5 chats are used as context)"
                                            className="flex-1 p-2 border rounded"
                                            disabled={chatMessages.filter(m => m.role === 'user').length >= 5}
                                        />
                                        <Button
                                            onClick={handleSendQuery}
                                            className="bg-appRed hover:bg-appRed/90 text-white"
                                            disabled={!currentQuery.trim() || chatMessages.filter(m => m.role === 'user').length >= 5}
                                        >
                                            Send
                                        </Button>
                                    </div>
                                    {chatMessages.filter(m => m.role === 'user').length >= 5 && (
                                        <p className="text-xs text-appRed mt-1">You have reached the maximum of 5 follow-up questions.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
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
                                    ".jpg",
                                    ".jpeg",
                                    ".png",
                                    ".gif",
                                    ".bmp",
                                    ".webp",
                                    ".svg",
                                    "image/jpeg",
                                    "image/png",
                                    "image/gif",
                                    "image/bmp",
                                    "image/webp",
                                    "image/svg+xml"
                                ]}
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

                        {status === "processing" && chatMessages.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-appBlack mb-4">Processing Results:</h2>
                                <div className="space-y-6">
                                    {chatMessages.map((message)=> (
                                        <div key={message.timestamp} className="max-w-[90%]">
                                            <ResultsDisplay
                                                results={{
                                                    processingOption: processingOption,
                                                    result: message.content
                                                }}
                                                onReset={handleReset}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 mb-4">
                                {error}
                            </div>
                        )}

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
                )}
            </div>
        </div>
    );
};

export default DocumentReader;