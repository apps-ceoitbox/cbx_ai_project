import AdminDashboard from '@/pages/Admin/Admin'
import AdminLoginPage from '@/pages/Admin/AdminLogin'
import Index from '@/pages/AstroDISC/Index'
import AstroAdminDashboard from '@/pages/AstroDISCAdmin/AstroAdminDashboard'
import Dashboard from '@/pages/Dashboard/Dashboard'
import UserGeneratedPlans from '@/pages/Dashboard/UserGeneratedPlans'
import AfterLoginHomePage from '@/pages/Home/AfterLoginHomePage'
import Footer from '@/pages/Home/Footer'
import HomePage from '@/pages/Home/HomePage'
import Login from "@/pages/Login/Login"
import NotFound from '@/pages/NotFound'
import ReportPage from '@/pages/Report/Report'
import ToolQuestionsPage from '@/pages/Tool/Tool'
import { Route, Routes } from 'react-router-dom'

const AppRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route path="/home" element={<AfterLoginHomePage />} />

                {/* Plan Generator */}
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generated-plans" element={<UserGeneratedPlans />} />
                <Route path="/reports/:toolId" element={<ReportPage />} />
                <Route path="/tools/:toolId" element={<ToolQuestionsPage />} />

                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* AstroDISC */}
                <Route path="/astro-disc" element={<Index />} />
                <Route path="/astro-disc-dashboard" element={<AstroAdminDashboard />} />

                <Route path="*" element={<NotFound />} />

            </Routes>
            <Footer />
        </div>
    )
}

export default AppRoutes