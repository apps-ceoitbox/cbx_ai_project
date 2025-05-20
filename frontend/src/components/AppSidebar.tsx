// import {
//     LogOut,
//     ChevronLeft,
//     ChevronRight,
//     FilePlus,
//     Rocket,
//     FileText,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import clsx from "clsx";
// import { useData } from "@/context/AppContext";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { toast } from "sonner";

// function AppSidebar({ collapsed, setCollapsed }) {
//     const nav = useNavigate();
//     const location = useLocation();
//     const { userAuth, setUserAuth, adminAuth, setAdminAuth } = useData();
//     const isToolsPage = location.pathname.startsWith("/tools/");
//     const isReportPage = location.pathname.startsWith("/reports/");


//     const handleLogoutAdmin = () => {
//         localStorage.removeItem("adminToken");
//         setAdminAuth({
//             user: null,
//             token: null,
//             isLoading: false
//         })
//         toast.success("Logout successful");
//         nav("/admin/login")
//     }

//     const handleUserLogout = () => {
//         localStorage.removeItem("userToken");
//         setUserAuth(prev => ({
//             ...prev,
//             user: null,
//             token: null
//         }));
//         toast.success("Logout successful");
//         nav("/login");
//     };

//     return (
//         <div
//             className={clsx(
//                 "h-screen bg-white text-black border-r flex flex-col fixed top-0 left-0 z-50 transition-all duration-300",
//                 collapsed ? "w-20" : "w-60"
//             )}
//         >
//             {/* Top: Logo & Toggle */}
//             <div className="flex items-center justify-between p-4 border-b">
//                 <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full ">
//                         <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
//                     </div>
//                     {!collapsed && <h1 className="text-lg font-bold text-primary-red">CEOITBOX AI</h1>}
//                 </div>
//                 <Button
//                     size="icon"
//                     variant="ghost"
//                     className="text-black"
//                     onClick={() => setCollapsed(!collapsed)}
//                 >
//                     {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
//                 </Button>
//             </div>

//             {/* Menu Section */}
//             <ScrollArea className="flex-1 px-2 py-3">

//                 {userAuth?.token &&
//                     <div className="space-y-2">
//                         <Link to="/dashboard">
//                             <Button
//                                 variant="ghost"
//                                 className="w-full justify-start gap-2 hover:bg-red-100 text-black"
//                                 style={{ background: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "rgb(229 9 20)" : "", color: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "#fff" : "black" }}
//                             >
//                                 <FilePlus size={18} />
//                                 {!collapsed && "Generate Plans"}
//                             </Button>
//                         </Link>

//                         <Link to="/astro-disc">
//                             <Button
//                                 variant="ghost"
//                                 className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
//                                 style={{ background: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "rgb(229 9 20)" : "", color: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "#fff" : "black" }}
//                             >
//                                 <Rocket size={18} />
//                                 {!collapsed && "AstroDISC"}
//                             </Button>
//                         </Link>

//                         <Link to="/document-reader">
//                             <Button
//                                 variant="ghost"
//                                 className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
//                                 style={{ background: (location.pathname === "/document-reader" || location.pathname === "/documents-dashboard") ? "rgb(229 9 20)" : "", color: (location.pathname === "/document-reader" || location.pathname === "/documents-dashboard") ? "#fff" : "black" }}
//                             >
//                                 <FileText size={18} />
//                                 {!collapsed && "Document Reader"}
//                             </Button>
//                         </Link>

//                     </div>
//                 }

//                 {adminAuth?.token &&
//                     <div className="space-y-2">

//                         <Link to="/admin">
//                             <Button
//                                 variant="ghost"
//                                 className="w-full justify-start gap-2 hover:bg-red-100 text-black"
//                                 style={{ background: location.pathname === "/admin" ? "rgb(229 9 20)" : "", color: location.pathname === "/admin" ? "#fff" : "black" }}
//                             >
//                                 <FilePlus className="w-5 h-5" />
//                                 {!collapsed && "Plan Dashboard"}
//                             </Button>
//                         </Link>

//                         <Link to="/astro-disc-dashboard">
//                             <Button
//                                 variant="ghost"
//                                 className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
//                                 style={{ background: location.pathname === "/astro-disc-dashboard" ? "rgb(229 9 20)" : "", color: location.pathname === "/astro-disc-dashboard" ? "#fff" : "black" }}
//                             >
//                                 <Rocket className="w-5 h-5" />
//                                 {!collapsed && "Astro dashboard"}
//                             </Button>
//                         </Link>


//                         <Link to="/document-reader-settings">
//                             <Button
//                                 variant="ghost"
//                                 className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
//                                 style={{ background: (location.pathname === "/document-reader-settings") ? "rgb(229 9 20)" : "", color: (location.pathname === "/document-reader-settings") ? "#fff" : "black" }}
//                             >
//                                 <FileText size={18} />
//                                 {!collapsed && "Document Reader"}
//                             </Button>
//                         </Link>
//                     </div>
//                 }
//             </ScrollArea>

