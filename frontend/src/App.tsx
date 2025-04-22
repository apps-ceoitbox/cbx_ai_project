import { useEffect, useState } from "react"
import { useAxios, useData } from "./context/AppContext"
import AppRoutes from "./components/AllRoutes/AppRoutes"
import AppSidebar from "./components/AppSidebar";
import { useLocation } from "react-router-dom";
import AppSidebarDrawer from "./components/SidebarDrawer/AppSidebarDrawer";

function App() {
  const { setUserAuth, setAdminAuth } = useData();
  const userAxios = useAxios("user");
  const adminAxios = useAxios("admin");
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  const hiddenSidebarPaths = ["/login", "/", "/admin/login"];
  const hideSidebar = hiddenSidebarPaths.includes(location.pathname);


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
  }, [])

  return (

    <div className="flex w-full h-screen">

      {
        !isMobile &&
        !hideSidebar && (
          <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        )
      }

      <AppSidebarDrawer />

      <main
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ marginLeft: isMobile || hideSidebar ? 0 : collapsed ? "5rem" : "15rem" }}>
        <AppRoutes />
      </main>
    </div>
  )
}

export default App;

