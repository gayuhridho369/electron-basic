import { createRoot } from 'react-dom/client'
import '../styles/globals.css'
import Counter from './counter'

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <div className="p-4">
    <Counter />
  </div>,
)
