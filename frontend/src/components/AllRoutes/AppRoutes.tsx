import AdminDashboard from '@/pages/Admin/Admin'
import AdminLoginPage from '@/pages/Admin/AdminLogin'
import AIAgentHistories from '@/pages/AIAgentHistories'
import AIAgentsPage from '@/pages/AIAgents'
import AttendanceMonitor from '@/pages/AIAgents/attendance'
import CompanyProfileAI from '@/pages/AIAgents/hr'
import { CompanyProfileHistory } from '@/pages/AIAgents/hr/CompanyProfileHistory'
import AIMailSender from '@/pages/AIAgents/mail'
import { MailSenderHistory } from '@/pages/AIAgents/mail/MailSenderHistory'
import ResumeAnalyzer from '@/pages/AIAgents/resume'
import ResumeHistory from '@/pages/AIAgents/resume/ResumeHistory'
import ZoomaryAI from '@/pages/AIAgents/Zoomary'
import { ZoomaryHistory } from '@/pages/AIAgents/Zoomary/ZoomaryHistory'
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
import Result from '@/pages/Report/Result'
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
                <Route path="/tools/:toolId" element={<ToolQuestionsPage />} />

                {/* Audit */}
                <Route path="/audit-reports/:toolId" element={<AuditReportPage />} />
                <Route path="/audit-tools/:toolId" element={<AuditTool />} />
                <Route path="/view/:id" element={<Result />} />

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

                {/* AI Agents */}
                <Route path="/ai-agents" element={<AIAgentsPage />} />
                <Route path="/ai-agents/zoomary" element={<ZoomaryAI />} />
                <Route path="/ai-agents/zoomary/history" element={<ZoomaryHistory />} />
                <Route path="/ai-agents/hr" element={<CompanyProfileAI />} />
                <Route path="/ai-agents/company-profile/history" element={<CompanyProfileHistory />} />
                <Route path="/ai-agents/resume" element={<ResumeAnalyzer />} />
                <Route path="/ai-agents/resume/history" element={<ResumeHistory />} />
                <Route path="/ai-agents/attendance" element={<AttendanceMonitor />} />
                <Route path="/ai-agents/mail" element={<AIMailSender />} />
                <Route path="/ai-agents/mail/history" element={<MailSenderHistory />} />
                <Route path="/ai-agents/:categoryId" element={<AIAgentsPage />} />
                <Route path="/ai-agent-histories" element={<AIAgentHistories />} />
                <Route path="/admin/ai-agents" element={<AIAgentsPage />} />
                <Route path="/admin/ai-agents/:categoryId" element={<AIAgentsPage />} />


                {/* Default  */}
                <Route path="*" element={<NotFound />} />

            </Routes>
            <Footer />
        </div>
    )
}

export default AppRoutes;



