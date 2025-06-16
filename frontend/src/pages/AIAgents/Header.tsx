import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button'
import { useData } from '@/context/AppContext';
import { ArrowLeft, History, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

const Header = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { setUserAuth, mobileMenuOpen, setMobileMenuOpen } = useData();
    const [isMobile, setIsMobile] = useState(false);
    const isSpecificAgentPage = location.pathname !== "/ai-agents";

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
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

    return (
        <header className="bg-black text-white p-4 lg:px-10 md:px-4 shadow-md">
            <div className="mx-auto flex justify-between items-center">
                {isMobile && <Logo size="sm" />}

                {!isMobile &&
                    <div>
                        {isSpecificAgentPage &&

                            <Button onClick={() => {
                                nav("/ai-agents");
                            }}
                                style={{ minWidth: "100px", color: "#ffffff", border: "none" }}
                                className="bg-primary-red  hover:bg-red-700 transition-colors duration-200"
                                variant="ghost">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        }
                    </div>
                }

                <div className="flex items-center gap-4">
                    {/* {!isSpecificAgentPage && */}
                    {/* // <DropdownMenu> */}
                    {/* // <DropdownMenuTrigger asChild> */}

                    <Link to="/generated-agents">
                        <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white">
                            <History className="w-5 h-5 mr-2" />
                            Generated Agents
                        </Button>
                    </Link>

                    {/* // </DropdownMenuTrigger> */}
                    {/* <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => nav("/ai-agents/zoomary/history")}>
                                    Zoom AI History
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => nav("/ai-agents/company-profile/history")}>
                                    Company Profile History
                                </DropdownMenuItem>

                            </DropdownMenuContent> */}
                    {/* </DropdownMenu> */}

                    {/* // } */}

                    <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
                        onClick={() => {
                            localStorage.removeItem("userToken");
                            setUserAuth({
                                user: null,
                                token: null,
                                isLoading: false
                            });
                            toast.success("Logout successful");
                            nav("/login");
                        }}
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                    </Button>

                    {isMobile && <MobileMenuButton />}
                </div>
            </div>
        </header >
    );
};

export default Header;