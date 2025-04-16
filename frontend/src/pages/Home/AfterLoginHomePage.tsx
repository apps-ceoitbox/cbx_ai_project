import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AfterLoginHomePage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-50">
            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Section - Welcome Content */}
                <div className="w-1/2 p-8 flex flex-col justify-center">
                    <div className="max-w-lg">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our CBX AI Tool</h1>
                        <p className="text-gray-600 mb-6">Your workspace is ready. Navigate using the sidebar to explore all available features.</p>

                        <Alert className="mb-6 border-red-200 bg-red-50">
                            <AlertTitle className="text-red-800">Getting Started</AlertTitle>
                            <AlertDescription className="text-red-700">
                                Check the sidebar menu to access your tools and options. Click on any menu item to get started with your tasks.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>

                {/* Right Section - Human Image */}
                <div className="w-1/2 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center ">
                    {/* <div className="relative w-full max-w-md aspect-square rounded-full bg-white overflow-hidden border-4 border-white shadow-xl"> */}
                    <img
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