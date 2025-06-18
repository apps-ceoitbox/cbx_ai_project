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
import Loader from "@/components/Custom/Loader.tsx";
import { useNavigate } from "react-router-dom";
import LogoutConfirmationModal from "../Custom/LogoutConfirmationModal";

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
    localStorage.removeItem("userToken")
    setUserAuth(p => ({ ...p, user: null, token: null }))
    toast.success("Logout successful")
    navigate("/login")
  }

  return (
    <div className="min-h-screen">
      {(loading || enhancing) && <Loader />}
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
                      className="px-6 py-1 text-sm bg-red-500 text-white font-semibold rounded-md shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition-all flex items-center justify-center disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                      {enhancing ? <>Enhancing...</> : "✨ Enhance"}
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
                      <SelectItem value="4">4 Images</SelectItem>
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
              className="w-full max-w-md h-14 text-lg font-semibold bg-red-500 hover:bg-red-600 transform hover:scale-[1.02] transition-all duration-200 text-white"
              disabled={loading || !formData.prompt}
            >
              {loading ? (
                <>Creating Magic...</>
              ) : (
                <>
                  <Sparkles className="mr-3 h-5 w-5" />
                  Generate Image
                </>
              )}
            </Button>
          </div>

          <div className="mt-8" id="generated-images-section">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Generated Images
            </h2>
            {loading ? (
              <div className="text-center text-gray-500 py-10">
                <p className="text-lg animate-pulse">
                  Generating images, please wait...
                </p>
              </div>
            ) : imageUrls.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {imageUrls.map((imageUrl, index) => (
                  <Card
                    key={index}
                    className="relative overflow-hidden group shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={imageUrl}
                      alt={`Generated Image ${index + 1}`}
                      className="w-full h-auto object-cover rounded-t-md aspect-square"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex space-x-4">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="p-2 rounded-full transform hover:scale-110 transition-transform duration-200"
                          onClick={() => openModal(imageUrl)} // Changed to open the modal
                          title="View Image"
                        >
                          <Eye className="w-6 h-6 text-blue-500" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="p-2 rounded-full transform hover:scale-110 transition-transform duration-200"
                          onClick={() => downloadImage(imageUrl, index)}
                          title="Download Image"
                        >
                          <Download className="w-6 h-6 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <p className="text-lg">
                  No images generated yet. Enter a prompt and click "Generate
                  Image"!
                </p>
                <p className="mt-2 text-sm">Your creations will appear here.</p>
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
