
import React, { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  showFooterAttribution?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  hideNavigation = false,
  showFooterAttribution = false
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!hideNavigation && <Header />}
      <main className={`flex-1 ${!hideNavigation ? 'pb-20' : ''} overflow-auto bg-gradient-to-b from-baby-blue/5 via-baby-mint/5 to-transparent px-2 sm:px-4`}>
        <div className={`${isMobile ? 'py-2' : 'py-4'} max-w-5xl mx-auto`}>
          {children}
        </div>
      </main>
      {!hideNavigation && <BottomNav />}
      {showFooterAttribution && (
        <footer className="py-2 px-4 text-center text-xs text-muted-foreground">
          <p>© 2025 BabyCare by KN Technology</p>
        </footer>
      )}
    </div>
  );
};
