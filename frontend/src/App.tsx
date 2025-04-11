import { Route, Routes } from "react-router-dom"
import Admin from "./pages/Admin/Admin"
import AdminLogin from "./pages/Admin/AdminLogin"
import Login from "./pages/Login/Login"
import Dashboard from "./pages/Dashboard/Dashboard"
import Tool from "./pages/Tool/Tool"
import Report from "./pages/Report/Report"

function App() {

  return (
    <>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/reports/:toolId" element={<Report />} />

        <Route path="/tools/:toolId" element={<Tool />} />
      </Routes>
    </>
  )
}

export default App
