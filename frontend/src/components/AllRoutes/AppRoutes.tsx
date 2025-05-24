import AdminDashboard from '@/pages/Admin/Admin'
import AdminLoginPage from '@/pages/Admin/AdminLogin'
import Index from '@/pages/AstroDISC/Index'
import UserSubmissions from '@/pages/AstroDISC/UserSubmissions'
import AstroAdminDashboard from '@/pages/AstroDISCAdmin/AstroAdminDashboard'
import Dashboard from '@/pages/Dashboard/Dashboard'
import UserGeneratedPlans from '@/pages/Dashboard/UserGeneratedPlans'
import DocumentReader from '@/pages/DocumentReader/DocumentReader'
import ReportsDashboard from '@/pages/DocumentReader/ReportsDashboard'
import Settings from '@/pages/DocumentReader/Settings'
import AfterLoginHomePage from '@/pages/Home/AfterLoginHomePage'
import Footer from '@/pages/Home/Footer'
import HomePage from '@/pages/Home/HomePage'
import AuditLoginPage from '@/pages/Login/AuditLoginPage'
    import LoginPage from '@/pages/Login/Login'
import NotFound from '@/pages/NotFound'
import AuditReportPage from '@/pages/Report/AuditReportPage'
import ReportPage from '@/pages/Report/Report'
import AuditTool from '@/pages/Tool/AuditTool'
import ToolQuestionsPage from '@/pages/Tool/Tool'
import { Route, Routes } from 'react-router-dom'

const AppRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route path="/home" element={<AfterLoginHomePage />} />

                {/* Plan Generator */}
                {/* <Route path="/login" element={<GoogleLoginPage />} /> */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/audit-login" element={<AuditLoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/generated-plans" element={<UserGeneratedPlans />} />
                <Route path="/reports/:toolId" element={<ReportPage />} />
                <Route path="/audit-reports/:toolId" element={<AuditReportPage />} />
                <Route path="/tools/:toolId" element={<ToolQuestionsPage />} />
                <Route path="/audit-tools/:toolId" element={<AuditTool />} />

                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* AstroDISC */}
                <Route path="/astro-disc" element={<Index />} />
                <Route path="/astro-reports" element={<UserSubmissions />} />
                <Route path="/astro-disc-dashboard" element={<AstroAdminDashboard />} />

                {/* DocumentReader */}
                <Route path="/document-reader" element={<DocumentReader />} />
                <Route path="/documents-dashboard" element={<ReportsDashboard />} />
                <Route path="/document-reader-settings" element={<Settings />} />

                <Route path="*" element={<NotFound />} />

            </Routes>
            <Footer />
        </div>
    )
}

export default AppRoutes