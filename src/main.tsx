import { Suspense, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@/App.tsx'
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import '@/index.css'
import "@/i18n"

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
    <Suspense fallback="loading">
      <ThemeProvider
        defaultTheme="system"
        storageKey="k-cloud-theme"
        enableSystem
        disableTransitionOnChange
      >
        <App />
      </ThemeProvider>
    </Suspense>
  </QueryClientProvider>
</StrictMode>,
)