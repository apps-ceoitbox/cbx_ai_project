import LogoutConfirmationModal from '@/components/Custom/LogoutConfirmationModal'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useData } from '@/context/AppContext'
import { FilePlus, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner';

const Header = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { setUserAuth, mobileMenuOpen, setMobileMenuOpen, setAuditAuth } = useData();
    const [isMobile, setIsMobile] = useState(false);
    const isToolsPage = location.pathname.startsWith("/tools/");
    const isAuditToolsPage = location.pathname.startsWith("/audit-tools/");
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
        localStorage.removeItem("userToken");
        localStorage.removeItem("auditToken");
        setUserAuth(p => ({ ...p, user: null, token: null }))
        setAuditAuth(p => ({ ...p, user: null, token: null }))
        toast.success("Logout successful")
        nav("/login")
    }

    return (
        <header className="bg-black text-white p-4  lg:px-10 md:px-4 shadow-md"
        >
            <div className="mx-auto flex justify-between items-center">
                {isMobile ? <Logo size="sm" /> : <div></div>}


                <div className="flex items-center gap-4">

                    {location.pathname !== "/dashboard" && !isAuditToolsPage &&
                        <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                            onClick={() => {
                                nav("/dashboard")
                            }}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            {isMobile ? "" : "Dashboard"}

                        </Button>
                    }

                    {location.pathname !== "/generated-plans" && !isToolsPage && !isAuditToolsPage &&
                        <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
                            onClick={() => {
                                nav("/generated-plans")
                            }}
                        >
                            <FilePlus className="w-5 h-5" />
                            {isMobile ? "" : "Generated Plans"}
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

export default Header