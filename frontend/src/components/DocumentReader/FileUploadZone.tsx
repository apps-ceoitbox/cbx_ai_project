
import React, { useState, useRef } from "react";
import { FileUp, X, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    maxFileSize: number;
    maxTotalSize: number;
    maxFiles: number;
    acceptedFileTypes: string[];
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
    onFilesSelected,
    maxFileSize,
    maxTotalSize,
    maxFiles,
    acceptedFileTypes,
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const bytesToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        validateAndAddFiles(files);
    };

    const validateAndAddFiles = (files: File[]) => {
        const validFiles: File[] = [];
        const newTotalSize = totalSize + files.reduce((sum, file) => sum + file.size, 0);

        // Check if total files would exceed limit
        if (selectedFiles.length + files.length > maxFiles) {
            toast.error(`You can only upload a maximum of ${maxFiles} files`);
            return;
        }

        // Check if total size would exceed limit
        if (newTotalSize > maxTotalSize * 1024 * 1024) {
            toast.error(`Total size cannot exceed ${maxTotalSize}MB`);
            return;
        }

        // Validate each file
        for (const file of files) {
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            const isValidType = acceptedFileTypes.some(type =>
                type.includes(fileExtension!) ||
                type === file.type
            );

            if (!isValidType) {
                toast.error(`Invalid file type: ${file.name}. Accepted formats: ${acceptedFileTypes.join(', ')}`);
                continue;
            }

            if (file.size > maxFileSize * 1024 * 1024) {
                toast.error(`File ${file.name} exceeds the maximum file size of ${maxFileSize}MB`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length > 0) {
            const updatedFiles = [...selectedFiles, ...validFiles];
            setSelectedFiles(updatedFiles);
            onFilesSelected(updatedFiles);
            toast.success(`${validFiles.length} file(s) added successfully`);
        }
    };

    const removeFile = (indexToRemove: number) => {
        const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setSelectedFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        validateAndAddFiles(files);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? "border-appRed bg-appRed/5" : "border-appGray-300"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={acceptedFileTypes.join(",")}
                    className="hidden"
                    multiple
                />
                <FileUp className="mx-auto h-12 w-12 text-appGray-500" />
                <h3 className="mt-4 text-lg font-semibold">Drag & Drop Files</h3>
                <p className="text-sm text-appGray-500 mt-2">
                    Supported formats: PDF, DOCX, TXT, CSV, MD (Max {maxFileSize}MB per file)
                </p>
                <p className="text-xs text-appGray-500 mt-1">
                    Total upload allowed: {maxTotalSize}MB (Max {maxFiles} files)
                </p>
                <Button
                    onClick={handleBrowseClick}
                    variant="outline"
                    className="mt-4 border-appRed text-appRed hover:bg-appRed hover:text-white"
                >
                    Browse Files
                </Button>
            </div>

            {selectedFiles.length > 0 && (
                <div className="bg-white rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                        <h3 className="font-medium">Selected Files</h3>
                        <span className="text-sm text-appGray-500">
                            Total: {bytesToMB(totalSize)}MB / {maxTotalSize}MB
                        </span>
                    </div>
                    <ul className="space-y-2">
                        {selectedFiles.map((file, index) => (
                            <li
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between bg-appGray-100 p-2 rounded"
                            >
                                <div className="flex items-center">
                                    <FileCheck className="h-5 w-5 text-appRed mr-2" />
                                    <div>
                                        <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-appGray-500">
                                            {file.type || `${file.name.split('.').pop()?.toUpperCase()} File`} • {bytesToMB(file.size)}MB
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};