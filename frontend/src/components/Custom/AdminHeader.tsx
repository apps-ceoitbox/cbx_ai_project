import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button'
import { useData } from '@/context/AppContext';
import { LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner';
import LogoutConfirmationModal from './LogoutConfirmationModal';

const AdminHeader = () => {
    const nav = useNavigate();
    const { setAdminAuth, mobileMenuOpen, setMobileMenuOpen } = useData();
    const [isMobile, setIsMobile] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    console.log(isMobile)

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

    const handleLogoutAdmin = () => {
        localStorage.removeItem("adminToken");
        setAdminAuth({
            user: null,
            token: null,
            isLoading: false
        })
        toast.success("Logout successful");
        nav("/admin/login")
    }


    return (
        <header className="bg-black text-white p-4  lg:px-10 md:px-4  shadow-md"
        >
            <div className="mx-auto flex justify-between items-center">
                <Logo size="sm" />

                <div className="flex items-center gap-4">
                    <Button variant="outline" className="text-black border-white hover:bg-primary-red hover:text-white"
                        onClick={() => setShowLogoutModal(true)}>
                        <LogOut className="w-5 h-5" />
                    </Button>

                    <MobileMenuButton />

                </div>
            </div>

            <LogoutConfirmationModal
                open={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogoutAdmin}
            />
        </header >
    )
}

export default AdminHeader;