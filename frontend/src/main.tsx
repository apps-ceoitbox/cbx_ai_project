import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.tsx'
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from './components/ui/tooltip.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppProvider>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <App />
      </TooltipProvider>
    </AppProvider>
  </BrowserRouter>,
)

