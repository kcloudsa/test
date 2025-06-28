import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export const LanguageRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && ['en-US', 'ar-SA'].includes(lang)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    } else {
      // Redirect to default language if invalid language
      navigate(`/${i18n.language}`, { replace: true });
    }
  }, [lang, i18n, navigate]);

  return <>{children}</>;
};