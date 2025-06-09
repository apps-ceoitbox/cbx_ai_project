import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button'
import { useData } from '@/context/AppContext';
import { ArrowLeft, History, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
                            <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
                                onClick={() => {
                                    nav("/ai-agents");
                                }}
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to AI Agents
                            </Button>
                        }
                    </div>
                }

                <div className="flex items-center gap-4">
                    {!isSpecificAgentPage &&
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white">
                                    <History className="w-5 h-5 mr-2" />
                                    Generated Histories
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => nav("/ai-agents/zoomary/history")}>
                                    Zoomary AI History
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => nav("/ai-agents/company-profile/history")}>
                                    Company Profile History
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem onClick={() => nav("/ai-agents/mail/history")}>
                                    Mail History
                                </DropdownMenuItem> */}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    }

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
        </header>
    );
};

export default Header;