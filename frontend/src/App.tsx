import { Route, Routes } from "react-router-dom"
import Admin from "./pages/Admin/Admin"
import AdminLogin from "./pages/Admin/AdminLogin"
import Login from "./pages/Login/Login"
import Dashboard from "./pages/Dashboard/Dashboard"
import Tool from "./pages/Tool/Tool"
import Report from "./pages/Report/Report"
import HomePage from "./pages/Home/HomePage"
import Footer from "./pages/Home/Footer"
import NotFound from "./pages/NotFound"
import { useEffect } from "react"
import { useAxios, useData } from "./context/AppContext"
import UserGeneratedPlans from "./pages/Dashboard/UserGeneratedPlans"

function App() {
  const { setUserAuth, setAdminAuth } = useData();
  const userAxios = useAxios("user");
  const adminAxios = useAxios("admin");

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
      })
    }
  }, [])

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generated-plans" element={<UserGeneratedPlans />} />
        <Route path="/reports/:toolId" element={<Report />} />
        <Route path="/tools/:toolId" element={<Tool />} />

        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
      <Footer />
    </>
  )
}

export default App

