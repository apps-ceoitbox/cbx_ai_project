
import React from "react"
import { useLocation } from "react-router-dom"

const Footer: React.FC = () => {
    const location = useLocation();



    return (
        <footer className="bg-white text-[#000] p-6 border-t border-gray-800">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    {/* Left Section */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-black">CEO<span className="text-red-500">IT</span>BOX</h3>
                        <p className="max-w-md">
                            Digital Transformation Program for Indian business owners seeking to transform and scale operations with AI
                        </p>
                    </div>


                    {location.pathname === "/login" ?
                        <div></div> :
                        <div className="flex-1 mt-6 md:mt-0 text-center">
                            <p>© 2025 CEOITBOX. All rights reserved.</p>
                        </div>
                    }

                    {/* Right Section */}
                    <div className="flex-1 text-right">
                        <p className="mb-1">Email: siddharth@ceoitbox.in</p>
                        <p className="mb-1">Call: 8766362949 | 98111 48346</p>
                        <p>
                            Website: <a href="https://www.masterbusiness.in" className="text-ceo-red hover:underline" target="_blank" rel="noopener noreferrer">www.masterbusiness.in</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer >
    )
}

export default Footer

