import {
    LogOut,
    FilePlus,
    Rocket,
    X,
    FileText,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { useData } from "@/context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

function AppSidebarDrawer() {
    const nav = useNavigate();
    const location = useLocation();
    const { userAuth, setUserAuth, adminAuth, setAdminAuth, mobileMenuOpen, setMobileMenuOpen } = useData();
    const isToolsPage = location.pathname.startsWith("/tools/");
    const isReportPage = location.pathname.startsWith("/reports/");
    const [isMobile, setIsMobile] = useState(false);


    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);


    const handleLogoutAdmin = () => {
        localStorage.removeItem("adminToken");
        setAdminAuth({
            user: null,
            token: null,
            isLoading: false
        });
        toast.success("Logout successful");
        nav("/admin/login");
        if (isMobile) setMobileMenuOpen(false);
    };


    const handleUserLogout = () => {
        localStorage.removeItem("userToken");
        setUserAuth(prev => ({
            ...prev,
            user: null,
            token: null
        }));
        toast.success("Logout successful");
        nav("/login");
        if (isMobile) setMobileMenuOpen(false);
    };


    const handleMenuItemClick = () => {
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };


    if (isMobile) {
        return (
            <>
                <div
                    className={clsx(
                        "fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out",
                        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="flex flex-col h-full">
                        {/* Top: Logo */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <h1 className="text-lg font-bold text-primary-red">CEOITBOX AI</h1>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="bg-white shadow-md text-black"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <X size={24} />
                            </Button>
                        </div>

                        {/* Menu Items */}
                        <ScrollArea className="flex-1 p-4">
                            {userAuth?.token && (
                                <div className="space-y-4">
                                    <Link to="/dashboard" onClick={handleMenuItemClick}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
                                            style={{
                                                background: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "rgb(229 9 20)" : "",
                                                color: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "#fff" : "black"
                                            }}
                                        >
                                            <FilePlus size={22} />
                                            Generate Plans
                                        </Button>
                                    </Link>

                                    <Link to="/astro-disc" onClick={handleMenuItemClick}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
                                            style={{
                                                background: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "rgb(229 9 20)" : "",
                                                color: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "#fff" : "black"
                                            }}
                                        >
                                            <Rocket size={22} />
                                            AstroDISC
                                        </Button>
                                    </Link>

                                    <Link to="/document-reader" onClick={handleMenuItemClick}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
                                            style={{ background: (location.pathname === "/document-reader" || location.pathname === "/document-reader") ? "rgb(229 9 20)" : "", color: (location.pathname === "/document-reader" || location.pathname === "/document-reader") ? "#fff" : "black" }}
                                        >
                                            <FileText size={22} />
                                            Document Reader
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {adminAuth?.token && (
                                <div className="space-y-4">
                                    <Link to="/admin" onClick={handleMenuItemClick}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
                                            style={{
                                                background: location.pathname === "/admin" ? "rgb(229 9 20)" : "",
                                                color: location.pathname === "/admin" ? "#fff" : "black"
                                            }}
                                        >
                                            <FilePlus size={22} />
                                            Plan Dashboard
                                        </Button>
                                    </Link>

                                    <Link to="/astro-disc-dashboard" onClick={handleMenuItemClick}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
                                            style={{
                                                background: location.pathname === "/astro-disc-dashboard" ? "rgb(229 9 20)" : "",
                                                color: location.pathname === "/astro-disc-dashboard" ? "#fff" : "black"
                                            }}
                                        >
                                            <Rocket size={22} />
                                            Astro dashboard
                                        </Button>
                                    </Link>

                                    <Link to="/document-reader-settings" onClick={handleMenuItemClick}>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
                                            style={{
                                                background: location.pathname === "/document-reader-settings" ? "rgb(229 9 20)" : "",
                                                color: location.pathname === "/document-reader-settings" ? "#fff" : "black"
                                            }}
                                        >
                                            <FileText size={22} />
                                            Document Reader
                                        </Button>
                                    </Link>


                                </div>
                            )}
                        </ScrollArea>

                        {/* User Info + Logout */}
                        <div className="p-4 border-t">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar>
                                    <AvatarFallback className="bg-red-600 text-white">
                                        {userAuth?.user?.userName?.charAt(0) || adminAuth?.user?.userName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <div className="font-medium">{userAuth?.user?.userName || adminAuth?.user?.userName}</div>
                                    <div className="text-xs text-gray-500">{userAuth?.user?.email || adminAuth?.user?.email}</div>
                                </div>
                            </div>

                            <Link to="/profile" onClick={handleMenuItemClick}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black mb-4"
                                    style={{
                                        background: location.pathname === "/profile" ? "rgb(229 9 20)" : "",
                                        color: location.pathname === "/profile" ? "#fff" : "black"
                                    }}
                                >
                                    <User size={22} />
                                    Profile Settings
                                </Button>
                            </Link>

                            <Button
                                onClick={userAuth?.token ? handleUserLogout : handleLogoutAdmin}
                                variant="ghost"
                                className="w-full justify-start gap-3 text-lg py-6 text-red-600 hover:bg-red-100"
                            >
                                <LogOut size={22} />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

}

export default AppSidebarDrawer;