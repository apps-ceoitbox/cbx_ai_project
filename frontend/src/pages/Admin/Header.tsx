import LogoutConfirmationModal from '@/components/Custom/LogoutConfirmationModal'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useData } from '@/context/AppContext'
import { LayoutDashboard, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Header = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { setAdminAuth } = useData();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("adminToken")
        setAdminAuth({
            user: null,
            token: null,
            isLoading: false
        })
        toast.success("Logout successful")
        nav("/admin/login")
    }

    return (
        <div>
            <header className="bg-black text-white p-4 px-10  shadow-md">
                <div className="mx-auto flex justify-between items-center">
                    <Logo size="sm" />
                    <div className="flex items-center gap-4">
                        {location.pathname === "/astro-disc-dashboard" ?
                            <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                                onClick={() => {
                                    nav("/admin")
                                }}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Plans Dashboard
                            </Button>
                            :
                            <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                                onClick={() => {
                                    nav("/astro-disc-dashboard")
                                }}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                Astro Dashboard
                            </Button>
                        }
                        <Button
                            variant="outline"
                            className="bg-transparent text-white border-white hover:bg-primary-red hover:text-white"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <LogoutConfirmationModal
                open={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </div>
    )
}

export default Header