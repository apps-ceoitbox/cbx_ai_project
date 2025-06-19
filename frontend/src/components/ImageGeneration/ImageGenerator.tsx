import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Menu,
  X,
  Sparkles,
  Palette,
  LayoutDashboard,
  Download,
  Eye,
} from "lucide-react"; // Import Download icon
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAxios, useData } from "@/context/AppContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LogoutConfirmationModal from "../Custom/LogoutConfirmationModal";
import EnhanceLoader from "./EnhanceLoader";
import ImageGenerationLoader from "./ImageGenerationLoader";

const ImageGenerator = () => {
  const axios = useAxios("user");
  const { setUserAuth, mobileMenuOpen, setMobileMenuOpen } = useData();
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [imageUrls, setImageUrls] = useState([]); // State for generated image URLs
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="bg-white shadow-md text-black"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </Button>
  );

  const [formData, setFormData] = useState({
    prompt: "",
    style: "realistic",
    orientation: "square",
    size: "1024x1024",
    negativePrompt: "",
    numImages: 1,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setImageUrls([]); // Clear previous images on new submission

    try {
      console.log("Sending request with formData:", formData);
      const response = await axios.post(
        "/generateImage/generateImage",
        formData
      );

      if (response.data.success) {
        setImageUrls(response.data.imageUrls);
        console.log("Images generated successfully:", response.data.imageUrls);
        toast.success(
          response.data.message || "Images generated successfully!"
        );
      } else {
        console.error("API Error:", response.data);
        toast.error(response.data.message || "Failed to generate images.");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
        console.error("Response headers:", err.response.headers);
        toast.error(
          err.response.data.message ||
            "An error occurred from the server. Please try again."
        );
      } else if (err.request) {
        console.error("Request data:", err.request);
        toast.error(
          "No response received from the server. Please check your network connection."
        );
      } else {
        console.error("Error message:", err.message);
        toast.error("An unexpected error occurred. " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnhancePrompt = async () => {
    if (!formData.prompt) {
      toast.error("Please enter a prompt to enhance.");
      return;
    }
    setEnhancing(true);
    try {
      const response = await axios.post("/generateImage/enhance-prompt", {
        prompt: formData.prompt,
      });
      const newEnhancedPrompt = response.data.enhancedPrompt;
      if (newEnhancedPrompt) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          prompt: newEnhancedPrompt,
        }));
        toast.success("Prompt enhanced successfully!");
      } else {
        toast.error("Could not get an enhanced prompt.");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast.error("Failed to enhance prompt. Please try again.");
    } finally {
      setEnhancing(false);
    }
  };

  const downloadImage = async (imageUrl) => {
    if (!imageUrl) {
      console.error("Image URL is missing for download.");
      return;
    }

    console.log(imageUrl);
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

      const filename = "downloaded_image.png";
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
    if (imageUrls.length > 0 && !loading) {
      const element = document.getElementById("generated-images-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [imageUrls, loading]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalImage, setCurrentModalImage] = useState("");

  // Function to open the modal
  const openModal = (imageUrl) => {
    setCurrentModalImage(imageUrl);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentModalImage("");
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setUserAuth((p) => ({ ...p, user: null, token: null }));
    toast.success("Logout successful");
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      {loading && <ImageGenerationLoader />}
      {enhancing && <EnhanceLoader />}
      <div className="sticky top-0 z-10 flex justify-end items-center p-4 bg-black shadow-md">
        <Button
          variant="outline"
          className="text-black border-white hover:bg-red-600 mr-4 hover:text-white"
          onClick={() => {
            console.log("Dashboard clicked");
            // Navigate to the user dashboard
            navigate("/image-generation-user-dashboard");
          }}
        >
          <LayoutDashboard className="w-5 h-5" />
          {isMobile ? "" : "Dashboard"}
        </Button>
        <Button
          variant="outline"
          className="text-black border-white hover:bg-red-600 mr-4 hover:text-white"
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut className="w-5 h-5" />
          {isMobile ? "" : "Logout"}
        </Button>
        {isMobile && <MobileMenuButton />}
      </div>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-left mb-8">
          <h1 className="text-4xl p-1 font-bold bg-gradient-to-r from-red-600 to-red-900 bg-clip-text text-transparent mb-1">
            AI Image Generator
          </h1>
          <p className="text-gray-600 text-lg">
            Transform your imagination into stunning visuals
          </p>
        </div>
        <div className="grid gap-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Palette className="w-5 h-5" />
                Creative Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="prompt" className="text-gray-700 font-medium">
                  Describe Your Vision
                </Label>
                <div className="flex flex-col gap-3">
                  <Textarea
                    id="prompt"
                    name="prompt"
                    placeholder="A majestic dragon soaring through clouds at sunset, digital art style..."
                    value={formData.prompt}
                    onChange={handleInputChange}
                    className="min-h-[120px] resize-none border-red-200 focus:border-red-400 focus:ring-red-400/20 bg-gradient-to-br from-white to-red-50/30"
                  />
                  <div className="w-full flex justify-end">
                    <button
                      type="button"
                      onClick={handleEnhancePrompt}
                      disabled={enhancing}
                      className="px-5 py-1 text-sm font-semibold rounded-2xl bg-gradient-to-r from-red-400 to-red-500 to-red-600 text-white shadow-md hover:from-rose-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {enhancing ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <span className="text-lg">✨</span> Enhance
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {" "}
                {/* Added gap for spacing */}
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">Art Style</Label>
                  <Select
                    value={formData.style}
                    onValueChange={(value) =>
                      handleSelectChange("style", value)
                    }
                  >
                    <SelectTrigger className="border-red-200 focus:border-red-400 focus:ring-red-400/20">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">🎨 Realistic</SelectItem>
                      <SelectItem value="anime">🌸 Anime</SelectItem>
                      <SelectItem value="cartoon">🎭 Cartoon</SelectItem>
                      <SelectItem value="oil-painting">
                        🖼️ Oil Painting
                      </SelectItem>
                      <SelectItem value="watercolor">💧 Watercolor</SelectItem>
                      <SelectItem value="sketch">✏️ Sketch</SelectItem>
                      <SelectItem value="pixel-art">🎮 Pixel Art</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">
                    Orientation
                  </Label>
                  <Select
                    value={formData.orientation}
                    onValueChange={(value) =>
                      handleSelectChange("orientation", value)
                    }
                  >
                    <SelectTrigger className="border-red-200 focus:border-red-400 focus:ring-red-400/20">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">⬜ Square (1:1)</SelectItem>
                      <SelectItem value="portrait">
                        📱 Portrait (3:4)
                      </SelectItem>
                      <SelectItem value="landscape">
                        🖥️ Landscape (4:3)
                      </SelectItem>
                      <SelectItem value="wide">📺 Wide (16:9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">
                    Image Size
                  </Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => handleSelectChange("size", value)}
                  >
                    <SelectTrigger className="border-red-200 focus:border-red-400 focus:ring-red-400/20">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512x512">512 × 512</SelectItem>
                      <SelectItem value="768x768">768 × 768</SelectItem>
                      <SelectItem value="1024x1024">1024 × 1024</SelectItem>
                      <SelectItem value="1024x1536">
                        1024 × 1536 (Portrait)
                      </SelectItem>
                      <SelectItem value="1536x1024">
                        1536 × 1024 (Landscape)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-gray-700 font-medium">
                    Number of Images
                  </Label>
                  <Select
                    value={formData.numImages.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("numImages", Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="border-red-200 focus:border-red-400 focus:ring-red-400/20">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Image</SelectItem>
                      <SelectItem value="2">2 Images</SelectItem>
                      <SelectItem value="3">3 Images</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="negativePrompt"
                  className="text-gray-700 font-medium"
                >
                  Negative Prompt (Optional)
                </Label>
                <Textarea
                  id="negativePrompt"
                  name="negativePrompt"
                  placeholder="What to avoid: blurry, low quality, distorted..."
                  value={formData.negativePrompt}
                  onChange={handleInputChange}
                  className="min-h-[80px] resize-none border-red-200 focus:border-red-400 focus:ring-red-400/20 bg-gradient-to-br from-white to-red-50/30"
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.prompt}
              className="w-full max-w-md h-14 px-6 text-lg font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg hover:shadow-rose-300 hover:scale-[1.03] hover:from-rose-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white mr-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                  Creating Magic...
                  <svg
                    className="animate-spin h-6 w-6 text-white mr-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    <path d="M22 4 12 14.01l-3-3" />
                  </svg>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          <div className="mt-8" id="generated-images-section">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Generated Images
              </span>
            </h2>

            {loading ? (
              <div className="text-center text-gray-600 py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 animate-spin">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
                <p className="text-xl font-medium text-red-700 animate-pulse">
                  Generating your masterpiece...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This may take a few moments
                </p>
              </div>
            ) : imageUrls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {imageUrls.map((imageUrl, index) => (
                  <Card
                    key={index}
                    className="relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-2 border-red-100 hover:border-red-300 rounded-2xl"
                  >
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt={`Generated Image ${index + 1}`}
                        className="w-full h-auto object-cover rounded-t-2xl"
                        style={{
                          aspectRatio: "auto", // Maintain original aspect ratio
                          minHeight: "200px",
                          maxHeight: "500px",
                        }}
                        loading="lazy"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Action buttons */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-100 scale-90">
                        <div className="flex space-x-4">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="w-14 h-14 rounded-full bg-white/90 hover:bg-white shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-red-200 hover:border-red-400"
                            onClick={() => openModal(imageUrl)}
                            title="View Full Size"
                          >
                            <Eye className="w-6 h-6 text-red-600" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="w-14 h-14 rounded-full bg-white/90 hover:bg-white shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-red-200 hover:border-red-400"
                            onClick={() => downloadImage(imageUrl)}
                            title="Download Image"
                          >
                            <Download className="w-6 h-6 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Card footer with subtle info */}
                    <div className="p-4 bg-gradient-to-r from-red-50 to-red-100">
                      <p className="text-sm font-medium text-red-800 text-center">
                        Image {index + 1}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-16 border-2 border-dashed border-red-200 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 shadow-inner">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg
                      className="w-12 h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-700 mb-4">
                    Ready to Create Magic?
                  </h3>
                  <p className="text-lg text-red-600 mb-2">
                    No images generated yet. Enter a prompt and click "Generate
                    Image"!
                  </p>
                  <p className="text-sm text-red-500">
                    Your beautiful creations will appear here in all their
                    glory.
                  </p>
                </div>
              </div>
            )}
          </div>

          {isModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4 animate-fadeIn"
              onClick={closeModal} // Close modal when clicking outside
            >
              <div
                className="relative bg-white rounded-lg p-4 shadow-2xl max-w-3xl max-h-[90vh] overflow-hidden animate-zoomIn"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
              >
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform duration-200 z-10"
                  title="Close"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={currentModalImage}
                  alt="Viewed Image"
                  className="max-w-full max-h-[calc(90vh-40px)] object-contain rounded-md"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <LogoutConfirmationModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default ImageGenerator;
