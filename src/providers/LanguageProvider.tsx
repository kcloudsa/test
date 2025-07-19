import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
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

  // Get initial language from cookie or use default
  const getInitialLanguage = () => {
    const cookieLang = Cookies.get('k-cloud-language');
    if (cookieLang && ['en-US', 'ar-SA'].includes(cookieLang)) {
      return cookieLang;
    }
    return 'ar-SA'; // fallback
  };

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    // Update i18n language if it differs from current
    if (i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage, i18n]);

  const changeLanguage = (lang: string) => {
    // Save to cookie
    Cookies.set('k-cloud-language', lang, {
      expires: 30, // 30 days
      path: '/',
      sameSite: 'lax'
    });
    
    // Change i18n language
    i18n.changeLanguage(lang);
    
    // Update state (no URL navigation needed)
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      <div dir={currentLanguage === 'ar-SA' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};