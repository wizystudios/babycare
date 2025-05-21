
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { DiaperEntry } from "@/components/trackers/DiaperEntry";
import { Diaper, DiaperType } from "@/types/models";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddIcon } from "@/components/BabyIcons";
import { getRelativeTimeLabel } from "@/lib/date-utils";
import { useToast } from "@/components/ui/use-toast";
import { getDiapersByBabyId, addDiaper } from "@/services/diaperService";
import { useBaby } from "@/hooks/useBaby";
import { Loader } from "@/components/ui/loader";
import { EnhancedDiaperForm } from "@/components/forms/EnhancedDiaperForm";
import { StoolColorChart } from "@/components/trackers/StoolColorChart";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DiaperPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentBaby, babies } = useBaby();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showColorChart, setShowColorChart] = useState(false);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  
  // Initialize selected baby
  React.useEffect(() => {
    if (currentBaby && !selectedBabyId) {
      setSelectedBabyId(currentBaby.id);
    }
  }, [currentBaby, selectedBabyId]);
  
  // Fetch diapers data
  const { 
    data: diapers = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['diapers', selectedBabyId],
    queryFn: async () => {
      if (!selectedBabyId) return [];
      return getDiapersByBabyId(selectedBabyId);
    },
    enabled: !!selectedBabyId,
    staleTime: 60 * 1000, // 1 minute
  });

  // Add diaper mutation
  const addDiaperMutation = useMutation({
    mutationFn: addDiaper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diapers', selectedBabyId] });
      setDialogOpen(false);
      
      toast({
        title: t("diaper.successTitle"),
        description: t("diaper.successDescription"),
      });
    },
    onError: (error) => {
      console.error("Error adding diaper:", error);
      toast({
        title: t("diaper.errorTitle"),
        description: t("diaper.errorDescription"),
        variant: "destructive",
      });
    }
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
  
  // Handle saving diaper
  const handleSaveDiaper = async (diaperData: Omit<Diaper, 'id'>) => {
    if (!selectedBabyId) {
      toast({
        title: "Error",
        description: "No baby selected",
        variant: "destructive"
      });
      return;
    }
    
    const newDiaper = {
      ...diaperData,
      babyId: selectedBabyId
    };
    
    addDiaperMutation.mutate(newDiaper);
  };

  // Handle baby selection change
  const handleBabyChange = (babyId: string) => {
    setSelectedBabyId(babyId);
  };

  if (!selectedBabyId) {
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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-2xl font-bold">{t("diaper.title")}</h1>
          
          <div className="flex flex-wrap gap-2">
            {babies.length > 1 && (
              <Select value={selectedBabyId} onValueChange={handleBabyChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select baby" />
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
            
            <Button variant="outline" onClick={() => setShowColorChart(!showColorChart)}>
              {showColorChart ? t("diaper.hideColorChart") : t("diaper.showColorChart")}
            </Button>
            
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
                
                <EnhancedDiaperForm 
                  onSave={handleSaveDiaper}
                  isLoading={addDiaperMutation.isPending}
                  onCancel={() => setDialogOpen(false)}
                  initialValues={{ babyId: selectedBabyId }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {showColorChart && (
          <div className="mb-6">
            <StoolColorChart />
          </div>
        )}
        
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
        
        {diapers.length > 0 && (
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">{t('diaper.tip')}: </span>
              {t('diaper.averageDiapers')}
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DiaperPage;
