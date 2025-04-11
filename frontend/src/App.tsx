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

function App() {
  const { setUserAuth } = useData();
  const axios = useAxios("user");

  useEffect(() => {
    const token = localStorage.getItem("userToken")
    if (token) {
      setUserAuth(p => ({
        ...p,
        isLoading: true
      }))
      axios.get("/users/getUser").then((res) => {
        setUserAuth({
          user: res.data,
          token: token,
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

