
import React, { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 pb-20 overflow-auto bg-gradient-to-b from-baby-blue/5 via-baby-mint/5 to-transparent">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
