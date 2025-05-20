
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  AddIcon
} from "@/components/BabyIcons";
import { Baby, Feeding, Diaper, Sleep } from "@/types/models";
import { formatDuration, getAgeDisplay, isToday } from "@/lib/date-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { getBabies } from "@/services/babyService";
import { Loader } from "@/components/ui/loader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);

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

  // Calculate today's stats
  const todayFeedings = feedings.filter(feeding => isToday(feeding.startTime));
  const todayDiapers = diapers.filter(diaper => isToday(diaper.time));
  const todaySleeps = sleeps.filter(sleep => isToday(sleep.startTime));

  // Calculate total feeding amount for today
  const totalFeedingAmount = todayFeedings
    .filter(feeding => feeding.amount)
    .reduce((sum, feeding) => sum + (feeding.amount || 0), 0);

  // Calculate total sleep duration for today
  const totalSleepDuration = todaySleeps
    .reduce((sum, sleep) => sum + (sleep.duration || 0), 0);

  // Navigate to add baby form
  const handleAddBaby = () => {
    navigate("/add-baby");
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
          <BottleIcon className="w-16 h-16 mb-4 text-baby-blue opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Welcome to BabyCare Daily</h2>
          <p className="text-gray-500 mb-6">Start by adding your baby's information</p>
          <Button onClick={handleAddBaby}>
            <AddIcon className="w-4 h-4 mr-2" />
            Add Your Baby
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {selectedBaby && (
        <div className="p-4 space-y-6">
          {/* Baby info */}
          <Card className="p-4 bg-gradient-to-r from-baby-blue/30 to-baby-lavender/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-2xl">{selectedBaby.name}</h2>
                <p className="text-gray-600">{getAgeDisplay(selectedBaby.birthDate)}</p>
              </div>
              <Button variant="outline" className="rounded-full" onClick={handleAddBaby}>
                <AddIcon className="w-4 h-4 mr-1" />
                {t("dashboard.addNew")}
              </Button>
            </div>
          </Card>

          {/* Daily summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("dashboard.todaySummary")}</h3>
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard 
                icon={<BottleIcon className="w-4 h-4 text-baby-blue" />}
                title={t("nav.feeding")}
                value={totalFeedingAmount > 0 ? `${totalFeedingAmount}ml` : todayFeedings.length.toString()}
                className="bg-gradient-to-b from-white to-baby-blue/10"
                onClick={() => {}}
              />
              <SummaryCard 
                icon={<DiaperIcon className="w-4 h-4 text-baby-mint" />}
                title={t("nav.diaper")}
                value={todayDiapers.length.toString()}
                className="bg-gradient-to-b from-white to-baby-mint/10"
                onClick={() => {}}
              />
              <SummaryCard 
                icon={<SleepIcon className="w-4 h-4 text-baby-lavender" />}
                title={t("nav.sleep")}
                value={formatDuration(totalSleepDuration)}
                className="bg-gradient-to-b from-white to-baby-lavender/10"
                onClick={() => {}}
              />
            </div>
          </div>

          {/* Recent feedings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("dashboard.recentFeedings")}</h3>
            {isFeedingLoading ? (
              <div className="flex justify-center py-4">
                <Loader size="small" />
              </div>
            ) : feedings.length > 0 ? (
              <div className="space-y-3">
                {feedings.slice(0, 3).map(feeding => (
                  <FeedingEntry key={feeding.id} feeding={feeding} />
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/feeding">View all</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No feeding records yet
              </div>
            )}
          </div>

          {/* Recent diapers */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("dashboard.recentDiapers")}</h3>
            {isDiaperLoading ? (
              <div className="flex justify-center py-4">
                <Loader size="small" />
              </div>
            ) : diapers.length > 0 ? (
              <div className="space-y-3">
                {diapers.slice(0, 2).map(diaper => (
                  <DiaperEntry key={diaper.id} diaper={diaper} />
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/diaper">View all</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No diaper records yet
              </div>
            )}
          </div>

          {/* Recent sleep */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t("dashboard.recentSleep")}</h3>
            {isSleepLoading ? (
              <div className="flex justify-center py-4">
                <Loader size="small" />
              </div>
            ) : sleeps.length > 0 ? (
              <div className="space-y-3">
                {sleeps.slice(0, 2).map(sleep => (
                  <SleepEntry key={sleep.id} sleep={sleep} />
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/sleep">View all</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No sleep records yet
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
