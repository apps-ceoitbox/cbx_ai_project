// import {
//     Sheet,
//     SheetContent,
//     SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//     Home,
//     FolderKanban,
//     LogOut,
//     Menu,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useState } from "react";

// function AppSidebar() {
//     const [open, setOpen] = useState(false);

//     const user = {
//         name: "John Doe",
//         email: "john.doe@example.com",
//     };

//     return (
//         <Sheet open={open} onOpenChange={setOpen}>
//             <SheetTrigger asChild>
//                 <Button variant="ghost" className="text-black bg-white border hover:bg-red-100 p-2">
//                     <Menu className="w-5 h-5" />
//                 </Button>
//             </SheetTrigger>

//             <SheetContent
//                 side="left"
//                 className="flex flex-col w-72 p-4 bg-white text-black"
//             >
//                 {/* Top: Logo & Company Name */}
//                 <div className="flex items-center gap-3 mb-6">
//                     <div className="w-10 h-10 flex items-center justify-center rounded-full " >
//                         <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
//                     </div>
//                     <h1 className="text-lg font-semibold text-red-600">CEOITBOX AI</h1>
//                 </div>

//                 {/* Scrollable middle menu section */}
//                 <ScrollArea className="flex-1">
//                     <div className="space-y-2">
//                         <Button
//                             variant="ghost"
//                             className="w-full justify-start gap-2 hover:bg-red-100 text-black"
//                         >
//                             <Home size={18} /> Dashboard
//                         </Button>
//                         <Button
//                             variant="ghost"
//                             className="w-full justify-start gap-2 hover:bg-red-100 text-black"
//                         >
//                             <FolderKanban size={18} /> Projects
//                         </Button>
//                         {/* Add more menu buttons here */}
//                     </div>
//                 </ScrollArea>

//                 {/* Bottom: User info + Logout */}
//                 <div className="border-t border-gray-200 pt-4 mt-4">
//                     <div className="flex items-center gap-3">
//                         <Avatar className="bg-red-600 text-white">
//                             <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
//                         </Avatar>
//                         <div className="text-sm">
//                             <div className="font-medium">{user.name}</div>
//                             <div className="text-xs text-gray-500">{user.email}</div>
//                         </div>
//                     </div>
//                     <Button
//                         variant="ghost"
//                         className="w-full justify-start gap-2 mt-3 text-red-600 hover:bg-red-100"
//                     >
//                         <LogOut size={18} /> Logout
//                     </Button>
//                 </div>
//             </SheetContent>
//         </Sheet>
//     );
// }

// export default AppSidebar;

// ----------- // --------------------- // --------------------------------- // --------

import {
    LogOut,
    ChevronLeft,
    ChevronRight,
    FilePlus,
    Rocket,
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
    const { userAuth, setUserAuth } = useData();

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
                    {!collapsed && <h1 className="text-lg font-bold text-red-600">CEOITBOX AI</h1>}
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
                <div className="space-y-2">
                    <Link to="/dashboard">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 hover:bg-red-100 text-black"
                            style={{ background: location.pathname === "/dashboard" ? "red" : "", color: location.pathname === "/dashboard" ? "#fff" : "black" }}
                        >
                            <FilePlus size={18} />
                            {!collapsed && "Generate Plans"}
                        </Button>
                    </Link>

                    <Link to="/astro-disc">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 hover:bg-red-100 text-black mt-1"
                            style={{ background: location.pathname === "/astro-disc" ? "red" : "", color: location.pathname === "/astro-disc" ? "#fff" : "black" }}
                        >
                            <Rocket size={18} />
                            {!collapsed && "Astrodisc"}
                        </Button>
                    </Link>
                </div>
            </ScrollArea>

            {/* Bottom Section: User Info + Logout */}
            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarFallback className="bg-red-600 text-white">
                            {userAuth?.user?.userName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    {!collapsed && (
                        <div className="text-sm">
                            <div className="font-medium">{userAuth?.user?.userName}</div>
                            <div className="text-xs text-gray-500">{userAuth?.user?.email}</div>
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => {
                        localStorage.removeItem("userToken")
                        setUserAuth(p => ({ ...p, user: null, token: null }))
                        toast.success("Logout successful")
                        nav("/login")
                    }}
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
