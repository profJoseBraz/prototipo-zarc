import './style.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './zarc/App'

const container = document.querySelector<HTMLDivElement>('#app')!
const root = createRoot(container)

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

