import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Onboarding wizard — lazy-loaded, only on the setup page
const onboardingRoot = document.getElementById('byrde-onboarding')

if (onboardingRoot) {
  import('./components/Onboarding/OnboardingWizard').then(({ default: OnboardingWizard }) => {
    createRoot(onboardingRoot).render(
      <StrictMode>
        <OnboardingWizard />
      </StrictMode>,
    )
  })
} else {
  // Landing page — synchronous mount (same as original)
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
