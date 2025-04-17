import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    FilePlus,
    Rocket,
    LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import clsx from "clsx";
import { useData } from "@/context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

function AppSidebar({ collapsed, setCollapsed }) {
    const nav = useNavigate();
    const location = useLocation();
    const { userAuth, setUserAuth, adminAuth, setAdminAuth } = useData();
    const isToolsPage = location.pathname.startsWith("/tools/");
    const isReportPage = location.pathname.startsWith("/reports/");


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

    const handleUserLogout = () => {
        localStorage.removeItem("userToken");
        setUserAuth(prev => ({
            ...prev,
            user: null,
            token: null
        }));
        toast.success("Logout successful");
        nav("/login");
    };

    return (
        <div
            className={clsx(
                "h-screen bg-white text-black border-r flex flex-col fixed top-0 left-0 z-50 transition-all duration-300",
                collapsed ? "w-20" : "w-60"
            )}
        >
            {/* Top: Logo & Toggle */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full ">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    {!collapsed && <h1 className="text-lg font-bold text-primary-red">CEOITBOX AI</h1>}
                </div>
                <Button
                    size="icon"
                    variant="ghost"
                    className="text-black"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </Button>
            </div>

            {/* Menu Section */}
            <ScrollArea className="flex-1 px-2 py-3">

                {userAuth?.token &&
                    <div className="space-y-2">
                        <Link to="/dashboard">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                style={{ background: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "rgb(229 9 20)" : "", color: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "#fff" : "black" }}
                            >
                                <FilePlus size={18} />
                                {!collapsed && "Generate Plans"}
                            </Button>
                        </Link>

                        <Link to="/astro-disc">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                                style={{ background: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "rgb(229 9 20)" : "", color: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "#fff" : "black" }}
                            >
                                <Rocket size={18} />
                                {!collapsed && "AstroDISC"}
                            </Button>
                        </Link>
                    </div>
                }

                {adminAuth?.token &&
                    <div className="space-y-2">

                        <Link to="/admin">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                style={{ background: location.pathname === "/admin" ? "rgb(229 9 20)" : "", color: location.pathname === "/admin" ? "#fff" : "black" }}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                {!collapsed && "Plan Dashboard"}
                            </Button>
                        </Link>

                        <Link to="/astro-disc-dashboard">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                                style={{ background: location.pathname === "/astro-disc-dashboard" ? "rgb(229 9 20)" : "", color: location.pathname === "/astro-disc-dashboard" ? "#fff" : "black" }}
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                {!collapsed && "Astro dashboard"}
                            </Button>
                        </Link>

                    </div>
                }
            </ScrollArea>

            {/* Bottom Section: User Info + Logout */}
            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback className="bg-red-600 text-white">
                            {userAuth?.user?.userName.charAt(0) || adminAuth?.user?.userName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    {!collapsed && (
                        <div className="text-sm">
                            <div className="font-medium">{userAuth?.user?.userName || adminAuth?.user?.userName}</div>
                            <div className="text-xs text-gray-500">{userAuth?.user?.email || adminAuth?.user?.email}</div>
                        </div>
                    )}
                </div>
                <Button
                    onClick={userAuth?.token ? handleUserLogout : handleLogoutAdmin}
                    variant="ghost"
                    className="w-full justify-start gap-2 mt-3 text-red-600 hover:bg-red-100"
                >
                    <LogOut size={18} />
                    {!collapsed && "Logout"}
                </Button>
            </div>
        </div>
    );
}

export default AppSidebar;
