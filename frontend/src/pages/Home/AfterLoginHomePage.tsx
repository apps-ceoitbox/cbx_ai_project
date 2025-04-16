
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AfterLoginHomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50">
            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Section - Welcome Content */}
                <div className="w-1/2 p-8 flex flex-col justify-center">
                    <div className="max-w-lg">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our CBX AI Tool</h1>
                        <p className="text-gray-600 mb-6">Your workspace is ready. Navigate using the sidebar to explore all available features.</p>

                        {/* <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertTitle className="text-red-800">Getting Started</AlertTitle>
                            <AlertDescription className="text-red-700">
                                Welcome! Explore the sidebar menu to access your tools and options. Simply click on any item to begin working on your tasks and get started.
                            </AlertDescription>
                        </Alert> */}

                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="text-lg px-8 py-6 bg-red-500 hover:bg-red-700"
                        >
                            Get Started <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Right Section - Human Image */}
                <div className="w-1/2 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center ">
                    {/* <div className="relative w-full max-w-md aspect-square rounded-full bg-white overflow-hidden border-4 border-white shadow-xl"> */}
                    <img
                        draggable="false"
                        src='/Banner.jpg'
                        // src="https://ceoitbox.com/wp-content/uploads/2022/05/Sanjeev-Jain-3.png.webp"
                        alt="Image"
                        className="object-fill w-full h-full"
                    />
                    {/* </div> */}
                </div>
            </div>
        </div>
    );
};

export default AfterLoginHomePage;