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
  ChevronUp,
  Bot,
  History,
  Image,
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
import LogoutConfirmationModal from "./Custom/LogoutConfirmationModal";

function AppSidebar({ collapsed, setCollapsed }) {
  const nav = useNavigate();
  const location = useLocation();
  const { userAuth, setUserAuth, adminAuth, setAdminAuth } = useData();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [logoutType, setLogoutType] = useState<"both" | "admin" | "user">();

  // Check if both auth types are present
  const hasBothAuth = userAuth?.token && adminAuth?.token;

  const handleLogoutAdmin = () => {
    localStorage.removeItem("adminToken");
    setAdminAuth({
      user: null,
      token: null,
      isLoading: false,
    });
    toast.success("Admin logout successful");
    nav("/admin/login");
  };

  const handleUserLogout = () => {
    localStorage.removeItem("userToken");
    setUserAuth((prev) => ({
      ...prev,
      user: null,
      token: null,
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
      isLoading: false,
    });
    setAdminAuth({
      user: null,
      token: null,
      isLoading: false,
    });
    toast.success("Logout successful");
    nav("/login");
  };

  // Check if a menu item is active
  const isMenuItemActive = (paths) => {
    if (!Array.isArray(paths)) paths = [paths];
    return paths.some(
      (path) =>
        location.pathname === path ||
        (path.endsWith("/") && location.pathname.startsWith(path)) || // Handles /tools/ and /reports/ prefixes
        (path === "/dashboard" &&
          (location.pathname.startsWith("/generated-plans") ||
            location.pathname.startsWith("/tools/") ||
            location.pathname.startsWith("/reports/"))) || // For Generate Plans being active for sub-paths
        (path === "/astro-disc" &&
          location.pathname.startsWith("/astro-reports")) ||
        (path === "/document-reader" &&
          location.pathname.startsWith("/documents-dashboard"))
    );
  };

  const openLogoutModal = (type: "both" | "admin" | "user") => {
    setLogoutType(type);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    if (logoutType === "both") {
      handleUserAndAdminLogout();
    } else if (logoutType === "user") {
      handleUserLogout();
    } else {
      handleLogoutAdmin();
    }
    setShowLogoutModal(false);
  };

  // Define a primary red color for consistency
  const primaryRed = "rgb(236, 40, 40)"; // A vibrant red
  const darkGray = "#374151"; // Tailwind gray-700 approx.

  return (
    <div
      className={clsx(
        "h-screen bg-white text-gray-800 border-r border-red-200 flex flex-col fixed top-0 left-0 z-50 transition-all duration-300 shadow-xl",
        collapsed ? "w-24" : "w-60"
      )}
      style={{ boxShadow: "4px 0 15px rgba(0,0,0,0.05)" }}
    >
      {/* Top: Logo & Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-red-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10  overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png" // Ensure this path is correct
              alt="Logo"
              className="w-full h-full object-cover"
            />
          </div>
          {!collapsed && (
            <h1 className="text-lg font-bold" style={{ color: primaryRed }}>
              CEOITBOX AI
            </h1>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="text-gray-600 hover:text-white hover:bg-red-500 rounded-full transition-all duration-200"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Menu Section */}
      <ScrollArea className="flex-1 px-3 py-3">
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
                  className="group w-full justify-between font-semibold text-gray-700 hover:text-white hover:bg-red-600 rounded-lg mb-1 transition-all duration-200"
                  style={{
                    backgroundColor: isUserMenuOpen ? primaryRed : "",
                    color: isUserMenuOpen ? "white" : darkGray,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <User
                      size={18}
                      className="text-inherit group-hover:text-white transition-colors duration-200"
                    />
                    {!collapsed && (
                      <span className="group-hover:text-white transition-colors duration-200">
                        User Menu
                      </span>
                    )}
                  </div>
                  {!collapsed &&
                    (isUserMenuOpen ? (
                      <ChevronUp
                        size={16}
                        className="text-inherit group-hover:text-white transition-colors duration-200"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-inherit group-hover:text-white transition-colors duration-200"
                      />
                    ))}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-1 pl-4 border-l-2 border-red-200 ml-2">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive([
                        "/dashboard",
                        "/generated-plans",
                        "/tools/",
                        "/reports/",
                      ])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive([
                        "/dashboard",
                        "/generated-plans",
                        "/tools/",
                        "/reports/",
                      ])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <FilePlus size={16} />
                    {!collapsed && "Generate Plans"}
                  </Button>
                </Link>

                <Link to="/astro-disc">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive([
                        "/astro-disc",
                        "/astro-reports",
                      ])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/astro-disc", "/astro-reports"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Rocket size={16} />
                    {!collapsed && "AstroDISC"}
                  </Button>
                </Link>

                <Link to="/document-reader">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive([
                        "/document-reader",
                        "/documents-dashboard",
                      ])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive([
                        "/document-reader",
                        "/documents-dashboard",
                      ])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <FileText size={16} />
                    {!collapsed && "Document Reader"}
                  </Button>
                </Link>

                <Link to="/image-generation">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive(["/image-generation"])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/image-generation"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Image size={16} />
                    {!collapsed && "Image Generation"}
                  </Button>
                </Link>

                <Link to="/ai-agents">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive(["/ai-agents"])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/ai-agents"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Bot size={16} />
                    {!collapsed && "AI Agents"}
                  </Button>
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* Admin Role Menu - Collapsible */}
            <Collapsible
              open={isAdminMenuOpen}
              onOpenChange={setIsAdminMenuOpen}
              className="mb-2"
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="group w-full justify-between font-semibold text-gray-700 hover:text-white hover:bg-red-600 rounded-lg mb-1 transition-all duration-200"
                  style={{
                    backgroundColor: isAdminMenuOpen ? primaryRed : "",
                    color: isAdminMenuOpen ? "white" : darkGray,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Shield
                      size={18}
                      className="text-inherit group-hover:text-white transition-colors duration-200"
                    />
                    {!collapsed && (
                      <span className="group-hover:text-white transition-colors duration-200">
                        Admin Menu
                      </span>
                    )}
                  </div>
                  {!collapsed &&
                    (isAdminMenuOpen ? (
                      <ChevronUp
                        size={16}
                        className="text-inherit group-hover:text-white transition-colors duration-200"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-inherit group-hover:text-white transition-colors duration-200"
                      />
                    ))}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-1 pl-4 border-l-2 border-red-200 ml-2">
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive("/admin") ? primaryRed : "",
                      color: isMenuItemActive("/admin") ? "#fff" : darkGray,
                    }}
                  >
                    <FilePlus size={16} />
                    {!collapsed && "Plan Dashboard"}
                  </Button>
                </Link>

                <Link to="/astro-disc-dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive("/astro-disc-dashboard")
                        ? primaryRed
                        : "",
                      color: isMenuItemActive("/astro-disc-dashboard")
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Rocket size={16} />
                    {!collapsed && "Astro Dashboard"}
                  </Button>
                </Link>

                <Link to="/document-reader-settings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive("/document-reader-settings")
                        ? primaryRed
                        : "",
                      color: isMenuItemActive("/document-reader-settings")
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <FileText size={16} />
                    {!collapsed && "Doc Reader Settings"}
                  </Button>
                </Link>
                <Link to="/image-generation-dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive([
                        "/image-generation-dashboard",
                      ])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/image-generation-dashboard"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Image size={18} />
                    {!collapsed && "Image Dashboard"}
                  </Button>
                </Link>
                <Link to="/ai-agent-histories">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive(["/ai-agent-histories"])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/ai-agent-histories"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <History size={18} />
                    {!collapsed && "AI Agents Dashboard"}
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
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive([
                        "/dashboard",
                        "/generated-plans",
                        "/tools/",
                        "/reports/",
                      ])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive([
                        "/dashboard",
                        "/generated-plans",
                        "/tools/",
                        "/reports/",
                      ])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <FilePlus size={18} />
                    {!collapsed && "Generate Plans"}
                  </Button>
                </Link>

                <Link to="/astro-disc">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive([
                        "/astro-disc",
                        "/astro-reports",
                      ])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/astro-disc", "/astro-reports"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Rocket size={18} />
                    {!collapsed && "AstroDISC"}
                  </Button>
                </Link>

                <Link to="/document-reader">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive([
                        "/document-reader",
                        "/documents-dashboard",
                      ])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive([
                        "/document-reader",
                        "/documents-dashboard",
                      ])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <FileText size={18} />
                    {!collapsed && "Document Reader"}
                  </Button>
                </Link>

                <Link to="/ai-agents">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive(["/ai-agents"])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/ai-agents"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Bot size={16} />
                    {!collapsed && "AI Agents"}
                  </Button>
                </Link>

                <Link to="/image-generation">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive(["/image-generation"])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/image-generation"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Image size={16} />
                    {!collapsed && "Image Generation"}
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
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
                    style={{
                      background: isMenuItemActive("/admin") ? primaryRed : "",
                      color: isMenuItemActive("/admin") ? "#fff" : darkGray,
                    }}
                  >
                    <FilePlus size={18} />
                    {!collapsed && "Plan Dashboard"}
                  </Button>
                </Link>

                <Link to="/astro-disc-dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive("/astro-disc-dashboard")
                        ? primaryRed
                        : "",
                      color: isMenuItemActive("/astro-disc-dashboard")
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Rocket size={18} />
                    {!collapsed && "Astro Dashboard"}
                  </Button>
                </Link>

                <Link to="/document-reader-settings">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive("/document-reader-settings")
                        ? primaryRed
                        : "",
                      color: isMenuItemActive("/document-reader-settings")
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <FileText size={18} />
                    {!collapsed && "Document Reader Settings"}
                  </Button>
                </Link>

                <Link to="/ai-agent-histories">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive(["/ai-agent-histories"])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/ai-agent-histories"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <History size={18} />
                    {!collapsed && "AI Agents Dashboard"}
                  </Button>
                </Link>

                <Link to="/image-generation-dashboard">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md mt-1"
                    style={{
                      background: isMenuItemActive([
                        "/image-generation-dashboard",
                      ])
                        ? primaryRed
                        : "",
                      color: isMenuItemActive(["/image-generation-dashboard"])
                        ? "#fff"
                        : darkGray,
                    }}
                  >
                    <Image size={18} />
                    {!collapsed && "Image Dashboard"}
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </ScrollArea>

      {/* Bottom Section: User Info + Logout */}
      <div className="p-4 border-t border-red-200">
        <div className="flex items-center gap-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-red-600 text-white font-bold">
              {adminAuth?.user?.userName?.charAt(0)?.toUpperCase() ||
                userAuth?.user?.userName?.charAt(0)?.toUpperCase() ||
                "U"}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {adminAuth?.user?.userName || userAuth?.user?.userName}
              </div>
              <div className="text-xs text-gray-600">
                {adminAuth?.user?.email || userAuth?.user?.email}
              </div>
            </div>
          )}
        </div>

        {(hasBothAuth || userAuth?.token || adminAuth?.token) && (
          <Link to="/profile">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 mb-3 text-gray-700 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
              style={{
                background: isMenuItemActive(["/profile"]) ? primaryRed : "",
                color: isMenuItemActive(["/profile"]) ? "#fff" : darkGray,
              }}
            >
              <User size={18} />
              {!collapsed && "Profile Settings"}
            </Button>
          </Link>
        )}

        {hasBothAuth ? (
          <div className="space-y-2">
            <Button
              onClick={() => openLogoutModal("both")}
              variant="ghost"
              className="w-full justify-start gap-2 text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
            >
              <LogOut size={18} />
              {!collapsed ? "Logout" : ""}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => openLogoutModal(userAuth?.token ? "user" : "admin")}
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:bg-red-100 hover:text-red-800 transition-colors duration-200 rounded-md"
          >
            <LogOut size={18} />
            {!collapsed && "Logout"}
          </Button>
        )}
      </div>

      <LogoutConfirmationModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
}

export default AppSidebar;
