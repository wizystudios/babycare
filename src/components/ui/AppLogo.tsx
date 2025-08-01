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
      <img 
        src="/lovable-uploads/bc8311e3-a5c0-489b-97e3-bee216f3fa41.png" 
        alt="KJ Technology Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
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