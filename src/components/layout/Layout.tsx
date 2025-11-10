
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
    <div className="flex flex-col h-screen max-h-screen bg-background overflow-hidden">
      {!hideNavigation && <Header />}
      <main className={`flex-1 ${!hideNavigation ? 'pb-12' : ''} overflow-y-auto overflow-x-hidden bg-gradient-to-br from-primary/3 via-secondary/3 to-accent/3 px-2 sm:px-3`}>
        <div className={`${isMobile ? 'py-0.5' : 'py-1'} w-full max-w-2xl mx-auto`}>
          {children}
        </div>
      </main>
      {!hideNavigation && <BottomNav />}
    </div>
  );
};
