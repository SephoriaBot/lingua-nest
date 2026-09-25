import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/theme.css';

import { ClerkProvider } from '@clerk/clerk-react';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkKey}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
