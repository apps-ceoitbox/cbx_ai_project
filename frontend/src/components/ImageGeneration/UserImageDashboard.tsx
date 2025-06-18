import { useState, useEffect } from "react";
import {
  Eye,
  Download,
  X,
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

interface ImageSubmission {
  _id: string;
  prompt: string;
  email: string; // Assuming email is part of the submission if it's used for searching
  name?: string; // Optional, if it exists
  images: { url: string; size?: string }[]; // Assuming images is an array of objects with 'url'
  createdAt: string; // Assuming createdAt is a string date from MongoDB
  // Add other properties as they exist in your actual submission object
}

interface ModalImageState {
  images: { url: string; size?: string }[];
  prompt: string;
  currentIndex: number;
}

const UserImageDashboard = () => {
  const [modalImages, setModalImages] = useState<ModalImageState | null>(null); // State for the full-screen image modal
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [submissions, setSubmissions] = useState<ImageSubmission[]>([]); // User's image submissions
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state for submissions
  const [submissionToDelete, setSubmissionToDelete] =
    useState<ImageSubmission | null>(null); // State for delete confirmation modal

  const axios = useAxios("user"); // Changed to "user" context if you have different API instances
  const itemsPerPage = 6; // Number of items per page

  const fetchSubmissions = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage, search: search.trim() };
      const response = await axios.get("/generateImage/getUserSubmission", {
        params,
      });
      const { submissions, pagination } = response.data;
      setSubmissions(submissions || []);
      setTotalPages(pagination.totalPages || 0);
      setTotalRecords(pagination.total || 0);
      setCurrentPage(pagination.currentPage || page);
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      toast.error("Could not fetch your images.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    // Check if the page is different to avoid unnecessary fetches
    if (page !== currentPage) {
      fetchSubmissions(page, searchQuery);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      await axios.delete(
        `/user/generateImage/deleteSubmission/${submissionToDelete._id}`
      );
      toast.success("Image deleted successfully.");
      setSubmissionToDelete(null);
      // Refetch submissions to update the list, staying on the current page if possible
      // Adjust page if current page becomes empty after deletion of last item
      const newPage =
        submissions.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;
      fetchSubmissions(newPage, searchQuery);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.");
      setSubmissionToDelete(null);
    }
  };

  // Corrected type for `images` parameter to be an array of image objects
  const openImageModal = (
    images: { url: string; size?: string }[],
    prompt: string,
    startIndex: number = 0
  ) => {
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

  // Initial fetch on mount
  useEffect(() => {
    fetchSubmissions(1, "");
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSubmissions(1, searchQuery); // Always go to page 1 when search query changes
    }, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Calculate indices for display
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + submissions.length, totalRecords);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-5 flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">
              Your Generated Images
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage the AI-generated images you've created.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <input
          type="text"
          placeholder="Search by image prompt..."
          className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-3">
          {loading ? (
            <div className="text-center text-gray-500 py-10 animate-pulse">
              Loading your images...
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No images found. Generate some images to see them here!
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-red-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-medium">Prompt</th>
                  <th className="px-6 py-4 text-left font-medium">Images</th>
                  <th className="px-6 py-4 text-left font-medium">
                    Generation Date
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
                    <td
                      className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate"
                      title={submission.prompt}
                    >
                      {submission.prompt}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 flex-wrap">
                        {submission.images?.map((image, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative w-12 h-12 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                            onClick={() =>
                              // Pass the entire submission.images array, not image.urls (which likely doesn't exist)
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
                          onClick={
                            () =>
                              openImageModal(
                                submission.images,
                                submission.prompt,
                                0
                              ) // Open from first image by default
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
          {totalRecords} images.
        </div>
      </div>

      {/* Image Modal/Lightbox */}
      {modalImages && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={closeImageModal}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") handlePrevImage();
            if (e.key === "ArrowRight") handleNextImage();
            if (e.key === "Escape") closeImageModal();
          }}
          tabIndex={-1}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col animate-zoomIn"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
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
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow p-4 md:p-6 flex items-center justify-center relative overflow-hidden">
              <img
                key={modalImages.currentIndex}
                src={modalImages.images[modalImages.currentIndex]?.url}
                alt={modalImages.prompt || "Generated Image"}
                className="object-contain rounded-lg shadow-lg max-w-[80vw] max-h-[65vh]"
              />

              {modalImages.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-full p-2 transition-all"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/60 hover:bg-white/90 backdrop-blur-sm rounded-full p-2 transition-all"
                    title="Next Image"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 space-y-3 flex-shrink-0">
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md max-h-24 overflow-y-auto">
                <span className="font-semibold text-gray-800">Prompt:</span>{" "}
                {modalImages.prompt}
              </p>
              <button
                onClick={() =>
                  downloadImage(
                    modalImages.images[modalImages.currentIndex]?.url, // Added optional chaining
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

      {/* Delete Confirmation Dialog */}
      {submissionToDelete && (
        <Dialog
          open={!!submissionToDelete}
          onOpenChange={() => setSubmissionToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete this
                image submission.
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

export default UserImageDashboard;
