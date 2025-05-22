
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Baby } from '@/types/models';
import { Layout } from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBaby } from '@/hooks/useBaby';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GrowthChart } from '@/components/charts/GrowthChart';
import { FeedingInsights } from '@/components/insights/FeedingInsights';
import { DiaperInsights } from '@/components/insights/DiaperInsights';
import { getInsightsData } from '@/services/insightService';
import { Loader } from '@/components/ui/loader';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Insights = () => {
  const { t } = useLanguage();
  const { currentBaby, babies } = useBaby();
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  
  useEffect(() => {
    if (currentBaby && !selectedBabyId) {
      setSelectedBabyId(currentBaby.id);
    }
  }, [currentBaby, selectedBabyId]);
  
  // Fetch insights data for the selected baby
  const {
    data: insightsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['insights', selectedBabyId],
    queryFn: () => selectedBabyId ? getInsightsData(selectedBabyId) : Promise.resolve(null),
    enabled: !!selectedBabyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Find the selected baby object
  const selectedBaby = babies.find(baby => baby.id === selectedBabyId);
  
  // Handle baby selection change
  const handleBabyChange = (babyId: string) => {
    setSelectedBabyId(babyId);
  };

  if (!selectedBabyId || !selectedBaby) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <p>{t('common.noBabySelected')}</p>
        </div>
      </Layout>
    );
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <Loader size="large" />
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('insights.errorTitle')}</AlertTitle>
            <AlertDescription>
              {t('insights.errorDescription')}
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  if (!insightsData) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <p>{t('insights.noDataAvailable')}</p>
        </div>
      </Layout>
    );
  }
  
  const hasGrowthData = insightsData.growthRecords && insightsData.growthRecords.length > 0;
  const hasFeedingData = insightsData.feedings && insightsData.feedings.length > 0;
  const hasDiaperData = insightsData.diapers && insightsData.diapers.length > 0;

  return (
    <Layout>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-2xl font-bold">{t('insights.title')}</h1>
          
          {babies.length > 1 && (
            <Select value={selectedBabyId} onValueChange={handleBabyChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('insights.selectBaby')} />
              </SelectTrigger>
              <SelectContent>
                {babies.map(baby => (
                  <SelectItem key={baby.id} value={baby.id}>
                    {baby.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <Tabs defaultValue="growth">
          <TabsList className="mb-4">
            <TabsTrigger value="growth">{t('insights.growth')}</TabsTrigger>
            <TabsTrigger value="feeding">{t('insights.feeding')}</TabsTrigger>
            <TabsTrigger value="diaper">{t('insights.diaper')}</TabsTrigger>
            <TabsTrigger value="knowledge">{t('insights.knowledge')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="growth">
            <div className="space-y-6">
              {hasGrowthData ? (
                <GrowthChart 
                  growthData={insightsData.growthRecords} 
                  gender={selectedBaby.gender === 'male' ? 'male' : 'female'} 
                  birthDate={new Date(selectedBaby.birthDate)}
                />
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold mb-2">{t('insights.noGrowthDataTitle')}</h3>
                  <p className="text-gray-600 mb-4">{t('insights.noGrowthDataDescription')}</p>
                  <p className="text-sm text-gray-500">{t('insights.recordGrowthPrompt')}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="feeding">
            <div className="space-y-6">
              {hasFeedingData ? (
                <FeedingInsights feedingEntries={insightsData.feedings} />
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold mb-2">{t('insights.noFeedingDataTitle')}</h3>
                  <p className="text-gray-600 mb-4">{t('insights.noFeedingDataDescription')}</p>
                  <p className="text-sm text-gray-500">{t('insights.recordFeedingPrompt')}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="diaper">
            <div className="space-y-6">
              {hasDiaperData ? (
                <DiaperInsights diaperEntries={insightsData.diapers} />
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold mb-2">{t('insights.noDiaperDataTitle')}</h3>
                  <p className="text-gray-600 mb-4">{t('insights.noDiaperDataDescription')}</p>
                  <p className="text-sm text-gray-500">{t('insights.recordDiaperPrompt')}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="knowledge">
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  <CardTitle>{t('insights.babyCareTips')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="mr-2">🍼</span> 
                          {t('insights.feedingTips')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>{t('insights.feedingTip1')}</p>
                          <p>{t('insights.feedingTip2')}</p>
                          <p>{t('insights.feedingTip3')}</p>
                          <p>{t('insights.feedingTip4')}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="mr-2">💤</span> 
                          {t('insights.sleepTips')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>{t('insights.sleepTip1')}</p>
                          <p>{t('insights.sleepTip2')}</p>
                          <p>{t('insights.sleepTip3')}</p>
                          <p>{t('insights.sleepTip4')}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="mr-2">🧩</span> 
                          {t('insights.developmentTips')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>{t('insights.developmentTip1')}</p>
                          <p>{t('insights.developmentTip2')}</p>
                          <p>{t('insights.developmentTip3')}</p>
                          <p>{t('insights.developmentTip4')}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="mr-2">🏥</span> 
                          {t('insights.healthTips')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>{t('insights.healthTip1')}</p>
                          <p>{t('insights.healthTip2')}</p>
                          <p>{t('insights.healthTip3')}</p>
                          <p>{t('insights.healthTip4')}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-5">
                      <AccordionTrigger>
                        <div className="flex items-center">
                          <span className="mr-2">👶</span> 
                          {t('insights.parentingTips')}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <p>{t('insights.parentingTip1')}</p>
                          <p>{t('insights.parentingTip2')}</p>
                          <p>{t('insights.parentingTip3')}</p>
                          <p>{t('insights.parentingTip4')}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('insights.commonQuestions')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="faq-1">
                      <AccordionTrigger>{t('insights.faqQuestion1')}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t('insights.faqAnswer1')}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-2">
                      <AccordionTrigger>{t('insights.faqQuestion2')}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t('insights.faqAnswer2')}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-3">
                      <AccordionTrigger>{t('insights.faqQuestion3')}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t('insights.faqAnswer3')}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-4">
                      <AccordionTrigger>{t('insights.faqQuestion4')}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t('insights.faqAnswer4')}</p>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq-5">
                      <AccordionTrigger>{t('insights.faqQuestion5')}</AccordionTrigger>
                      <AccordionContent>
                        <p>{t('insights.faqAnswer5')}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Insights;
