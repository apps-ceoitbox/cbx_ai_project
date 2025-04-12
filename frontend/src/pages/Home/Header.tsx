
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Logo } from "@/components/logo";

const Header: React.FC = () => {


    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <Logo size="" />
                </Link>


                <Link to="/login">
                    <Button className="bg-red-500 hover:bg-red-700">
                        <User className="mr-2 h-4 w-4" /> Login
                    </Button>
                </Link>

            </div>
        </header>
    );
};

export default Header;
