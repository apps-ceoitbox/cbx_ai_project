
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Logo } from "@/components/logo";

const Header: React.FC = () => {
    // const { user, logout, isAdmin } = useAuth();

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <Logo />
                </Link>

                {/* {user ? (
                    <div className="flex items-center gap-4">

              {isAdmin && (
                            <Link to="/admin">
                                <Button variant="outline" className="border-ceo-red text-ceo-red hover:bg-ceo-red hover:text-white">
                                    Dashboard
                                </Button>
                            </Link>
                        )} 

              {isAdmin && (
                            <Link to="/admin/settings">
                                <Button variant="outline" className="border-ceo-red text-ceo-red hover:bg-ceo-red hover:text-white">
                                    Settings
                                </Button>
                            </Link>
                        )} 
              <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-gray-600">{user.company}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div> 
               </div>  */}

                {/* ) : ( */}
                <Link to="/login">
                    <Button className="bg-red-500 hover:bg-red-700">
                        <User className="mr-2 h-4 w-4" /> Login
                    </Button>
                </Link>
                {/* )} */}
            </div>
        </header>
    );
};

export default Header;
