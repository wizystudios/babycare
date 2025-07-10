import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, BookOpen, Star, Sparkles } from "lucide-react";

const Welcome = () => {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Welcome to 
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"> BabyCare</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-muted-foreground text-base mb-8 leading-relaxed">
            Track your baby's journey with love, care, and intelligent insights
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <Button 
              asChild 
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
            >
              <Link to="/auth">Get Started</Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full h-12 border-2"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-md space-y-3">
          <Card className="shadow-sm border-l-4 border-l-primary">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Smart Tracking</h3>
                <p className="text-xs text-muted-foreground">Feed, sleep & growth</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-secondary">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Secure & Private</h3>
                <p className="text-xs text-muted-foreground">Your data is protected</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-accent">
            <CardContent className="p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Expert Insights</h3>
                <p className="text-xs text-muted-foreground">AI-powered guidance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 px-4">
        <p className="text-xs text-muted-foreground">
          Made with ❤️ for amazing parents
        </p>
      </div>
    </div>
  );
};

export default Welcome;