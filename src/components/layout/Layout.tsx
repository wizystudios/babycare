
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
      <main className={`flex-1 ${!hideNavigation ? 'pb-16' : ''} overflow-y-auto overflow-x-hidden bg-gradient-to-br from-primary/3 via-secondary/3 to-accent/3 px-2 sm:px-4`}>
        <div className={`${isMobile ? 'py-1' : 'py-2'} max-w-2xl mx-auto`}>
          {children}
        </div>
      </main>
      {!hideNavigation && <BottomNav />}
      {showFooterAttribution && (
        <footer className="py-3 px-4 text-center bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-primary/10">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <span>Created by</span>
            <img 
              src="/lovable-uploads/75ac049f-edb6-4e99-a137-a7f9075e750f.png" 
              alt="KN Technology" 
              className="w-4 h-4"
            />
            <span className="font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">KN Technology</span>
          </div>
        </footer>
      )}
    </div>
  );
};
