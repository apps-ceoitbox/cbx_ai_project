
// import { Button } from '@/components/ui/button';
// import { ArrowRight } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const AfterLoginHomePage = () => {
//     const navigate = useNavigate();

//     return (
//         <div className="flex flex-col min-h-screen bg-zinc-50">
//             {/* Main Content */}
//             <div className="flex flex-1  overflow-hidden">
//                 {/* Left Section - Welcome Content */}
//                 <div className="w-1/2 p-8 flex flex-col justify-center">
//                     <div className="max-w-lg">
//                         <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Our CBX AI Tool</h1>
//                         <p className="text-gray-600 mb-6">Your workspace is ready. Navigate using the sidebar to explore all available features.</p>

//                         <Button
//                             onClick={() => navigate("/dashboard")}
//                             className="text-lg px-8 py-6 bg-red-500 hover:bg-red-700"
//                         >
//                             Get Started <ArrowRight className="ml-2" />
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Right Section - Human Image */}
//                 <div className="w-1/2 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center ">
//                     <img
//                         draggable="false"
//                         src='/Banner.jpg'
//                         alt="Image"
//                         className="object-contain w-full h-full"
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AfterLoginHomePage;

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AfterLoginHomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col lg:min-h-screen md:min-h-screen bg-zinc-50">
            {/* Main Content */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Left Section - Welcome Content */}
                <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center items-center text-center md:text-left md:items-start">
                    <div className="max-w-lg">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Welcome to Our CBX AI Tool
                        </h1>
                        <p className="text-gray-600 mb-6 text-base sm:text-lg">
                            Your workspace is ready. Navigate using the sidebar to explore all available features.
                        </p>

                        <Button
                            onClick={() => navigate("/dashboard")}
                            className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-red-500 hover:bg-red-700"
                        >
                            Get Started <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Right Section - Human Image */}
                <div className="w-full md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
                    <img
                        draggable="false"
                        src="/Banner.jpg"
                        alt="Image"
                        className="object-contain w-full h-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default AfterLoginHomePage;
