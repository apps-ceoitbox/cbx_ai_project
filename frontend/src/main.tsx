import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from './context/AppContext.tsx'
import { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AppProvider>
      <Toaster />
      <App />
    </AppProvider>
  </BrowserRouter>,
)
