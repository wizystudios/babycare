
import React, { useEffect, useState } from "react";
import { MockStorage } from "@/services/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FeedingEntry } from "@/components/trackers/FeedingEntry";
import type { Feeding, FeedingType } from "@/types/models";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BottleIcon, BreastIcon, AddIcon } from "@/components/BabyIcons";
import { formatTime, getRelativeTimeLabel, isSameDay } from "@/lib/date-utils";
import { useToast } from "@/components/ui/use-toast";

const Feeding = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [feedingType, setFeedingType] = useState<FeedingType>("bottle");
  const [startTime, setStartTime] = useState<string>(
    new Date().toISOString().substring(0, 16)
  );
  const [endTime, setEndTime] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  
  useEffect(() => {
    // Load feeding data
    const feedingsData = MockStorage.getFeedings();
    setFeedings(feedingsData);
  }, []);
  
  // Group feedings by date
  const groupedFeedings: Record<string, Feeding[]> = {};
  
  feedings.forEach(feeding => {
    const dateKey = getRelativeTimeLabel(feeding.startTime);
    if (!groupedFeedings[dateKey]) {
      groupedFeedings[dateKey] = [];
    }
    groupedFeedings[dateKey].push(feeding);
  });
  
  const handleSaveFeeding = () => {
    const startDateTime = new Date(startTime);
    
    let endDateTime: Date | undefined;
    let duration: number | undefined;
    
    if (endTime) {
      endDateTime = new Date(endTime);
      // Calculate duration in minutes
      duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
    }
    
    const newFeeding: Omit<Feeding, 'id'> = {
      babyId: "baby1",
      type: feedingType,
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
      amount: amount ? Number(amount) : undefined,
      note: note || undefined,
    };
    
    const addedFeeding = MockStorage.addFeeding(newFeeding);
    setFeedings([addedFeeding, ...feedings]);
    
    // Reset form
    setFeedingType("bottle");
    setStartTime(new Date().toISOString().substring(0, 16));
    setEndTime("");
    setAmount("");
    setNote("");
    
    // Close dialog
    setDialogOpen(false);
    
    // Show success message
    toast({
      title: "Feeding added",
      description: "The feeding has been successfully logged.",
    });
  };
  
  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t("feeding.title")}</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <AddIcon className="w-4 h-4 mr-2" />
                {t("feeding.newFeeding")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("feeding.newFeeding")}</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>{t("feeding.type")}</Label>
                  <RadioGroup 
                    value={feedingType} 
                    onValueChange={(value) => setFeedingType(value as FeedingType)}
                    className="flex flex-wrap gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="breast-left" id="breast-left" />
                      <Label htmlFor="breast-left" className="flex items-center">
                        <BreastIcon className="w-4 h-4 mr-1 text-baby-pink" />
                        {t("feeding.breastLeft")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="breast-right" id="breast-right" />
                      <Label htmlFor="breast-right" className="flex items-center">
                        <BreastIcon className="w-4 h-4 mr-1 text-baby-pink" />
                        {t("feeding.breastRight")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bottle" id="bottle" />
                      <Label htmlFor="bottle" className="flex items-center">
                        <BottleIcon className="w-4 h-4 mr-1 text-baby-blue" />
                        {t("feeding.bottle")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="formula" id="formula" />
                      <Label htmlFor="formula" className="flex items-center">
                        <BottleIcon className="w-4 h-4 mr-1 text-baby-blue" />
                        {t("feeding.formula")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="solid" id="solid" />
                      <Label htmlFor="solid" className="flex items-center">
                        {t("feeding.solid")}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-time">{t("feeding.startTime")}</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-time">{t("feeding.endTime")}</Label>
                  <Input
                    id="end-time"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                
                {(feedingType === "bottle" || feedingType === "formula") && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">{t("feeding.amount")} (ml)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="note">{t("feeding.note")}</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    {t("feeding.cancel")}
                  </Button>
                  <Button onClick={handleSaveFeeding}>
                    {t("feeding.save")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="breast">Breast</TabsTrigger>
            <TabsTrigger value="bottle">Bottle</TabsTrigger>
            <TabsTrigger value="solid">Solid</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            {Object.keys(groupedFeedings).map(dateKey => (
              <div key={dateKey} className="space-y-3">
                <h2 className="text-lg font-semibold">{dateKey}</h2>
                {groupedFeedings[dateKey].map(feeding => (
                  <FeedingEntry key={feeding.id} feeding={feeding} />
                ))}
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="breast" className="space-y-6">
            {Object.keys(groupedFeedings).map(dateKey => {
              const breastFeedings = groupedFeedings[dateKey].filter(
                f => f.type === "breast-left" || f.type === "breast-right"
              );
              
              if (breastFeedings.length === 0) return null;
              
              return (
                <div key={dateKey} className="space-y-3">
                  <h2 className="text-lg font-semibold">{dateKey}</h2>
                  {breastFeedings.map(feeding => (
                    <FeedingEntry key={feeding.id} feeding={feeding} />
                  ))}
                </div>
              );
            })}
          </TabsContent>
          
          <TabsContent value="bottle" className="space-y-6">
            {Object.keys(groupedFeedings).map(dateKey => {
              const bottleFeedings = groupedFeedings[dateKey].filter(
                f => f.type === "bottle" || f.type === "formula"
              );
              
              if (bottleFeedings.length === 0) return null;
              
              return (
                <div key={dateKey} className="space-y-3">
                  <h2 className="text-lg font-semibold">{dateKey}</h2>
                  {bottleFeedings.map(feeding => (
                    <FeedingEntry key={feeding.id} feeding={feeding} />
                  ))}
                </div>
              );
            })}
          </TabsContent>
          
          <TabsContent value="solid" className="space-y-6">
            {Object.keys(groupedFeedings).map(dateKey => {
              const solidFeedings = groupedFeedings[dateKey].filter(
                f => f.type === "solid"
              );
              
              if (solidFeedings.length === 0) return null;
              
              return (
                <div key={dateKey} className="space-y-3">
                  <h2 className="text-lg font-semibold">{dateKey}</h2>
                  {solidFeedings.map(feeding => (
                    <FeedingEntry key={feeding.id} feeding={feeding} />
                  ))}
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Feeding;
