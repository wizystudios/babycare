
import React, { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, hideNavigation = false }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!hideNavigation && <Header />}
      <main className={`flex-1 ${!hideNavigation ? 'pb-20' : ''} overflow-auto bg-gradient-to-b from-baby-blue/5 via-baby-mint/5 to-transparent`}>
        {children}
      </main>
      {!hideNavigation && <BottomNav />}
    </div>
  );
};
