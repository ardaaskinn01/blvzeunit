import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { HelmetProvider } from 'react-helmet-async';

const HelmetProviderAny = HelmetProvider as any;

createRoot(document.getElementById('root')!).render(
  <HelmetProviderAny>
    <App />
  </HelmetProviderAny>
)
