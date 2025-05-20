
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { DiaperEntry } from "@/components/trackers/DiaperEntry";
import { Diaper, DiaperType } from "@/types/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AddIcon } from "@/components/BabyIcons";
import { getRelativeTimeLabel } from "@/lib/date-utils";
import { useToast } from "@/components/ui/use-toast";
import { getDiapersByBabyId, addDiaper } from "@/services/diaperService";
import { useBaby } from "@/hooks/useBaby";
import { Loader } from "@/components/ui/loader";

const DiaperPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { currentBaby } = useBaby();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [diaperType, setDiaperType] = useState<DiaperType>("wet");
  const [time, setTime] = useState<string>(
    new Date().toISOString().substring(0, 16)
  );
  const [note, setNote] = useState<string>("");
  
  // Fetch diapers data
  const { 
    data: diapers = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['diapers', currentBaby?.id],
    queryFn: async () => {
      if (!currentBaby) return [];
      return getDiapersByBabyId(currentBaby.id);
    },
    enabled: !!currentBaby,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Group diapers by date
  const groupedDiapers: Record<string, Diaper[]> = {};
  
  diapers.forEach(diaper => {
    const dateKey = getRelativeTimeLabel(diaper.time);
    if (!groupedDiapers[dateKey]) {
      groupedDiapers[dateKey] = [];
    }
    groupedDiapers[dateKey].push(diaper);
  });
  
  const handleSaveDiaper = async () => {
    if (!currentBaby) {
      toast({
        title: "Error",
        description: "No baby selected",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const diaperTime = new Date(time);
      
      const newDiaper: Omit<Diaper, 'id'> = {
        babyId: currentBaby.id,
        type: diaperType,
        time: diaperTime,
        note: note || undefined,
      };
      
      await addDiaper(newDiaper);
      
      // Refetch diapers
      refetch();
      
      // Reset form
      setDiaperType("wet");
      setTime(new Date().toISOString().substring(0, 16));
      setNote("");
      
      // Close dialog
      setDialogOpen(false);
      
      // Show success message
      toast({
        title: t("diaper.successTitle"),
        description: t("diaper.successDescription"),
      });
    } catch (error) {
      console.error("Error adding diaper:", error);
      toast({
        title: t("diaper.errorTitle"),
        description: t("diaper.errorDescription"),
        variant: "destructive",
      });
    }
  };

  if (!currentBaby) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <p>{t("common.noBabySelected")}</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t("diaper.title")}</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <AddIcon className="w-4 h-4 mr-2" />
                {t("diaper.newDiaper")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("diaper.newDiaper")}</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>{t("diaper.type")}</Label>
                  <RadioGroup 
                    value={diaperType} 
                    onValueChange={(value) => setDiaperType(value as DiaperType)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wet" id="wet" />
                      <Label htmlFor="wet">{t("diaper.wet")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dirty" id="dirty" />
                      <Label htmlFor="dirty">{t("diaper.dirty")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mixed" id="mixed" />
                      <Label htmlFor="mixed">{t("diaper.mixed")}</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">{t("diaper.time")}</Label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="note">{t("diaper.note")}</Label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t("diaper.notePlaceholder")}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    {t("diaper.cancel")}
                  </Button>
                  <Button onClick={handleSaveDiaper}>
                    {t("diaper.save")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader size="large" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{t("common.errorLoading")}</p>
          </div>
        ) : diapers.length === 0 ? (
          <div className="text-center py-8">
            <p>{t("diaper.noDiapers")}</p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              <AddIcon className="w-4 h-4 mr-2" />
              {t("diaper.addFirst")}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedDiapers).map(dateKey => (
              <div key={dateKey} className="space-y-3">
                <h2 className="text-lg font-semibold">{dateKey}</h2>
                {groupedDiapers[dateKey].map(diaper => (
                  <DiaperEntry key={diaper.id} diaper={diaper} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DiaperPage;
