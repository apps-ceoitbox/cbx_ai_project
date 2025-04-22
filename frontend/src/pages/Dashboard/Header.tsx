// import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { useData } from '@/context/AppContext'
import { FilePlus, LayoutDashboard, LogOut, } from 'lucide-react' //Menu, X
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Header = () => {
    const nav = useNavigate();
    const location = useLocation();
    const { setUserAuth,
        //  mobileMenuOpen, setMobileMenuOpen
    } = useData();
    const [isMobile, setIsMobile] = useState(false);

    const isToolsPage = location.pathname.startsWith("/tools/");


    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        // Initial check
        checkScreenSize();
        // Add resize listener
        window.addEventListener('resize', checkScreenSize);
        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // const MobileMenuButton = () => (
    //     <Button
    //         variant="ghost"
    //         size="icon"
    //         className="bg-white shadow-md text-black"
    //         onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    //     >
    //         {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    //     </Button>
    // );


    return (
        <header className="bg-black text-white p-4  lg:px-10 md:px-4 shadow-md"
        >
            <div className="mx-auto flex justify-between items-center">
                {/* {isMobile ? <Logo size="sm" /> : <div></div>} */}
                <div></div>

                <div className="flex items-center gap-4">

                    {location.pathname !== "/dashboard" &&
                        <Button variant="outline" className=" text-black border-white hover:bg-primary-red hover:text-white"
                            onClick={() => {
                                nav("/dashboard")
                            }}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            {isMobile ? "" : "Dashboard"}

                        </Button>
                    }

                    {location.pathname !== "/generated-plans" && !isToolsPage &&
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
                        onClick={() => {
                            localStorage.removeItem("userToken")
                            setUserAuth(p => ({ ...p, user: null, token: null }))
                            toast.success("Logout successful")
                            nav("/login")
                        }}>
                        <LogOut className="w-5 h-5" />

                        {isMobile ? "" : "Logout"}
                    </Button>

                    {/* {isMobile &&
                        <MobileMenuButton />
                    } */}
                </div>
            </div>
        </header>
    )
}

export default Header