//             {/* Bottom Section: User Info + Logout */}
//             <div className="p-4 border-t">
//                 <div className="flex items-center gap-3">
//                     <Avatar>
//                         <AvatarFallback className="bg-red-600 text-white">
//                             {userAuth?.user?.userName.charAt(0) || adminAuth?.user?.userName.charAt(0)}
//                         </AvatarFallback>
//                     </Avatar>

//                     {!collapsed && (
//                         <div className="text-sm">
//                             <div className="font-medium">{userAuth?.user?.userName || adminAuth?.user?.userName}</div>
//                             <div className="text-xs text-gray-500">{userAuth?.user?.email || adminAuth?.user?.email}</div>
//                         </div>
//                     )}
//                 </div>
//                 <Button
//                     onClick={userAuth?.token ? handleUserLogout : handleLogoutAdmin}
//                     variant="ghost"
//                     className="w-full justify-start gap-2 mt-3 text-red-600 hover:bg-red-100"
//                 >
//                     <LogOut size={18} />
//                     {!collapsed && "Logout"}
//                 </Button>
//             </div>
//         </div>
//     );
// }

// export default AppSidebar; 

import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    FilePlus,
    Rocket,
    FileText,
    User,
    Shield,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import clsx from "clsx";
import { useData } from "@/context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

