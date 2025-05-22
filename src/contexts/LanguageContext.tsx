
import React, { createContext, useState, useContext, useEffect } from "react";
import { translations, Language } from "@/lib/i18n/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "sw",
  setLanguage: () => {},
  t: () => "",
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, defaultLanguage = "sw" }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("babycare-language");
    return (savedLanguage as Language) || defaultLanguage;
  });

  useEffect(() => {
    localStorage.setItem("babycare-language", language);
    // Update the document title based on the selected language
    document.title = "BabyCare";
  }, [language]);

  // Improved translation function with better nested key support and logging
  const t = (key: string): string => {
    try {
      // Split the key by dots to access nested translations
      const keys = key.split(".");
      let value: any = translations[language];
      
      // Try to find the translation in the current language
      for (const k of keys) {
        if (!value || !value[k]) {
          // Translation not found in current language, fallback to English
          let fallbackValue: any = translations.en;
          
          for (const fbk of keys) {
            if (!fallbackValue || !fallbackValue[fbk]) {
              console.warn(`Translation key not found: ${key}`);
              return key; // Return the key as fallback
            }
            fallbackValue = fallbackValue[fbk];
          }
          
          // Return the English version if available
          if (typeof fallbackValue === 'string') {
            if (language !== 'en') {
              console.info(`Using English fallback for key: ${key}`);
            }
            return fallbackValue;
          }
          
          return key;
        }
        value = value[k];
      }
      
      // Make sure we're returning a string
      if (typeof value !== 'string') {
        console.warn(`Translation key ${key} does not resolve to a string`);
        return key;
      }
      
      return value;
    } catch (error) {
      console.error(`Error translating key: ${key}`, error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
