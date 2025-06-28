import React, { createContext, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  getLocalizedPath: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentLanguageFromPath = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const langFromPath = pathSegments[0];
    
    // Check if the path contains a valid language
    if (['en-US', 'ar-SA'].includes(langFromPath)) {
      return langFromPath;
    }
    
    // If no valid language in path, try to get from cookie
    const cookieLang = Cookies.get('k-cloud-language');
    if (cookieLang && ['en-US', 'ar-SA'].includes(cookieLang)) {
      return cookieLang;
    }
    
    return 'ar-SA'; // fallback
  };

  const currentLanguage = getCurrentLanguageFromPath();

  useEffect(() => {
    // Update i18n language if it differs from current
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
    
    // Save to cookie
    Cookies.set('k-cloud-language', currentLanguage, {
      expires: 30, // 30 days
      path: '/',
      sameSite: 'lax'
    });
  }, [currentLanguage, i18n]);

  const changeLanguage = (lang: string) => {
    // Save to cookie immediately
    Cookies.set('k-cloud-language', lang, {
      expires: 30, // 30 days
      path: '/',
      sameSite: 'lax'
    });
    
    // Change i18n language
    i18n.changeLanguage(lang);
    
    // Navigate to new URL with updated language
    const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}-[A-Z]{2}/, '') || '/';
    navigate(`/${lang}${pathWithoutLang}${location.search}${location.hash}`);
  };

  const getLocalizedPath = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${currentLanguage}${cleanPath}`;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, getLocalizedPath }}>
      <div dir={currentLanguage === 'ar-SA' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};