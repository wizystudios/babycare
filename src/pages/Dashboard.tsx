
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MockStorage } from "@/services/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
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
  GrowthIcon, 
  MilestoneIcon,
  AddIcon
} from "@/components/BabyIcons";
import { Baby, Feeding, Diaper, Sleep } from "@/types/models";
import { formatDuration, getAgeDisplay, isToday } from "@/lib/date-utils";

const Dashboard = () => {
  const { t } = useLanguage();
  const [baby, setBaby] = useState<Baby | null>(null);
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [diapers, setDiapers] = useState<Diaper[]>([]);
  const [sleeps, setSleeps] = useState<Sleep[]>([]);
  
  useEffect(() => {
    // Load data
    const babyData = MockStorage.getBaby();
    setBaby(babyData);
    
    const feedingsData = MockStorage.getFeedings();
    setFeedings(feedingsData);
    
    const diapersData = MockStorage.getDiapers();
    setDiapers(diapersData);
    
    const sleepsData = MockStorage.getSleeps();
    setSleeps(sleepsData);
  }, []);

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

  return (
    <Layout>
      {baby && (
        <div className="p-4 space-y-6">
          {/* Baby info */}
          <Card className="p-4 bg-gradient-to-r from-baby-blue/30 to-baby-lavender/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-2xl">{baby.name}</h2>
                <p className="text-gray-600">{getAgeDisplay(baby.birthDate)}</p>
              </div>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/settings">
                  <AddIcon className="w-4 h-4 mr-1" />
                  {t("dashboard.addNew")}
                </Link>
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
                value={totalFeedingAmount > 0 ? `${totalFeedingAmount}ml` : todayFeedings.length}
                className="bg-gradient-to-b from-white to-baby-blue/10"
                onClick={() => {}}
              />
              <SummaryCard 
                icon={<DiaperIcon className="w-4 h-4 text-baby-mint" />}
                title={t("nav.diaper")}
                value={todayDiapers.length}
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
          {feedings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t("dashboard.recentFeedings")}</h3>
              <div className="space-y-3">
                {feedings.slice(0, 3).map(feeding => (
                  <FeedingEntry key={feeding.id} feeding={feeding} />
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/feeding">View all</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Recent diapers */}
          {diapers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t("dashboard.recentDiapers")}</h3>
              <div className="space-y-3">
                {diapers.slice(0, 2).map(diaper => (
                  <DiaperEntry key={diaper.id} diaper={diaper} />
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/diaper">View all</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Recent sleep */}
          {sleeps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t("dashboard.recentSleep")}</h3>
              <div className="space-y-3">
                {sleeps.slice(0, 2).map(sleep => (
                  <SleepEntry key={sleep.id} sleep={sleep} />
                ))}
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/sleep">View all</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
