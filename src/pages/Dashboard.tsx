
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ParentFeaturesDialog } from "@/components/doctor/ParentFeaturesDialog";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SummaryCard } from "@/components/ui/card/SummaryCard";
import { FeedingEntry } from "@/components/trackers/FeedingEntry";
import { DiaperEntry } from "@/components/trackers/DiaperEntry";
import { SleepEntry } from "@/components/trackers/SleepEntry";
import { 
  BottleIcon, 
  DiaperIcon, 
  SleepIcon, 
  AddIcon,
  UserIcon
} from "@/components/BabyIcons";
import { Baby, Feeding, Diaper, Sleep } from "@/types/models";
import { formatDuration, getAgeDisplay, isToday } from "@/lib/date-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getBabies } from "@/services/babyService";
import { Loader } from "@/components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const { t } = useLanguage();
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [showParentFeaturesDialog, setShowParentFeaturesDialog] = useState(false);
  const [hasCheckedParentFeatures, setHasCheckedParentFeatures] = useState(false);

  // Fetch babies data with improved caching and error handling
  const { 
    data: babies = [], 
    isLoading: isLoadingBabies,
    error: babiesError,
    refetch: refetchBabies
  } = useQuery({
    queryKey: ['babies'],
    queryFn: getBabies,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    meta: {
      errorHandler: (error: Error) => {
        console.error("Error fetching babies:", error);
        toast({
          title: "Error loading babies data",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    }
  });

  // Fetch feedings data with optimized loading
  const { 
    data: feedings = [],
    isLoading: isFeedingLoading
  } = useQuery({
    queryKey: ['feedings', selectedBaby?.id],
    queryFn: async () => {
      if (!selectedBaby) return [];
      const { data, error } = await supabase
        .from('feedings')
        .select('*')
        .eq('baby_id', selectedBaby.id)
        .order('start_time', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map((feeding) => ({
        id: feeding.id,
        babyId: feeding.baby_id,
        type: feeding.type,
        startTime: new Date(feeding.start_time),
        endTime: feeding.end_time ? new Date(feeding.end_time) : undefined,
        duration: feeding.duration,
        amount: feeding.amount,
        note: feeding.note,
      })) as Feeding[];
    },
    enabled: !!selectedBaby,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch diapers data with optimized loading
  const {
    data: diapers = [],
    isLoading: isDiaperLoading
  } = useQuery({
    queryKey: ['diapers', selectedBaby?.id],
    queryFn: async () => {
      if (!selectedBaby) return [];
      const { data, error } = await supabase
        .from('diapers')
        .select('*')
        .eq('baby_id', selectedBaby.id)
        .order('time', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map((diaper) => ({
        id: diaper.id,
        babyId: diaper.baby_id,
        type: diaper.type as "wet" | "dirty" | "mixed",
        time: new Date(diaper.time),
        note: diaper.note,
      })) as Diaper[];
    },
    enabled: !!selectedBaby,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch sleeps data with optimized loading
  const {
    data: sleeps = [],
    isLoading: isSleepLoading
  } = useQuery({
    queryKey: ['sleeps', selectedBaby?.id],
    queryFn: async () => {
      if (!selectedBaby) return [];
      const { data, error } = await supabase
        .from('sleeps')
        .select('*')
        .eq('baby_id', selectedBaby.id)
        .order('start_time', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map((sleep) => ({
        id: sleep.id,
        babyId: sleep.baby_id,
        type: sleep.type as "nap" | "night",
        startTime: new Date(sleep.start_time),
        endTime: sleep.end_time ? new Date(sleep.end_time) : undefined,
        duration: sleep.duration,
        location: sleep.location,
        mood: sleep.mood as "happy" | "fussy" | "calm" | "crying",
        note: sleep.note,
      })) as Sleep[];
    },
    enabled: !!selectedBaby,
    staleTime: 60 * 1000, // 1 minute
  });

  // Check if doctor needs to choose parent features
  useEffect(() => {
    const checkParentFeatures = async () => {
      if (userRole === 'doctor' && user && !hasCheckedParentFeatures) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('parent_features_enabled')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          // If parent_features_enabled is null (not set), show the dialog
          if (data.parent_features_enabled === null) {
            setShowParentFeaturesDialog(true);
          } else if (!data.parent_features_enabled) {
            // If doctor chose not to have parent features, redirect to doctor dashboard
            navigate('/doctor-dashboard');
            return;
          }
          setHasCheckedParentFeatures(true);
        } catch (error) {
          console.error('Error checking parent features:', error);
          setHasCheckedParentFeatures(true);
        }
      }
    };
    
    checkParentFeatures();
  }, [userRole, user, hasCheckedParentFeatures, navigate]);

  // Select first baby when babies load
  useEffect(() => {
    if (babies && babies.length > 0 && !selectedBaby) {
      setSelectedBaby(babies[0]);
    }
  }, [babies, selectedBaby]);

  // Handle error
  useEffect(() => {
    if (babiesError) {
      toast({
        title: "Error loading data",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  }, [babiesError, toast]);

  // Calculate today's stats - properly filter by today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayFeedings = feedings.filter(feeding => {
    const feedingDate = new Date(feeding.startTime);
    return feedingDate >= today && feedingDate < tomorrow;
  });

  const todayDiapers = diapers.filter(diaper => {
    const diaperDate = new Date(diaper.time);
    return diaperDate >= today && diaperDate < tomorrow;
  });

  const todaySleeps = sleeps.filter(sleep => {
    const sleepDate = new Date(sleep.startTime);
    return sleepDate >= today && sleepDate < tomorrow;
  });

  // Calculate total feeding amount for today
  const totalFeedingAmount = todayFeedings
    .filter(feeding => feeding.amount)
    .reduce((sum, feeding) => sum + (feeding.amount || 0), 0);

  // Calculate total sleep duration for today
  const totalSleepDuration = todaySleeps
    .reduce((sum, sleep) => sum + (sleep.duration || 0), 0);

  console.log('Today feedings:', todayFeedings);
  console.log('Today diapers:', todayDiapers);
  console.log('Today sleeps:', todaySleeps);
  console.log('Total feeding amount:', totalFeedingAmount);
  console.log('Total sleep duration:', totalSleepDuration);

  // Navigate to add baby form
  const handleAddBaby = () => {
    navigate("/add-baby");
  };

  // Navigate to profile page
  const handleOpenProfile = () => {
    navigate("/profile");
  };

  // Handle parent features choice completion
  const handleParentFeaturesComplete = (hasParentFeatures: boolean) => {
    setHasCheckedParentFeatures(true);
    if (!hasParentFeatures) {
      navigate('/doctor-dashboard');
    }
  };

  // Initial loading state - only show main loader when babies are loading
  if (isLoadingBabies) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader size="large" />
        </div>
      </Layout>
    );
  }

  // Show empty state if no babies
  if (babies.length === 0) {
    return (
      <Layout>
        <div className="p-4 flex flex-col items-center justify-center h-[70vh] text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mb-4">
            <BottleIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Welcome to BabyCare! 👶</h2>
          <p className="text-muted-foreground text-sm mb-6">Start your journey by adding your baby</p>
          <Button onClick={handleAddBaby} className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
            <AddIcon className="w-4 h-4 mr-2" />
            Add Your Baby
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ParentFeaturesDialog 
        open={showParentFeaturesDialog} 
        onOpenChange={setShowParentFeaturesDialog}
        onComplete={handleParentFeaturesComplete}
      />
      {selectedBaby && (
        <div className="p-3 space-y-4">

          {/* Baby Info Card */}
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {selectedBaby.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="font-bold text-lg">{selectedBaby.name}</h2>
                  <p className="text-sm text-muted-foreground">{getAgeDisplay(selectedBaby.birthDate)}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <UserIcon className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card">
                  <DropdownMenuItem onClick={handleOpenProfile}>
                    My Profile
                  </DropdownMenuItem>
                  {babies.length > 1 && (
                    <DropdownMenuItem>
                      Switch Baby
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    Admin Panel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>

          {/* Today's Summary */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center">
              <span className="mr-2">📊</span>
              Today's Summary
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <SummaryCard 
                icon={<BottleIcon className="w-4 h-4 text-primary" />}
                title="Feeding"
                value={totalFeedingAmount > 0 ? `${totalFeedingAmount}ml` : todayFeedings.length.toString()}
                className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-all"
                onClick={() => {navigate('/feeding')}}
              />
              <SummaryCard 
                icon={<DiaperIcon className="w-4 h-4 text-secondary" />}
                title="Diapers"
                value={todayDiapers.length.toString()}
                className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:shadow-md transition-all"
                onClick={() => {navigate('/diaper')}}
              />
              <SummaryCard 
                icon={<SleepIcon className="w-4 h-4 text-accent" />}
                title="Sleep"
                value={formatDuration(totalSleepDuration)}
                className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-md transition-all"
                onClick={() => {navigate('/sleep')}}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => navigate('/feeding')} 
                className="h-16 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
              >
                <BottleIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">Feed</span>
              </Button>
              <Button 
                onClick={() => navigate('/diaper')}
                className="h-16 flex flex-col items-center justify-center bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-white shadow-lg"
              >
                <DiaperIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">Diaper</span>
              </Button>
              <Button 
                onClick={() => navigate('/sleep')}
                className="h-16 flex flex-col items-center justify-center bg-gradient-to-br from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white shadow-lg"
              >
                <SleepIcon className="w-5 h-5 mb-1" />
                <span className="text-xs">Sleep</span>
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-base font-semibold mb-3 flex items-center">
              <span className="mr-2">⏰</span>
              Recent Activity
            </h3>
            {isFeedingLoading ? (
              <div className="flex justify-center py-3">
                <Loader size="small" />
              </div>
            ) : feedings.length > 0 ? (
              <div className="space-y-2">
                {feedings.slice(0, 2).map(feeding => (
                  <FeedingEntry key={feeding.id} feeding={feeding} />
                ))}
                <Button variant="ghost" size="sm" className="w-full h-8" asChild>
                  <Link to="/feeding">View all feeding records</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-3 text-muted-foreground">
                <p className="text-sm">No recent activity</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/feeding')}>
                  Add first record
                </Button>
              </div>
            )}

          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
