import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import CitizenApp from './CitizenApp.tsx'
import { AgentPipelineProvider } from './context/AgentPipelineContext.tsx'

// /report is the resident-facing app; everything else is the operator dashboard.
const isResidentApp = window.location.pathname.startsWith('/report')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AgentPipelineProvider>
      {isResidentApp ? <CitizenApp /> : <App />}
    </AgentPipelineProvider>
  </StrictMode>,
)
