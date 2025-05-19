
import React from "react";
import Dashboard from "./Dashboard";
import { LanguageProvider } from "@/contexts/LanguageContext";

const Index = () => {
  return (
    <LanguageProvider>
      <Dashboard />
    </LanguageProvider>
  );
};

export default Index;
