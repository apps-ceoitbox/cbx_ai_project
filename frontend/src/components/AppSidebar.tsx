import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    FilePlus,
    Rocket,
    FileText,
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


                        <Link to="/document-reader">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                                style={{ background: (location.pathname === "/document-reader" || location.pathname === "/document-reader") ? "rgb(229 9 20)" : "", color: (location.pathname === "/document-reader" || location.pathname === "/document-reader") ? "#fff" : "black" }}
                            >
                                <FileText size={18} />
                                {!collapsed && "Document Reader"}
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
                                <FilePlus className="w-5 h-5" />
                                {!collapsed && "Plan Dashboard"}
                            </Button>
                        </Link>

                        <Link to="/astro-disc-dashboard">
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                                style={{ background: location.pathname === "/astro-disc-dashboard" ? "rgb(229 9 20)" : "", color: location.pathname === "/astro-disc-dashboard" ? "#fff" : "black" }}
                            >
                                <Rocket className="w-5 h-5" />
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

// --------- ----------- -------------------- -------------------- --------------

// import {
//     LogOut,
//     ChevronLeft,
//     ChevronRight,
//     FilePlus,
//     Rocket,
//     Menu,
//     X
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import clsx from "clsx";
// import { useData } from "@/context/AppContext";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import { useEffect, useState } from "react";

// function AppSidebar({ collapsed, setCollapsed }) {
//     const nav = useNavigate();
//     const location = useLocation();
//     const { userAuth, setUserAuth, adminAuth, setAdminAuth } = useData();
//     const isToolsPage = location.pathname.startsWith("/tools/");
//     const isReportPage = location.pathname.startsWith("/reports/");
//     const [isMobile, setIsMobile] = useState(false);
//     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//     // Check screen size on mount and window resize
//     useEffect(() => {
//         const checkScreenSize = () => {
//             setIsMobile(window.innerWidth < 768);
//         };
//         // Initial check
//         checkScreenSize();
//         // Add resize listener
//         window.addEventListener('resize', checkScreenSize);
//         // Cleanup
//         return () => window.removeEventListener('resize', checkScreenSize);
//     }, []);

//     const handleLogoutAdmin = () => {
//         localStorage.removeItem("adminToken");
//         setAdminAuth({
//             user: null,
//             token: null,
//             isLoading: false
//         });
//         toast.success("Logout successful");
//         nav("/admin/login");
//         if (isMobile) setMobileMenuOpen(false);
//     };

//     const handleUserLogout = () => {
//         localStorage.removeItem("userToken");
//         setUserAuth(prev => ({
//             ...prev,
//             user: null,
//             token: null
//         }));
//         toast.success("Logout successful");
//         nav("/login");
//         if (isMobile) setMobileMenuOpen(false);
//     };

//     const handleMenuItemClick = () => {
//         if (isMobile) {
//             setMobileMenuOpen(false);
//         }
//     };

//     // Mobile hamburger menu button
//     const MobileMenuButton = () => (
//         <Button
//             variant="ghost"
//             size="icon"
//             className="md:hidden fixed top-4 right-4 z-50 bg-white shadow-md"
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//         >
//             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//         </Button>
//     );

//     // If on mobile, render the collapsible mobile menu
//     if (isMobile) {
//         return (
//             <>
//                 <MobileMenuButton />

//                 {/* Mobile logo when menu is closed */}
//                 {!mobileMenuOpen && (
//                     <div className="fixed top-0 left-0 p-4 z-40 flex items-center">
//                         <div className="w-10 h-10 rounded-full">
//                             <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
//                         </div>
//                         <h1 className="text-lg font-bold text-primary-red ml-2">CEOITBOX AI</h1>
//                     </div>
//                 )}

//                 {/* Full screen mobile menu */}
//                 <div
//                     className={clsx(
//                         "fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out",
//                         mobileMenuOpen ? "translate-x-0" : "translate-x-full"
//                     )}
//                 >
//                     <div className="flex flex-col h-full">
//                         {/* Top: Logo */}
//                         <div className="flex items-center justify-between p-4 border-b">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 rounded-full">
//                                     <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
//                                 </div>
//                                 <h1 className="text-lg font-bold text-primary-red">CEOITBOX AI</h1>
//                             </div>
//                         </div>

//                         {/* Menu Items */}
//                         <ScrollArea className="flex-1 p-4">
//                             {userAuth?.token && (
//                                 <div className="space-y-4">
//                                     <Link to="/dashboard" onClick={handleMenuItemClick}>
//                                         <Button
//                                             variant="ghost"
//                                             className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
//                                             style={{
//                                                 background: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "rgb(229 9 20)" : "",
//                                                 color: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "#fff" : "black"
//                                             }}
//                                         >
//                                             <FilePlus size={22} />
//                                             Generate Plans
//                                         </Button>
//                                     </Link>

