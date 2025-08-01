import React from "react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  size = "md", 
  showText = true 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`${sizeClasses[size]} relative bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl shadow-glow flex items-center justify-center`}>
        <div className="absolute inset-1 bg-white/90 rounded-xl flex items-center justify-center">
          <div className="text-primary font-bold text-lg">👶</div>
        </div>
        <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-br from-accent to-secondary rounded-full"></div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1 className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent`}>
            BabyCare
          </h1>
          <p className="text-xs text-muted-foreground font-medium -mt-1">Smart Baby Tracking</p>
        </div>
      )}
    </div>
  );
};