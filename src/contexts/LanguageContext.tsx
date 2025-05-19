
import React, { createContext, useState, useContext, useEffect } from "react";
import { translations, Language } from "@/lib/i18n/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: () => "",
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("babycare-language");
    return (savedLanguage as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("babycare-language", language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (!value[k]) {
        // Fallback to English if translation is missing
        let fallbackValue = translations.en;
        for (const fbk of keys) {
          if (!fallbackValue[fbk]) {
            return key; // If even English doesn't have it, return the key
          }
          fallbackValue = fallbackValue[fbk];
        }
        return fallbackValue;
      }
      value = value[k];
    }
    
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