function AppSidebar({ collapsed, setCollapsed }) {
    const nav = useNavigate();
    const location = useLocation();
    const { userAuth, setUserAuth, adminAuth, setAdminAuth } = useData();
    // const isToolsPage = location.pathname.startsWith("/tools/");
    // const isReportPage = location.pathname.startsWith("/reports/");
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

    // Check if both auth types are present
    const hasBothAuth = userAuth?.token && adminAuth?.token;

    const handleLogoutAdmin = () => {
        localStorage.removeItem("adminToken");
        setAdminAuth({
            user: null,
            token: null,
            isLoading: false
        });
        toast.success("Admin logout successful");
        nav("/admin/login");
    };

    const handleUserLogout = () => {
        localStorage.removeItem("userToken");
        setUserAuth(prev => ({
            ...prev,
            user: null,
            token: null
        }));
        toast.success("User logout successful");
        nav("/login");
    };

    const handleUserAndAdminLogout = () => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("adminToken");
        setUserAuth({
            user: null,
            token: null,
            isLoading: false
        });
        setAdminAuth({
            user: null,
            token: null,
            isLoading: false
        });
        toast.success("Logout successful");
        nav("/login");
    };

    // Check if a menu item is active
    const isMenuItemActive = (paths) => {
        if (!Array.isArray(paths)) paths = [paths];
        return paths.some(path =>
            location.pathname === path ||
            (path.endsWith('/') ? location.pathname.startsWith(path) : false)
        );
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
                    <div className="w-10 h-10 rounded-full">
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
                {hasBothAuth ? (
                    <>
                        {/* User Role Menu - Collapsible */}
                        <Collapsible
                            open={isUserMenuOpen}
                            onOpenChange={setIsUserMenuOpen}
                            className="mb-2"
                        >
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between text-black hover:bg-red-100 mb-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <User size={18} />
                                        {!collapsed && "User Menu"}
                                    </div>
                                    {!collapsed && (isUserMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-1 ml-2">
                                <Link to="/dashboard">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                        style={{
                                            background: isMenuItemActive(["/dashboard", "/generated-plans", "/tools/", "/reports/"]) ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive(["/dashboard", "/generated-plans", "/tools/", "/reports/"]) ? "#fff" : "black"
                                        }}
                                    >
                                        <FilePlus size={16} />
                                        {!collapsed && "Generate Plans"}
                                    </Button>
                                </Link>

                                <Link to="/astro-disc">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                        style={{
                                            background: isMenuItemActive(["/astro-disc", "/astro-reports"]) ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive(["/astro-disc", "/astro-reports"]) ? "#fff" : "black"
                                        }}
                                    >
                                        <Rocket size={16} />
                                        {!collapsed && "AstroDISC"}
                                    </Button>
                                </Link>

                                <Link to="/document-reader">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                        style={{
                                            background: isMenuItemActive(["/document-reader", "/documents-dashboard"]) ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive(["/document-reader", "/documents-dashboard"]) ? "#fff" : "black"
                                        }}
                                    >
                                        <FileText size={16} />
                                        {!collapsed && "Document Reader"}
                                    </Button>
                                </Link>
                            </CollapsibleContent>
                        </Collapsible>

                        {/* Admin Role Menu - Collapsible */}
                        <Collapsible
                            open={isAdminMenuOpen}
                            onOpenChange={setIsAdminMenuOpen}
                        >
                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between text-black hover:bg-red-100 mb-1"
                                >
                                    <div className="flex items-center gap-2">
                                        <Shield size={18} />
                                        {!collapsed && "Admin Menu"}
                                    </div>
                                    {!collapsed && (isAdminMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                </Button>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="space-y-1 ml-2">
                                <Link to="/admin">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                        style={{
                                            background: isMenuItemActive("/admin") ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive("/admin") ? "#fff" : "black"
                                        }}
                                    >
                                        <FilePlus size={16} />
                                        {!collapsed && "Plan Dashboard"}
                                    </Button>
                                </Link>

                                <Link to="/astro-disc-dashboard">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                        style={{
                                            background: isMenuItemActive("/astro-disc-dashboard") ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive("/astro-disc-dashboard") ? "#fff" : "black"
                                        }}
                                    >
                                        <Rocket size={16} />
                                        {!collapsed && "Astro Dashboard"}
                                    </Button>
                                </Link>

                                <Link to="/document-reader-settings">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                        style={{
                                            background: isMenuItemActive("/document-reader-settings") ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive("/document-reader-settings") ? "#fff" : "black"
                                        }}
                                    >
                                        <FileText size={16} />
                                        {!collapsed && "Document Reader"}
                                    </Button>
                                </Link>
                            </CollapsibleContent>
                        </Collapsible>
                    </>
                ) : (
                    <>
                        {/* Regular User Menu (when only userAuth is present) */}
                        {userAuth?.token && (
                            <div className="space-y-2">
                                <Link to="/dashboard">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                        style={{
                                            background: isMenuItemActive(["/dashboard", "/generated-plans", "/tools/", "/reports/"]) ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive(["/dashboard", "/generated-plans", "/tools/", "/reports/"]) ? "#fff" : "black"
                                        }}
                                    >
                                        <FilePlus size={18} />
                                        {!collapsed && "Generate Plans"}
                                    </Button>
                                </Link>

                                <Link to="/astro-disc">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                                        style={{
                                            background: isMenuItemActive(["/astro-disc", "/astro-reports"]) ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive(["/astro-disc", "/astro-reports"]) ? "#fff" : "black"
                                        }}
                                    >
                                        <Rocket size={18} />
                                        {!collapsed && "AstroDISC"}
                                    </Button>
                                </Link>

                                <Link to="/document-reader">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                                        style={{
                                            background: isMenuItemActive(["/document-reader", "/documents-dashboard"]) ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive(["/document-reader", "/documents-dashboard"]) ? "#fff" : "black"
                                        }}
                                    >
                                        <FileText size={18} />
                                        {!collapsed && "Document Reader"}
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Regular Admin Menu (when only adminAuth is present) */}
                        {adminAuth?.token && (
                            <div className="space-y-2">
                                <Link to="/admin">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                                        style={{
                                            background: isMenuItemActive("/admin") ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive("/admin") ? "#fff" : "black"
                                        }}
                                    >
                                        <FilePlus size={18} />
                                        {!collapsed && "Plan Dashboard"}
                                    </Button>
                                </Link>

                                <Link to="/astro-disc-dashboard">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                                        style={{
                                            background: isMenuItemActive("/astro-disc-dashboard") ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive("/astro-disc-dashboard") ? "#fff" : "black"
                                        }}
                                    >
                                        <Rocket size={18} />
                                        {!collapsed && "Astro Dashboard"}
                                    </Button>
                                </Link>

                                <Link to="/document-reader-settings">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                                        style={{
                                            background: isMenuItemActive("/document-reader-settings") ? "rgb(229 9 20)" : "",
                                            color: isMenuItemActive("/document-reader-settings") ? "#fff" : "black"
                                        }}
                                    >
                                        <FileText size={18} />
                                        {!collapsed && "Document Reader"}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </ScrollArea>

            {/* Bottom Section: User Info + Logout */}
            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback className="bg-red-600 text-white">
                            {adminAuth?.user?.userName?.charAt(0) || userAuth?.user?.userName?.charAt(0) ||

                                'U'
                            }
                        </AvatarFallback>
                    </Avatar>

                    {!collapsed && (
                        <div className="text-sm">
                            <div className="font-medium">{adminAuth?.user?.userName || userAuth?.user?.userName}</div>
                            <div className="text-xs text-gray-500">{adminAuth?.user?.email || userAuth?.user?.email}</div>
                        </div>
                    )}

                </div>

                {hasBothAuth ? (
                    <div className="space-y-2 mt-3">
                        <Button
                            onClick={handleUserAndAdminLogout}
                            variant="ghost"
                            className="w-full justify-start gap-2 text-red-600 hover:bg-red-100"
                        >
                            <LogOut size={18} />

                            {!collapsed ? "Logout" : ""}
                            {/* {!collapsed && "User Logout"} */}
                        </Button>
                        {/* <Button
                            onClick={handleLogoutAdmin}
                            variant="ghost"
                            className="w-full justify-start gap-2 text-red-600 hover:bg-red-100"
                        >
                            <LogOut size={18} />
                            {!collapsed && "Admin Logout"}
                        </Button> */}
                    </div>
                ) : (
                    <Button
                        onClick={userAuth?.token ? handleUserLogout : handleLogoutAdmin}
                        variant="ghost"
                        className="w-full justify-start gap-2 mt-3 text-red-600 hover:bg-red-100"
                    >
                        <LogOut size={18} />
                        {!collapsed && "Logout"}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default AppSidebar;