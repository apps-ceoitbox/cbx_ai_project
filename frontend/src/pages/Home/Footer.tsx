import React from "react";
import { useLocation } from "react-router-dom";

const Footer: React.FC = () => {
    const location = useLocation();

    return (
        <footer className="bg-white text-gray-800 py-4 px-4 sm:px-6 border-t">
            <div className="container mx-auto">
                <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-0 lg:flex-row lg:justify-between">
                    {/* Left Section */}
                    <div className="w-full lg:w-1/3">
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-black">
                            CEO<span className="text-red-500">IT</span>BOX
                        </h3>
                        <p className="text-sm sm:text-base max-w-xs sm:max-w-md">
                            Digital Transformation Program for Indian business owners seeking to transform and scale operations with AI
                        </p>
                    </div>

                    {/* Center Section - Conditional rendering */}
                    {location.pathname === "/login" ?
                        <div></div> :
                        <div style={{ display: "flex", alignItems: "end", justifyContent: "center" }} className="w-full lg:w-1/3 lg:text-center sm:text-start lg:justify-center sm:justify-start">
                            <p className="text-sm sm:text-base">© 2025 CEOITBOX. All rights reserved.</p>
                        </div>
                    }


                    {/* Right Section */}
                    <div className="w-full lg:w-1/3 text-left lg:text-right">
                        <p className="text-sm sm:text-base mb-1">Email: siddharth@ceoitbox.in</p>
                        <p className="text-sm sm:text-base mb-1">Call: 8766362949 | 98111 48346</p>
                        <p className="text-sm sm:text-base">
                            Website:{" "}
                            <a
                                href="https://www.masterbusiness.in"
                                className="text-red-500 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                www.masterbusiness.in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

