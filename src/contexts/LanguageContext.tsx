
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
  }, [language]);

  const t = (key: string): string => {
    // For real content in Welcome page
    if (key.startsWith("welcome.") || key.startsWith("auth.")) {
      // Return the key itself as we're now using direct text instead of translation keys
      return key;
    }
    
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (!value || !value[k]) {
        // Fallback to English if translation is missing
        let fallbackValue: any = translations.en;
        for (const fbk of keys) {
          if (!fallbackValue || !fallbackValue[fbk]) {
            return key; // If even English doesn't have it, return the key
          }
          fallbackValue = fallbackValue[fbk];
        }
        // Make sure we're returning a string
        if (typeof fallbackValue !== 'string') {
          console.warn(`Translation key ${key} does not resolve to a string`);
          return key;
        }
        return fallbackValue;
      }
      value = value[k];
    }
    
    // Make sure we're returning a string
    if (typeof value !== 'string') {
      console.warn(`Translation key ${key} does not resolve to a string`);
      return key;
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
