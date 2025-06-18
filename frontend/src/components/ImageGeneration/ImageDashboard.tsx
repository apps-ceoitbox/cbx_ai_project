import { useState, useEffect } from "react";
import {
  Eye,
  Download,
  X,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import DynamicPagination from "@/components/dynamicPagination.tsx";
import { Button } from "@/components/ui/button";
import { useAxios } from "@/context/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const providers = [
  {
    name: "Gemini",
    models: [
      "imagen-3.0-generate-002",
      "imagen-3.0-fast",
      "imagen-3.0-quality",
      "gemini-2.0-flash-preview-image-generation",
      "gemini-2.0-flash-exp",
    ],
  },
];

const ImageDashboard = () => {
  const [modalImages, setModalImages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApiProvider, setSelectedApiProvider] = useState("");
  const [selectedApiModel, setSelectedApiModel] = useState("");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [apiProviders, setApiProviders] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState(null);

  const axios = useAxios("admin");
  const itemsPerPage = 6;

  const handleSaveAISettings = async (settings) => {
    setSettingsLoading(true);
    try {
      await axios.post("/generateImage/saveAiProvider", {
        provider: settings.aiProvider.name,
        model: settings.aiProvider.model,
        extraPrompt: settings.extraPrompt || "",
      });
      console.log("AI Settings saved successfully");
    } catch (error) {
      console.error("Error saving AI settings:", error);
      toast.error("Failed to save AI settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchAIProviders = async () => {
    setApiProviders(providers);
    try {
      const response = await axios.get("/generateImage/getProvider");
      const { aiProvider, modelName, extraPrompt } = response.data;
      if (aiProvider && modelName) {
        setSelectedApiProvider(aiProvider);
        setSelectedApiModel(modelName);
        setExtraPrompt(extraPrompt || "");
      }
    } catch (error) {
      console.error("Error fetching AI providers:", error);
    }
  };

  const fetchSubmissions = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage, search: search.trim() };
      const response = await axios.get("/generateImage/getSubmissions", {
        params,
      });
      const { submissions, pagination } = response.data;
      setSubmissions(submissions || []);
      setTotalPages(pagination.totalPages || 0);
      setTotalRecords(pagination.total || 0);
      setCurrentPage(pagination.currentPage || page);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Could not fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (providerName) => {
    setSelectedApiProvider(providerName);
    const provider = apiProviders.find((p) => p.name === providerName);
    const defaultModel = provider?.models?.[0] || "";
    setSelectedApiModel(defaultModel);
    handleSaveAISettings({
      aiProvider: { name: providerName, model: defaultModel },
      extraPrompt,
    });
  };

  const handleModelChange = (modelName) => {
    setSelectedApiModel(modelName);
    handleSaveAISettings({
      aiProvider: { name: selectedApiProvider, model: modelName },
      extraPrompt,
    });
  };

  const handleSaveExtraPrompt = async (newExtraPrompt) => {
    setExtraPrompt(newExtraPrompt);
    await handleSaveAISettings({
      aiProvider: { name: selectedApiProvider, model: selectedApiModel },
      extraPrompt: newExtraPrompt,
    });
  };

  const handlePageChange = (page) => {
    fetchSubmissions(page, searchQuery);
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      await axios.delete(
        `/generateImage/deleteSubmission/${submissionToDelete._id}`
      );
      toast.success("Submission deleted successfully.");
      setSubmissionToDelete(null);
      fetchSubmissions(currentPage, searchQuery);
    } catch (error) {
      console.error("Error deleting submission:", error);
      toast.error("Failed to delete submission.");
      setSubmissionToDelete(null);
    }
  };

  const openImageModal = (images, prompt, startIndex = 0) => {
    console.log(images, prompt);
    if (images && images.length > 0) {
      setModalImages({ images, prompt, currentIndex: startIndex });
    }
  };

  const closeImageModal = () => setModalImages(null);

  const handlePrevImage = () => {
    setModalImages((prev) => {
      if (!prev) return null;
      const newIndex =
        (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
      return { ...prev, currentIndex: newIndex };
    });
  };

  const handleNextImage = () => {
    setModalImages((prev) => {
      if (!prev) return null;
      const newIndex = (prev.currentIndex + 1) % prev.images.length;
      return { ...prev, currentIndex: newIndex };
    });
  };

  const downloadImage = async (imageUrl, prompt) => {
    if (!imageUrl) {
      console.error("Image URL is missing for download.");
      return;
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const imageBlob = await response.blob();

      // Create a URL for the Blob
      const url = window.URL.createObjectURL(imageBlob);
      const link = document.createElement("a");
      link.href = url;

      const filename = prompt
        ? `${prompt.substring(0, 50).replace(/[^a-z0-9]/gi, "_")}.png`
        : "downloaded_image.png";
      link.download = filename;

      document.body.appendChild(link);
      link.click();

      // Clean up the object URL and the element
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  useEffect(() => {
    fetchAIProviders();
    fetchSubmissions(1, "");
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSubmissions(1, searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + submissions.length, totalRecords);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-5 flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">
              Image Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage AI-generated images from user submissions
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <Select
              value={selectedApiProvider}
              onValueChange={handleProviderChange}
              disabled={settingsLoading}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select an AI Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>AI Providers</SelectLabel>
                  {apiProviders.map((provider) => (
                    <SelectItem key={provider.name} value={provider.name}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={selectedApiModel}
              onValueChange={handleModelChange}
              disabled={settingsLoading || !selectedApiProvider}
            >
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Select an AI Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>AI Models</SelectLabel>
                  {apiProviders
                    .find((p) => p.name === selectedApiProvider)
                    ?.models?.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="text-white border-white bg-red-500 hover:bg-red-600 hover:text-white flex items-center gap-2 w-full sm:w-auto"
              onClick={() => setShowPromptModal(true)}
            >
              <Plus size={16} />
              Add Prompt
            </Button>
          </div>
          {showPromptModal && (
            <PromptModal
              open={showPromptModal}
              onClose={() => setShowPromptModal(false)}
              currentExtraPrompt={extraPrompt}
              onSave={handleSaveExtraPrompt}
            />
          )}
        </div>
      </div>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <input
          type="text"
          placeholder="Search by name, email, image prompt..."
          className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
          {loading ? (
            <div className="text-center text-gray-500 py-10">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No matching submissions found.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-red-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Name</th>
                  <th className="px-6 py-4 text-left font-medium">Email</th>
                  <th className="px-6 py-4 text-left font-medium">Images</th>
                  <th className="px-6 py-4 text-left font-medium">
                    Submission Date
                  </th>
                  <th className="px-6 py-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr
                    key={submission._id || index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {submission.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {submission.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {submission.images?.map((image, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative w-12 h-12 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                            onClick={() =>
                              openImageModal(
                                submission.images,
                                submission.prompt,
                                imgIndex
                              )
                            }
                          >
                            <img
                              src={image.url}
                              alt={submission.prompt || "Image"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Intl.DateTimeFormat("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                        .format(new Date(submission.createdAt))
                        .replace(",", "")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          onClick={() =>
                            openImageModal(submission.images, submission.prompt)
                          }
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 transition-colors"
                          onClick={() => setSubmissionToDelete(submission)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <DynamicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {totalRecords > 0 ? startIndex + 1 : 0} to {endIndex} of{" "}
          {totalRecords} submissions.
        </div>
        {extraPrompt && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Current Extra Prompt:
            </h3>
            <p className="text-sm text-gray-600 bg-white p-3 rounded border">
              {extraPrompt}
            </p>
          </div>
        )}
      </div>

      {modalImages && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") handlePrevImage();
            if (e.key === "ArrowRight") handleNextImage();
          }}
          tabIndex={-1}
        >
          <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                Image Viewer
              </h3>
              <div className="text-sm text-gray-500 font-mono">
                {modalImages.currentIndex + 1} / {modalImages.images.length}
              </div>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-800 transition-colors rounded-full p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* --- CORRECTED IMAGE DISPLAY AREA --- */}
            <div className="flex-grow p-4 md:p-6 flex items-center justify-center relative overflow-hidden">
              {/* Only the current image is rendered */}
              <img
                key={modalImages.currentIndex}
                src={modalImages.images[modalImages.currentIndex].url}
                alt={modalImages.prompt}
                className="object-fill rounded-lg shadow-lg max-w-[80vw] max-h-[65vh]"
              />

              {/* Navigation Buttons are overlaid on top */}
              {modalImages.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-full p-2 transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-full p-2 transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}
            </div>
            {/* --- END OF CORRECTED AREA --- */}

            <div className="p-4 border-t border-gray-200 space-y-3 flex-shrink-0">
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md max-h-24 overflow-y-auto">
                <span className="font-semibold text-gray-800">Prompt:</span>{" "}
                {modalImages.prompt}
              </p>
              <button
                onClick={() =>
                  downloadImage(
                    modalImages.images[modalImages.currentIndex].url,
                    modalImages.prompt
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}

      {submissionToDelete && (
        <Dialog
          open={!!submissionToDelete}
          onOpenChange={() => setSubmissionToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                submission by <strong>{submissionToDelete.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSubmissionToDelete(null)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteSubmission}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const PromptModal = ({ open, onClose, currentExtraPrompt, onSave }) => {
  const [extraPrompt, setExtraPrompt] = useState(currentExtraPrompt || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setExtraPrompt(currentExtraPrompt || "");
  }, [currentExtraPrompt]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave(extraPrompt.trim());
      toast.success("Prompt saved successfully");
      onClose();
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Failed to save prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearPrompt = async () => {
    setLoading(true);
    try {
      await onSave("");
      toast.success("Prompt cleared successfully");
      setExtraPrompt("");
      onClose();
    } catch (error) {
      console.error("Error clearing prompt:", error);
      toast.error("Failed to clear prompt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setExtraPrompt(currentExtraPrompt || "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Extra Prompt</DialogTitle>
          <DialogDescription>
            Add, modify, or clear the extra prompt that will be used with all
            image generations.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="promptContent">Extra Prompt Content</Label>
            <Textarea
              id="promptContent"
              placeholder="Enter your extra prompt here..."
              className="h-36"
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              disabled={loading}
            />
          </div>
          {currentExtraPrompt && (
            <div className="text-xs text-gray-500">
              Current prompt: "{currentExtraPrompt}"
            </div>
          )}
        </div>
        <DialogFooter className="mt-6 flex-col sm:flex-row sm:justify-end gap-2">
          {currentExtraPrompt && (
            <Button
              variant="destructive"
              onClick={handleClearPrompt}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Prompt
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Extra Prompt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDashboard;
