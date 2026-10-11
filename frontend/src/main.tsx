import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Auth0Provider } from '@auth0/auth0-react'
import { BrowserRouter } from 'react-router-dom'

const domain = () => {
  console.log('Auth0 Domain:', import.meta.env.VITE_AUTH0_DOMAIN)
  return import.meta.env.VITE_AUTH0_DOMAIN
}
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const redirectUri = import.meta.env.VITE_REDIRECT_URI

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={domain()}
      clientId={clientId}
      authorizationParams={{ redirect_uri: redirectUri }}
    >
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </Auth0Provider>
  </StrictMode>,
)
