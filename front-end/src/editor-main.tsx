import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ThemeEditor from './components/ThemeEditor'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App Editor={ThemeEditor} />
  </StrictMode>,
)
