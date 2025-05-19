
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Growth, Vaccination, HealthRecord } from "@/types/models";
import { formatDate } from "@/lib/date-utils";
import { GrowthIcon, HealthIcon } from "@/components/BabyIcons";
import { AddIcon } from "@/components/BabyIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getBabies } from "@/services/babyService";
import { getGrowthRecords, getVaccinations, getHealthRecords, addGrowthRecord, addVaccination, addHealthRecord } from "@/services/healthService";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const HealthPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [babyId, setBabyId] = useState<string>("");
  const [babies, setBabies] = useState<Array<{ id: string; name: string }>>([]);
  const [growthRecords, setGrowthRecords] = useState<Growth[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [growthDialogOpen, setGrowthDialogOpen] = useState(false);
  const [vaccinationDialogOpen, setVaccinationDialogOpen] = useState(false);
  const [healthRecordDialogOpen, setHealthRecordDialogOpen] = useState(false);
  
  // Growth form state
  const [growthDate, setGrowthDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [weight, setWeight] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [headCircumference, setHeadCircumference] = useState<string>("");
  const [growthNote, setGrowthNote] = useState<string>("");
  
  // Vaccination form state
  const [vaccineName, setVaccineName] = useState<string>("");
  const [vaccineDate, setVaccineDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [nextDueDate, setNextDueDate] = useState<string>("");
  const [batchNumber, setBatchNumber] = useState<string>("");
  const [vaccineNote, setVaccineNote] = useState<string>("");
  
  // Health record form state
  const [healthType, setHealthType] = useState<string>("fever");
  const [healthDate, setHealthDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [healthValue, setHealthValue] = useState<string>("");
  const [medication, setMedication] = useState<string>("");
  const [dosage, setDosage] = useState<string>("");
  const [healthNote, setHealthNote] = useState<string>("");
  
  // Check if user is authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);
  
  // Load babies data
  useEffect(() => {
    const loadBabies = async () => {
      try {
        if (!user) return;
        
        const babiesData = await getBabies();
        setBabies(babiesData.map(baby => ({ id: baby.id, name: baby.name })));
        
        if (babiesData.length > 0) {
          setBabyId(babiesData[0].id);
        }
      } catch (error) {
        console.error("Error loading babies:", error);
        toast({
          title: "Error",
          description: "Failed to load babies data",
          variant: "destructive",
        });
      }
    };
    
    loadBabies();
  }, [user, toast]);
  
  // Load health data when baby is selected
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        if (!babyId) {
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        
        // Load growth records
        const growthData = await getGrowthRecords(babyId);
        setGrowthRecords(growthData);
        
        // Load vaccination records
        const vaccinationData = await getVaccinations(babyId);
        setVaccinations(vaccinationData);
        
        // Load health records
        const healthRecordData = await getHealthRecords(babyId);
        setHealthRecords(healthRecordData);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading health data:", error);
        toast({
          title: "Error",
          description: "Failed to load health data",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    loadHealthData();
  }, [babyId, toast]);
  
  const handleSaveGrowth = async () => {
    try {
      const newGrowth: Omit<Growth, 'id'> = {
        babyId: babyId,
        date: new Date(growthDate),
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        headCircumference: headCircumference ? Number(headCircumference) : undefined,
        note: growthNote || undefined,
      };
      
      const addedGrowth = await addGrowthRecord(newGrowth);
      setGrowthRecords([addedGrowth, ...growthRecords]);
      
      // Reset form
      setGrowthDate(new Date().toISOString().substring(0, 10));
      setWeight("");
      setHeight("");
      setHeadCircumference("");
      setGrowthNote("");
      
      // Close dialog
      setGrowthDialogOpen(false);
      
      // Show success message
      toast({
        title: "Growth record added",
        description: "The growth record has been successfully logged.",
      });
    } catch (error) {
      console.error("Error saving growth record:", error);
      toast({
        title: "Error",
        description: "Failed to save growth record",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveVaccination = async () => {
    try {
      const newVaccination: Omit<Vaccination, 'id'> = {
        babyId: babyId,
        name: vaccineName,
        date: new Date(vaccineDate),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        batchNumber: batchNumber || undefined,
        note: vaccineNote || undefined,
      };
      
      const addedVaccination = await addVaccination(newVaccination);
      setVaccinations([addedVaccination, ...vaccinations]);
      
      // Reset form
      setVaccineName("");
      setVaccineDate(new Date().toISOString().substring(0, 10));
      setNextDueDate("");
      setBatchNumber("");
      setVaccineNote("");
      
      // Close dialog
      setVaccinationDialogOpen(false);
      
      // Show success message
      toast({
        title: "Vaccination added",
        description: "The vaccination has been successfully logged.",
      });
    } catch (error) {
      console.error("Error saving vaccination:", error);
      toast({
        title: "Error",
        description: "Failed to save vaccination",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveHealthRecord = async () => {
    try {
      const newHealthRecord: Omit<HealthRecord, 'id'> = {
        babyId: babyId,
        type: healthType,
        date: new Date(healthDate),
        value: healthValue || undefined,
        medication: medication || undefined,
        dosage: dosage || undefined,
        note: healthNote || undefined,
      };
      
      const addedHealthRecord = await addHealthRecord(newHealthRecord);
      setHealthRecords([addedHealthRecord, ...healthRecords]);
      
      // Reset form
      setHealthType("fever");
      setHealthDate(new Date().toISOString().substring(0, 10));
      setHealthValue("");
      setMedication("");
      setDosage("");
      setHealthNote("");
      
      // Close dialog
      setHealthRecordDialogOpen(false);
      
      // Show success message
      toast({
        title: "Health record added",
        description: "The health record has been successfully logged.",
      });
    } catch (error) {
      console.error("Error saving health record:", error);
      toast({
        title: "Error",
        description: "Failed to save health record",
        variant: "destructive",
      });
    }
  };
  
  // If no babies available, show message
  if (!isLoading && babies.length === 0) {
    return (
      <Layout>
        <div className="p-4 flex flex-col items-center justify-center h-[80vh]">
          <Card className="p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold mb-4">{t("common.noBabyFound")}</h2>
            <p className="mb-4">{t("common.addBabyPrompt")}</p>
            <Button onClick={() => navigate('/settings')}>{t("common.addBaby")}</Button>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t("health.title")}</h1>
          
          {babies.length > 1 && (
            <Select value={babyId} onValueChange={setBabyId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("common.selectBaby")} />
              </SelectTrigger>
              <SelectContent>
                {babies.map(baby => (
                  <SelectItem key={baby.id} value={baby.id}>{baby.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>{t("common.loading")}</p>
          </div>
        ) : (
          <Tabs defaultValue="growth">
            <TabsList className="mb-4">
              <TabsTrigger value="growth">{t("health.growth")}</TabsTrigger>
              <TabsTrigger value="vaccinations">{t("health.vaccinations")}</TabsTrigger>
              <TabsTrigger value="records">{t("health.records")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="growth">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t("health.growth")}</h2>
                
                <Dialog open={growthDialogOpen} onOpenChange={setGrowthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <AddIcon className="w-4 h-4 mr-2" />
                      {t("health.addGrowth")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("health.addGrowth")}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="growth-date">{t("health.date")}</Label>
                        <Input
                          id="growth-date"
                          type="date"
                          value={growthDate}
                          onChange={(e) => setGrowthDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="weight">{t("health.weight")} (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="height">{t("health.height")} (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          step="0.1"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="head-circumference">{t("health.headCircumference")} (cm)</Label>
                        <Input
                          id="head-circumference"
                          type="number"
                          step="0.1"
                          value={headCircumference}
                          onChange={(e) => setHeadCircumference(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="growth-note">{t("health.note")}</Label>
                        <Textarea
                          id="growth-note"
                          value={growthNote}
                          onChange={(e) => setGrowthNote(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setGrowthDialogOpen(false)}>
                          {t("common.cancel")}
                        </Button>
                        <Button onClick={handleSaveGrowth}>
                          {t("common.save")}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {growthRecords.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p>{t("health.noGrowthRecords")}</p>
                  </Card>
                ) : (
                  growthRecords.map((growth) => (
                    <Card key={growth.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-baby-yellow/20 rounded-full">
                          <GrowthIcon className="w-5 h-5 text-baby-yellow" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{formatDate(growth.date)}</h3>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {growth.weight && (
                              <div>
                                <p className="text-sm text-gray-500">{t("health.weight")}</p>
                                <p className="font-medium">{growth.weight} kg</p>
                              </div>
                            )}
                            {growth.height && (
                              <div>
                                <p className="text-sm text-gray-500">{t("health.height")}</p>
                                <p className="font-medium">{growth.height} cm</p>
                              </div>
                            )}
                            {growth.headCircumference && (
                              <div>
                                <p className="text-sm text-gray-500">{t("health.headCircumference")}</p>
                                <p className="font-medium">{growth.headCircumference} cm</p>
                              </div>
                            )}
                          </div>
                          {growth.note && (
                            <p className="text-sm text-gray-500 mt-2 italic">{growth.note}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="vaccinations">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t("health.vaccinations")}</h2>
                
                <Dialog open={vaccinationDialogOpen} onOpenChange={setVaccinationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <AddIcon className="w-4 h-4 mr-2" />
                      {t("health.addVaccination")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("health.addVaccination")}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="vaccine-name">{t("health.name")}</Label>
                        <Input
                          id="vaccine-name"
                          type="text"
                          value={vaccineName}
                          onChange={(e) => setVaccineName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vaccine-date">{t("health.date")}</Label>
                        <Input
                          id="vaccine-date"
                          type="date"
                          value={vaccineDate}
                          onChange={(e) => setVaccineDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="next-due-date">{t("health.nextDueDate")}</Label>
                        <Input
                          id="next-due-date"
                          type="date"
                          value={nextDueDate}
                          onChange={(e) => setNextDueDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="batch-number">{t("health.batchNumber")}</Label>
                        <Input
                          id="batch-number"
                          type="text"
                          value={batchNumber}
                          onChange={(e) => setBatchNumber(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="vaccine-note">{t("health.note")}</Label>
                        <Textarea
                          id="vaccine-note"
                          value={vaccineNote}
                          onChange={(e) => setVaccineNote(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setVaccinationDialogOpen(false)}>
                          {t("common.cancel")}
                        </Button>
                        <Button onClick={handleSaveVaccination}>
                          {t("common.save")}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {vaccinations.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p>{t("health.noVaccinations")}</p>
                  </Card>
                ) : (
                  vaccinations.map((vaccination) => (
                    <Card key={vaccination.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-baby-blue/20 rounded-full">
                          <HealthIcon className="w-5 h-5 text-baby-blue" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{vaccination.name}</h3>
                            <span className="text-sm text-gray-500">{formatDate(vaccination.date)}</span>
                          </div>
                          <div className="mt-1">
                            {vaccination.nextDueDate && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t("health.nextDueDate")}</span>
                                <span>{formatDate(vaccination.nextDueDate)}</span>
                              </div>
                            )}
                            {vaccination.batchNumber && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t("health.batchNumber")}</span>
                                <span>{vaccination.batchNumber}</span>
                              </div>
                            )}
                          </div>
                          {vaccination.note && (
                            <p className="text-sm text-gray-500 mt-2 italic">{vaccination.note}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="records">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t("health.records")}</h2>
                
                <Dialog open={healthRecordDialogOpen} onOpenChange={setHealthRecordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <AddIcon className="w-4 h-4 mr-2" />
                      {t("health.addRecord")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{t("health.addRecord")}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="health-type">{t("health.type")}</Label>
                        <Input
                          id="health-type"
                          type="text"
                          value={healthType}
                          onChange={(e) => setHealthType(e.target.value)}
                          placeholder="fever, cough, medication, etc."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="health-date">{t("health.date")}</Label>
                        <Input
                          id="health-date"
                          type="date"
                          value={healthDate}
                          onChange={(e) => setHealthDate(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="health-value">{t("health.value")}</Label>
                        <Input
                          id="health-value"
                          type="text"
                          value={healthValue}
                          onChange={(e) => setHealthValue(e.target.value)}
                          placeholder="e.g. 38.5°C for fever"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medication">{t("health.medication")}</Label>
                        <Input
                          id="medication"
                          type="text"
                          value={medication}
                          onChange={(e) => setMedication(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dosage">{t("health.dosage")}</Label>
                        <Input
                          id="dosage"
                          type="text"
                          value={dosage}
                          onChange={(e) => setDosage(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="health-note">{t("health.note")}</Label>
                        <Textarea
                          id="health-note"
                          value={healthNote}
                          onChange={(e) => setHealthNote(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setHealthRecordDialogOpen(false)}>
                          {t("common.cancel")}
                        </Button>
                        <Button onClick={handleSaveHealthRecord}>
                          {t("common.save")}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-4">
                {healthRecords.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p>{t("health.noHealthRecords")}</p>
                  </Card>
                ) : (
                  healthRecords.map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-baby-lavender/20 rounded-full">
                          <HealthIcon className="w-5 h-5 text-baby-lavender" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h3 className="font-medium capitalize">{record.type}</h3>
                            <span className="text-sm text-gray-500">{formatDate(record.date)}</span>
                          </div>
                          <div className="mt-2">
                            {record.value && (
                              <div className="text-sm">
                                <span className="text-gray-500 mr-2">{t("health.value")}:</span>
                                <span className="font-medium">{record.value}</span>
                              </div>
                            )}
                            {record.medication && (
                              <div className="text-sm">
                                <span className="text-gray-500 mr-2">{t("health.medication")}:</span>
                                <span className="font-medium">{record.medication}</span>
                                {record.dosage && <span> ({record.dosage})</span>}
                              </div>
                            )}
                          </div>
                          {record.note && (
                            <p className="text-sm text-gray-500 mt-2 italic">{record.note}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default HealthPage;
