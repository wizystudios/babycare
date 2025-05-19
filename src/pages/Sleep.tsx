
import React, { useEffect, useState } from "react";
import { MockStorage } from "@/services/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SleepEntry } from "@/components/trackers/SleepEntry";
import { Sleep, SleepType, MoodType } from "@/types/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddIcon } from "@/components/BabyIcons";
import { getRelativeTimeLabel, calculateDuration } from "@/lib/date-utils";
import { useToast } from "@/components/ui/use-toast";

const SleepPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [sleeps, setSleeps] = useState<Sleep[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [sleepType, setSleepType] = useState<SleepType>("nap");
  const [startTime, setStartTime] = useState<string>(
    new Date().toISOString().substring(0, 16)
  );
  const [endTime, setEndTime] = useState<string>("");
  const [location, setLocation] = useState<string>("Crib");
  const [mood, setMood] = useState<MoodType>("calm");
  const [note, setNote] = useState<string>("");
  
  useEffect(() => {
    // Load sleep data
    const sleepsData = MockStorage.getSleeps();
    setSleeps(sleepsData);
  }, []);
  
  // Group sleeps by date
  const groupedSleeps: Record<string, Sleep[]> = {};
  
  sleeps.forEach(sleep => {
    const dateKey = getRelativeTimeLabel(sleep.startTime);
    if (!groupedSleeps[dateKey]) {
      groupedSleeps[dateKey] = [];
    }
    groupedSleeps[dateKey].push(sleep);
  });
  
  const handleSaveSleep = () => {
    const startDateTime = new Date(startTime);
    
    let endDateTime: Date | undefined;
    let duration: number | undefined;
    
    if (endTime) {
      endDateTime = new Date(endTime);
      // Calculate duration in minutes
      duration = calculateDuration(startDateTime, endDateTime);
    }
    
    const newSleep: Omit<Sleep, 'id'> = {
      babyId: "baby1",
      type: sleepType,
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
      location,
      mood,
      note: note || undefined,
    };
    
    const addedSleep = MockStorage.addSleep(newSleep);
    setSleeps([addedSleep, ...sleeps]);
    
    // Reset form
    setSleepType("nap");
    setStartTime(new Date().toISOString().substring(0, 16));
    setEndTime("");
    setLocation("Crib");
    setMood("calm");
    setNote("");
    
    // Close dialog
    setDialogOpen(false);
    
    // Show success message
    toast({
      title: "Sleep session added",
      description: "The sleep session has been successfully logged.",
    });
  };
  
  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t("sleep.title")}</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <AddIcon className="w-4 h-4 mr-2" />
                {t("sleep.newSleep")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("sleep.newSleep")}</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>{t("sleep.type")}</Label>
                  <RadioGroup 
                    value={sleepType} 
                    onValueChange={(value) => setSleepType(value as SleepType)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nap" id="nap" />
                      <Label htmlFor="nap">{t("sleep.nap")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="night" id="night" />
                      <Label htmlFor="night">{t("sleep.night")}</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-time">{t("sleep.startTime")}</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-time">{t("sleep.endTime")}</Label>
                  <Input
                    id="end-time"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">{t("sleep.location")}</Label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Crib, Stroller, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mood">{t("sleep.mood")}</Label>
                  <Select value={mood} onValueChange={(value) => setMood(value as MoodType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="happy">{t("sleep.moods.happy")}</SelectItem>
                      <SelectItem value="fussy">{t("sleep.moods.fussy")}</SelectItem>
                      <SelectItem value="calm">{t("sleep.moods.calm")}</SelectItem>
                      <SelectItem value="crying">{t("sleep.moods.crying")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="note">{t("sleep.note")}</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    {t("sleep.cancel")}
                  </Button>
                  <Button onClick={handleSaveSleep}>
                    {t("sleep.save")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="space-y-6">
          {Object.keys(groupedSleeps).map(dateKey => (
            <div key={dateKey} className="space-y-3">
              <h2 className="text-lg font-semibold">{dateKey}</h2>
              {groupedSleeps[dateKey].map(sleep => (
                <SleepEntry key={sleep.id} sleep={sleep} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SleepPage;
