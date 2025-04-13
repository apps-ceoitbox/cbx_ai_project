
import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    color?: string
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "md", color = "black" }) => {
    const sizeClasses = {
        sm: "h-8",
        md: "h-12",
        lg: "h-16"
    };

    return (
        <>
            <Link to="/">
                <div className={`flex items-center ${className}`}>
                    <img
                        src="/logo.png"
                        alt="CEOITBOX Logo"
                        className={`${sizeClasses[size]} w-auto`}
                    />
                    <span className="ml-2 font-bold text-xl">
                        <span className={`text-${color}`}>CEO</span>
                        <span className="text-ceo-red">IT</span>
                        <span className={`text-${color}`}>BOX</span>
                        <span className={`text-${color}`}>AI</span>
                    </span>

                </div>
            </Link>
        </>
    );
};

export default Logo;
