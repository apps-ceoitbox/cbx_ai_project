import LogoutConfirmationModal from '@/components/Custom/LogoutConfirmationModal';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button'
import { useData } from '@/context/AppContext';
import { ArrowLeft, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';

const Header = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { setUserAuth, mobileMenuOpen, setMobileMenuOpen } = useData();
    const [isMobile, setIsMobile] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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

    const handleLogout = () => {
        localStorage.removeItem("userToken")
        setUserAuth(p => ({ ...p, user: null, token: null }))
        toast.success("Logout successful")
        nav("/login")
    }


    return (
        <header className="bg-black text-white p-4  lg:px-10 md:px-4  shadow-md"
        >
            <div className="mx-auto flex justify-between items-center">
                {isMobile && <Logo size="sm" />}

                {!isMobile &&
                    <div>
                        {location.pathname === "/astro-reports" &&
                            <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                                onClick={() => {
                                    nav(-1);
                                }}
                            >
                                <ArrowLeft className="w-5 h-5 " />

                                {isMobile ? "" : "Back"}
                            </Button>
                        }
                    </div>
                }

                <div className="flex items-center gap-4">


                    {
                        isMobile &&
                        location.pathname === "/astro-reports" &&
                        <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                            onClick={() => {
                                nav(-1);
                            }}
                        >
                            <ArrowLeft className="w-5 h-5 " />
                            {isMobile ? "" : "Back"}
                        </Button>
                    }


                    {location.pathname !== "/astro-reports" &&
                        <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                            onClick={() => {
                                nav("/astro-reports")
                            }}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            {isMobile ? "" : "Dashboard"}
                        </Button>
                    }


                    <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
                        onClick={() => setShowLogoutModal(true)}>
                        <LogOut className="w-5 h-5" />
                        {isMobile ? "" : "Logout"}
                    </Button>

                    {isMobile &&
                        <MobileMenuButton />
                    }
                </div>
            </div>


            <LogoutConfirmationModal
                open={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </header >
    )
}

export default Header; 
