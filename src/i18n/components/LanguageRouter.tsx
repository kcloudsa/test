import { Navigate, useLocation } from 'react-router';
import { LanguageProvider } from '@/providers/LanguageProvider';

interface LanguageRouterProps {
  children: React.ReactNode;
}

export const LanguageRouter: React.FC<LanguageRouterProps> = ({ children }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const langFromPath = pathSegments[0];
  
  // If no language in path or invalid language, redirect to default
  if (!['en-US', 'ar-SA'].includes(langFromPath)) {
    return <Navigate to={`/ar-SA${location.pathname}${location.search}${location.hash}`} replace />;
  }

  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
};