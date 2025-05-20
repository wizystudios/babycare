
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { FeedingEntry } from "@/components/trackers/FeedingEntry";
import type { Feeding, FeedingType, Baby } from "@/types/models";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { BottleIcon, BreastIcon, AddIcon } from "@/components/BabyIcons";
import { formatTime, getRelativeTimeLabel, isSameDay } from "@/lib/date-utils";
import { useToast } from "@/components/ui/use-toast";
import { getFeedingsByBabyId, addFeeding } from "@/services/feedingService";
import { getBabies } from "@/services/babyService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader } from "@/components/ui/loader";

const Feeding = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  
  // Form state
  const [feedingType, setFeedingType] = useState<FeedingType>("bottle");
  const [startTime, setStartTime] = useState<string>(
    new Date().toISOString().substring(0, 16)
  );
  const [endTime, setEndTime] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  
  // Fetch babies data
  const { 
    data: babies = [],
    isLoading: isLoadingBabies,
    error: babiesError
  } = useQuery({
    queryKey: ['babies'],
    queryFn: getBabies,
    enabled: !!user,
  });
  
  // Set first baby as selected by default
  React.useEffect(() => {
    if (babies.length > 0 && !selectedBabyId) {
      setSelectedBabyId(babies[0].id);
    }
  }, [babies, selectedBabyId]);
  
  // Fetch feedings for selected baby
  const {
    data: feedings = [],
    isLoading: isLoadingFeedings,
    error: feedingsError
  } = useQuery({
    queryKey: ['feedings', selectedBabyId],
    queryFn: () => selectedBabyId ? getFeedingsByBabyId(selectedBabyId) : Promise.resolve([]),
    enabled: !!selectedBabyId,
  });
  
  // Add feeding mutation
  const addFeedingMutation = useMutation({
    mutationFn: addFeeding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedings', selectedBabyId] });
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
    },
    onError: (error) => {
      console.error("Error adding feeding:", error);
      toast({
        title: "Error",
        description: "Failed to add feeding. Please try again.",
        variant: "destructive",
      });
    }
  });
  
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
    if (!selectedBabyId) {
      toast({
        title: "Error",
        description: "Please select a baby first",
        variant: "destructive",
      });
      return;
    }
    
    const startDateTime = new Date(startTime);
    
    let endDateTime: Date | undefined;
    let duration: number | undefined;
    
    if (endTime) {
      endDateTime = new Date(endTime);
      // Calculate duration in minutes
      duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
    }
    
    const newFeeding: Omit<Feeding, 'id'> = {
      babyId: selectedBabyId,
      type: feedingType,
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
      amount: amount ? Number(amount) : undefined,
      note: note || undefined,
    };
    
    addFeedingMutation.mutate(newFeeding);
  };
  
  // Show instructions for first-time users
  const showInstructions = feedings.length === 0;
  
  // Handle baby change
  const handleBabyChange = (babyId: string) => {
    setSelectedBabyId(babyId);
  };
  
  if (isLoadingBabies) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[70vh]">
          <Loader size="large" />
        </div>
      </Layout>
    );
  }
  
  if (babiesError) {
    return (
      <Layout>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load baby data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }
  
  if (babies.length === 0) {
    return (
      <Layout>
        <div className="p-4 flex flex-col items-center justify-center h-[70vh] text-center">
          <BottleIcon className="w-16 h-16 mb-4 text-baby-blue opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No babies added yet</h2>
          <p className="text-gray-500 mb-6">Start by adding your baby's information</p>
          <Button onClick={() => window.location.href = "/add-baby"}>Add Your Baby</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-2xl font-bold">{t("feeding.title")}</h1>
          
          <div className="flex flex-wrap gap-2">
            {babies.length > 1 && (
              <Select value={selectedBabyId || undefined} onValueChange={handleBabyChange}>
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
                    <Button 
                      onClick={handleSaveFeeding}
                      disabled={addFeedingMutation.isPending}
                    >
                      {addFeedingMutation.isPending ? (
                        <>
                          <Loader size="small" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        t("feeding.save")
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {showInstructions && (
          <Card className="p-4 mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2">📝 How to track feedings</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Track every feeding session by clicking the "+ New Feeding" button. You can record:
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc pl-5 mb-2">
              <li>Breastfeeding (left/right)</li>
              <li>Bottle feeding (with amount)</li>
              <li>Formula feeding</li>
              <li>Solid foods</li>
            </ul>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              All data is synced to your account and can be viewed across devices.
            </p>
          </Card>
        )}
        
        {isLoadingFeedings ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : feedingsError ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load feeding data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="breast">Breast</TabsTrigger>
              <TabsTrigger value="bottle">Bottle</TabsTrigger>
              <TabsTrigger value="solid">Solid</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {Object.keys(groupedFeedings).length > 0 ? (
                Object.keys(groupedFeedings).map(dateKey => (
                  <div key={dateKey} className="space-y-3">
                    <h2 className="text-lg font-semibold">{dateKey}</h2>
                    {groupedFeedings[dateKey].map(feeding => (
                      <FeedingEntry key={feeding.id} feeding={feeding} />
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No feeding records yet</p>
                  <Button 
                    variant="ghost"
                    className="mt-2"
                    onClick={() => setDialogOpen(true)}
                  >
                    Add your first feeding record
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="breast" className="space-y-6">
              {Object.keys(groupedFeedings).some(dateKey => 
                groupedFeedings[dateKey].some(f => f.type === "breast-left" || f.type === "breast-right")
              ) ? (
                Object.keys(groupedFeedings).map(dateKey => {
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
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No breastfeeding records yet</p>
                  <Button 
                    variant="ghost"
                    className="mt-2"
                    onClick={() => {
                      setFeedingType("breast-left");
                      setDialogOpen(true);
                    }}
                  >
                    Add breastfeeding record
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="bottle" className="space-y-6">
              {Object.keys(groupedFeedings).some(dateKey => 
                groupedFeedings[dateKey].some(f => f.type === "bottle" || f.type === "formula")
              ) ? (
                Object.keys(groupedFeedings).map(dateKey => {
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
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No bottle feeding records yet</p>
                  <Button 
                    variant="ghost"
                    className="mt-2"
                    onClick={() => {
                      setFeedingType("bottle");
                      setDialogOpen(true);
                    }}
                  >
                    Add bottle feeding record
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="solid" className="space-y-6">
              {Object.keys(groupedFeedings).some(dateKey => 
                groupedFeedings[dateKey].some(f => f.type === "solid")
              ) ? (
                Object.keys(groupedFeedings).map(dateKey => {
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
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No solid food records yet</p>
                  <Button 
                    variant="ghost"
                    className="mt-2"
                    onClick={() => {
                      setFeedingType("solid");
                      setDialogOpen(true);
                    }}
                  >
                    Add solid food record
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Feeding;
