// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { ArrowRight } from "lucide-react";
// import { Logo } from "@/components/logo";

// const HomePage = () => {
//     const navigate = useNavigate();


//     return (
//         <div style={{ position: "relative" }}>
//             <div style={{ position: "absolute" }} className="p-8">
//                 <Logo size="lg" className="mb-8" />
//             </div>
//             <div className="min-h-screen bg-black text-white flex flex-col">
//                 {/* <Header /> */}

//                 <div className="flex-grow flex flex-col md:flex-row" >
//                     <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
//                         <div className="max-w-lg animate-fadeIn">
//                             {/* <Logo size="lg" className="mb-8" /> */}
//                             <h1 className="text-4xl md:text-5xl font-bold mb-6">
//                                 Master Your Business with AI
//                             </h1>
//                             <p className="text-xl text-gray-300 mb-8">
//                                 Generate professional business plans, weekly schedules, and more with the power of artificial intelligence.
//                             </p>
//                             <Button
//                                 onClick={() => navigate("/login")}
//                                 className="text-lg px-8 py-6 bg-red-500 hover:bg-red-700"
//                             >
//                                 Get Started <ArrowRight className="ml-2" />
//                             </Button>
//                         </div>
//                     </div>

//                     <div className="w-full md:w-1/2 bg-white  p-8 md:p-16 flex flex-col justify-center" >
//                         <div className="max-w-lg mx-auto flex items-center justify-center h-full">
//                             <img
//                                 draggable="false"
//                                 src="/Banner.jpg"
//                                 // src="https://ceoitbox.com/wp-content/uploads/2022/05/Sanjeev-Jain-3.png.webp"
//                                 alt="Business Professional"
//                                 className="max-w-full h-auto animate-fadeIn animation-delay-200"
//                             />
//                         </div>
//                     </div>
//                 </div>


//             </div>
//         </div>
//     );
// };

// export default HomePage;


import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ position: "relative" }}>
            <div style={{ position: "absolute" }} className="p-8">
                <Logo size="lg" className="mb-8" />
            </div>
            <div className="min-h-screen bg-black text-white flex flex-col">
                <div className="flex-grow flex flex-col md:flex-row">
                    {/* Left Section */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-16">
                        <div className="max-w-lg animate-fadeIn">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                Master Your Business with AI
                            </h1>
                            <p className="text-xl text-gray-300 mb-8">
                                Generate professional business plans, weekly schedules, and more with the power of artificial intelligence.
                            </p>
                            <Button
                                onClick={() => navigate("/login")}
                                className="text-lg px-8 py-6 bg-red-500 hover:bg-red-700"
                            >
                                Get Started <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Section with fixed image styling */}
                    <div className="w-full md:w-1/2 ">
                        <img
                            draggable="false"
                            src="/Banner.jpg"
                            alt="Business Professional"
                            className="w-full h-full object-fill"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