//                                     <Link to="/astro-disc" onClick={handleMenuItemClick}>
//                                         <Button
//                                             variant="ghost"
//                                             className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
//                                             style={{
//                                                 background: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "rgb(229 9 20)" : "",
//                                                 color: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "#fff" : "black"
//                                             }}
//                                         >
//                                             <Rocket size={22} />
//                                             AstroDISC
//                                         </Button>
//                                     </Link>
//                                 </div>
//                             )}

//                             {adminAuth?.token && (
//                                 <div className="space-y-4">
//                                     <Link to="/admin" onClick={handleMenuItemClick}>
//                                         <Button
//                                             variant="ghost"
//                                             className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
//                                             style={{
//                                                 background: location.pathname === "/admin" ? "rgb(229 9 20)" : "",
//                                                 color: location.pathname === "/admin" ? "#fff" : "black"
//                                             }}
//                                         >
//                                             <FilePlus size={22} />
//                                             Plan Dashboard
//                                         </Button>
//                                     </Link>

//                                     <Link to="/astro-disc-dashboard" onClick={handleMenuItemClick}>
//                                         <Button
//                                             variant="ghost"
//                                             className="w-full justify-start gap-3 text-lg py-6 hover:bg-red-100 text-black"
//                                             style={{
//                                                 background: location.pathname === "/astro-disc-dashboard" ? "rgb(229 9 20)" : "",
//                                                 color: location.pathname === "/astro-disc-dashboard" ? "#fff" : "black"
//                                             }}
//                                         >
//                                             <Rocket size={22} />
//                                             Astro dashboard
//                                         </Button>
//                                     </Link>
//                                 </div>
//                             )}
//                         </ScrollArea>

//                         {/* User Info + Logout */}
//                         <div className="p-4 border-t">
//                             <div className="flex items-center gap-3">
//                                 <Avatar>
//                                     <AvatarFallback className="bg-red-600 text-white">
//                                         {userAuth?.user?.userName.charAt(0) || adminAuth?.user?.userName.charAt(0)}
//                                     </AvatarFallback>
//                                 </Avatar>
//                                 <div className="text-sm">
//                                     <div className="font-medium">{userAuth?.user?.userName || adminAuth?.user?.userName}</div>
//                                     <div className="text-xs text-gray-500">{userAuth?.user?.email || adminAuth?.user?.email}</div>
//                                 </div>
//                             </div>
//                             <Button
//                                 onClick={userAuth?.token ? handleUserLogout : handleLogoutAdmin}
//                                 variant="ghost"
//                                 className="w-full justify-start gap-3 mt-4 py-6 text-lg text-red-600 hover:bg-red-100"
//                             >
//                                 <LogOut size={22} />
//                                 Logout
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </>
//         );
//     }

//     // Desktop version (original with some improvements)
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
//                     <div className="w-10 h-10 rounded-full">
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
//                                 style={{
//                                     background: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "rgb(229 9 20)" : "",
//                                     color: (location.pathname === "/dashboard" || location.pathname === "/generated-plans" || isToolsPage || isReportPage) ? "#fff" : "black"
//                                 }}
//                             >
//                                 <FilePlus size={18} />
//                                 {!collapsed && "Generate Plans"}
//                             </Button>
//                         </Link>

//                         <Link to="/astro-disc">
//                             <Button
//                                 variant="ghost"
//                                 className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
//                                 style={{
//                                     background: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "rgb(229 9 20)" : "",
//                                     color: (location.pathname === "/astro-disc" || location.pathname === "/astro-reports") ? "#fff" : "black"
//                                 }}
//                             >
//                                 <Rocket size={18} />
//                                 {!collapsed && "AstroDISC"}
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
//                                 style={{
//                                     background: location.pathname === "/admin" ? "rgb(229 9 20)" : "",
//                                     color: location.pathname === "/admin" ? "#fff" : "black"
//                                 }}
//                             >
//                                 <FilePlus className="w-5 h-5" />
//                                 {!collapsed && "Plan Dashboard"}
//                             </Button>
//                         </Link>

//                         <Link to="/astro-disc-dashboard">
//                             <Button
//                                 variant="ghost"
//                                 className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
//                                 style={{
//                                     background: location.pathname === "/astro-disc-dashboard" ? "rgb(229 9 20)" : "",
//                                     color: location.pathname === "/astro-disc-dashboard" ? "#fff" : "black"
//                                 }}
//                             >
//                                 <Rocket className="w-5 h-5" />
//                                 {!collapsed && "Astro dashboard"}
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
//         </div >
//     );
// }

// export default AppSidebar;