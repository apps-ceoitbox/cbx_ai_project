import { useEffect, useState } from "react"
import { useAxios, useData } from "./context/AppContext"
import AppRoutes from "./components/AllRoutes/AppRoutes"
import AppSidebar from "./components/AppSidebar";
import { useLocation, useNavigate } from "react-router-dom";
import AppSidebarDrawer from "./components/SidebarDrawer/AppSidebarDrawer";
import { toast } from "sonner";
import axios from "axios";

function App() {
  const navigate = useNavigate();
  const { userAuth, setUserAuth, setAdminAuth, setAuditAuth } = useData();
  const userAxios = useAxios("user");
  const adminAxios = useAxios("admin");
  // const auditAxios = useAxios("audit");
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { apiLink } = useData();

  const isToolsPage = location.pathname.startsWith("/audit-tools/");
  const isAuditReportPage = location.pathname.startsWith("/audit-reports/");
  const isAResultPage = location.pathname.startsWith("/view/");

  const hiddenSidebarPaths = ["/", "/login", "/admin/login", "/audit-login", "/audit-reports", "/audit-tools"];
  const hideSidebar = hiddenSidebarPaths.some(path => location.pathname === path);
  // const hideSidebar = hiddenSidebarPaths.find(i => {
  //   if (i == "/") return true;
  //   return location.pathname.includes(i);
  // });


  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      setUserAuth(p => ({
        ...p,
        isLoading: true
      }))
      userAxios.get("/users/getUser").then((res) => {
        setUserAuth({
          user: res.data,
          token: userToken,
          isLoading: false
        })
      }).catch(() => {
        setUserAuth({
          user: null,
          token: userToken,
          isLoading: false
        })
      })
    }
    const adminToken = localStorage.getItem("adminToken");

    if (adminToken) {
      setAdminAuth(p => ({
        ...p,
        isLoading: true
      }))
      adminAxios.get("/users/getUser").then((res) => {
        setAdminAuth({
          user: res.data,
          token: adminToken,
          isLoading: false
        })
      }).catch(() => {
        setAdminAuth({
          user: null,
          token: adminToken,
          isLoading: false
        })
      })
    }

    const auditToken = localStorage.getItem("auditToken");

    if (auditToken) {
      setAuditAuth(p => ({
        ...p,
        isLoading: true
      }))
      adminAxios.get("/users/getUser").then((res) => {
        setAuditAuth({
          user: res.data,
          token: auditToken,
          isLoading: false
        })
      }).catch(() => {
        setAuditAuth({
          user: null,
          token: auditToken,
          isLoading: false
        })
      })
    }
  }, [])


  useEffect(() => {
    if (userAuth.token) return;
    try {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get("code");
      if (code == null) {
        return
      }
      setUserAuth(p => ({
        ...p,
        isLoading: true
      }))
      axios.get(`${apiLink}/auth/user/google/callback?code=` + code)
        .then(({ data: res }) => {
          if (res.error) {
            toast.error(res.error);
            setUserAuth(p => ({
              ...p,
              isLoading: false
            }))
            return;
          }
          setUserAuth(p => ({
            ...p,
            token: res.token,
            user: res.data,
            isLoading: false
          }))
          localStorage.setItem("userToken", res.token);
          navigate("/dashboard")
        });
    } catch (err) {
      setUserAuth(p => ({
        ...p,
        isLoading: false
      }))
      console.log(err.message);
    }
  }, [])

  return (

    <div className="flex w-full h-screen">

      {
        !isAResultPage &&
        !isAuditReportPage &&
        !isToolsPage &&
        !isMobile &&
        !hideSidebar && (
          <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )
      }

      <AppSidebarDrawer />

      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: isAResultPage || isAuditReportPage || isToolsPage || isMobile || hideSidebar ? 0 : collapsed ? "5rem" : "15rem" }}>
        <AppRoutes />
      </main>
    </div>
  )
}

export default App;

