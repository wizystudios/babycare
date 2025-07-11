import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, BookOpen, Star, ChevronRight, ArrowRight } from "lucide-react";
import { BottleIcon, DiaperIcon, SleepIcon } from "@/components/BabyIcons";

const Welcome = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: "Smart Tracking",
      subtitle: "Feed, sleep & growth",
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      icons: [
        <BottleIcon className="w-6 h-6 text-primary" />,
        <SleepIcon className="w-6 h-6 text-secondary" />,
        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
      ],
      gradient: "from-primary/10 via-primary/5 to-background"
    },
    {
      title: "Secure & Private",
      subtitle: "Your data is protected",
      icon: <Shield className="w-8 h-8 text-secondary" />,
      icons: [
        <Shield className="w-6 h-6 text-secondary" />,
        <div className="w-6 h-6 bg-secondary/20 rounded-lg flex items-center justify-center">
          <div className="w-3 h-1 bg-secondary rounded"></div>
        </div>
      ],
      gradient: "from-secondary/10 via-secondary/5 to-background"
    },
    {
      title: "Expert Insights",
      subtitle: "AI-powered guidance",
      icon: <Star className="w-8 h-8 text-accent" />,
      icons: [
        <Star className="w-6 h-6 text-accent" />,
        <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-accent rounded-full"></div>
        </div>
      ],
      gradient: "from-accent/10 via-accent/5 to-background"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const skipToAuth = () => {
    // Navigate to auth page
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${steps[currentStep].gradient} flex flex-col relative overflow-hidden`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-32 right-8 w-32 h-32 bg-secondary/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-4 w-16 h-16 bg-accent/5 rounded-full blur-lg"></div>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center pt-8 pb-4 px-4">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'bg-primary w-6' 
                  : index < currentStep 
                    ? 'bg-primary/60' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8">
        <div className="text-center max-w-sm w-full">
          {/* Logo Section */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto mb-4 relative">
              <img 
                src="/lovable-uploads/10a31bb6-5b94-43dd-829b-c00dd01ddb89.png" 
                alt="KN Technology Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">BabyCare</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium">KN Technology</p>
          </div>

          {/* Feature card */}
          <Card className="baby-card mb-8 border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
                  {steps[currentStep].icon}
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-muted-foreground">
                  {steps[currentStep].subtitle}
                </p>
              </div>

              {/* Feature icons */}
              <div className="flex justify-center space-x-4 mb-6">
                {steps[currentStep].icons.map((icon, index) => (
                  <div 
                    key={index}
                    className="w-12 h-12 bg-gradient-to-br from-background to-muted rounded-xl flex items-center justify-center shadow-sm border border-border/50"
                  >
                    {icon}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation buttons */}
          <div className="space-y-3">
            {currentStep < steps.length - 1 ? (
              <Button 
                onClick={nextStep}
                className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg rounded-2xl font-semibold text-lg"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button 
                asChild
                className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg rounded-2xl font-semibold text-lg"
              >
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              asChild
              className="w-full h-12 text-muted-foreground hover:text-foreground rounded-2xl"
            >
              <Link to="/auth">Skip</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 px-4">
        <p className="text-xs text-muted-foreground">
          Made with 💙 for amazing parents
        </p>
      </div>
    </div>
  );
};

export default Welcome;