
import React, { useEffect, useState } from "react";
import { MockStorage } from "@/services/mockData";
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

const DiaperPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [diapers, setDiapers] = useState<Diaper[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [diaperType, setDiaperType] = useState<DiaperType>("wet");
  const [time, setTime] = useState<string>(
    new Date().toISOString().substring(0, 16)
  );
  const [note, setNote] = useState<string>("");
  
  useEffect(() => {
    // Load diaper data
    const diapersData = MockStorage.getDiapers();
    setDiapers(diapersData);
  }, []);
  
  // Group diapers by date
  const groupedDiapers: Record<string, Diaper[]> = {};
  
  diapers.forEach(diaper => {
    const dateKey = getRelativeTimeLabel(diaper.time);
    if (!groupedDiapers[dateKey]) {
      groupedDiapers[dateKey] = [];
    }
    groupedDiapers[dateKey].push(diaper);
  });
  
  const handleSaveDiaper = () => {
    const diaperTime = new Date(time);
    
    const newDiaper: Omit<Diaper, 'id'> = {
      babyId: "baby1",
      type: diaperType,
      time: diaperTime,
      note: note || undefined,
    };
    
    const addedDiaper = MockStorage.addDiaper(newDiaper);
    setDiapers([addedDiaper, ...diapers]);
    
    // Reset form
    setDiaperType("wet");
    setTime(new Date().toISOString().substring(0, 16));
    setNote("");
    
    // Close dialog
    setDialogOpen(false);
    
    // Show success message
    toast({
      title: "Diaper change added",
      description: "The diaper change has been successfully logged.",
    });
  };
  
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
                    placeholder="Color, consistency, etc."
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
      </div>
    </Layout>
  );
};

export default DiaperPage;
