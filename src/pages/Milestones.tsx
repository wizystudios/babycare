import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Milestone } from "@/types/models";
import { formatDate } from "@/lib/date-utils";
import { getMilestonesByBabyId, addMilestone } from "@/services/milestoneService";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@/components/ui/loader";
import { MilestoneIcon, AddIcon } from "@/components/BabyIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBaby } from "@/hooks/useBaby";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb } from "lucide-react";

const milestoneCategories = [
  "Social",
  "Motor Skills", 
  "Cognitive",
  "Language",
  "Physical",
  "Other"
];

const MilestonesPage = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { selectedBaby } = useBaby();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>(milestoneCategories[0]);

  const babyAgeInMonths = selectedBaby 
    ? Math.floor((new Date().getTime() - new Date(selectedBaby.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 0;

  const getSuggestedMilestones = () => {
    if (babyAgeInMonths < 3) {
      return ['First smile', 'Lifts head during tummy time', 'Follows objects with eyes'];
    } else if (babyAgeInMonths < 6) {
      return ['Rolls over', 'Sits with support', 'Responds to own name'];
    } else if (babyAgeInMonths < 9) {
      return ['Sits without support', 'Crawls', 'Says "mama" or "dada"'];
    } else if (babyAgeInMonths < 12) {
      return ['Pulls to stand', 'Waves bye-bye', 'Picks up small objects'];
    } else if (babyAgeInMonths < 18) {
      return ['First steps', 'Says first words', 'Drinks from cup'];
    } else {
      return ['Runs', 'Kicks ball', 'Forms simple sentences'];
    }
  };

  // Fetch milestones data from Supabase
  const { data: milestones, isLoading, error, refetch } = useQuery({
    queryKey: ['milestones', selectedBaby?.id],
    queryFn: () => selectedBaby ? getMilestonesByBabyId(selectedBaby.id) : Promise.resolve([]),
    enabled: !!selectedBaby,
  });
  
  // Group milestones by category
  const groupedMilestones: Record<string, Milestone[]> = {};
  
  if (milestones && milestones.length > 0) {
    milestones.forEach(milestone => {
      const categoryKey = milestone.category || "Other";
      if (!groupedMilestones[categoryKey]) {
        groupedMilestones[categoryKey] = [];
      }
      groupedMilestones[categoryKey].push(milestone);
    });
  }
  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedBaby) return;
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${selectedBaby.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('baby-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('baby-images').getPublicUrl(fileName);
        uploadedUrls.push(publicUrl);
      }
      setPhotoUrls([...photoUrls, ...uploadedUrls]);
      toast({ title: 'Photos uploaded successfully' });
    } catch (error) {
      toast({ title: 'Error uploading photos', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveMilestone = async () => {
    if (!selectedBaby) {
      toast({
        title: t("error.noBabySelected"),
        description: t("error.selectBabyFirst"),
        variant: "destructive",
      });
      return;
    }

    try {
      const newMilestone = {
        babyId: selectedBaby.id,
        title,
        date: new Date(date),
        description: description || undefined,
        category,
        photoUrls: photoUrls,
      };
      
      await addMilestone(newMilestone);
      refetch();
      setTitle("");
      setDate(new Date().toISOString().substring(0, 10));
      setDescription("");
      setCategory(milestoneCategories[0]);
      setPhotoUrls([]);
      setDialogOpen(false);
      toast({
        title: t("milestone.added"),
        description: t("milestone.addedSuccess"),
      });
    } catch (error) {
      console.error("Error adding milestone:", error);
      toast({
        title: t("error.addingMilestone"),
        description: t("error.tryAgain"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center p-8 h-full">
          <Loader />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-4 text-center">
          <p className="text-red-500">{t("error.loadingMilestones")}</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            {t("common.tryAgain")}
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t("milestone.title")}</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <AddIcon className="w-4 h-4 mr-2" />
                {t("milestone.newMilestone")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("milestone.newMilestone")}</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="bg-muted/30 p-2 rounded-md">
                  <div className="flex items-start gap-1">
                    <Lightbulb className="h-3 w-3 text-primary mt-0.5" />
                    <div>
                      <p className="text-[10px] font-medium mb-1">Suggestions for {babyAgeInMonths} months old:</p>
                      <div className="flex flex-wrap gap-1">
                        {getSuggestedMilestones().map((suggestion) => (
                          <Button key={suggestion} variant="outline" size="sm" className="h-5 text-[9px] px-1.5" onClick={() => setTitle(suggestion)}>
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">{t("milestone.title")}</Label>
                  <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("milestone.titlePlaceholder")} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="milestone-date">{t("milestone.date")}</Label>
                  <Input id="milestone-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">{t("milestone.category")}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("milestone.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {milestoneCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t("milestone.description")}</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("milestone.descriptionPlaceholder")} rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Photos</Label>
                  <Input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} className="h-7 text-xs" />
                  {uploading && <span className="text-[10px]">Uploading...</span>}
                  {photoUrls.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {photoUrls.map((url, i) => (
                        <img key={i} src={url} alt={`Upload ${i}`} className="h-12 w-12 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
                
                <Button onClick={handleSaveMilestone} disabled={!title.trim()} className="w-full">
                  {t("milestone.saveMilestone")}
                </Button>
              </div>
                    <SelectContent>
                      {milestoneCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">{t("milestone.description")}</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("milestone.descriptionPlaceholder")}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    {t("milestone.cancel")}
                  </Button>
                  <Button onClick={handleSaveMilestone}>
                    {t("milestone.save")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {(!milestones || milestones.length === 0) ? (
          <div className="text-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <MilestoneIcon className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">{t("milestone.noMilestones")}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("milestone.noMilestonesDescription")}
            </p>
            <Button className="mt-4" onClick={() => setDialogOpen(true)}>
              <AddIcon className="w-4 h-4 mr-2" />
              {t("milestone.addFirst")}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMilestones).map(([category, categoryMilestones]) => (
              <div key={category} className="space-y-3">
                <h2 className="text-xl font-semibold">{category}</h2>
                <div className="space-y-4">
                  {categoryMilestones
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map((milestone) => (
                      <Card key={milestone.id} className="p-4 border-l-4 border-l-baby-yellow">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 p-2 bg-baby-yellow/20 rounded-full">
                            <MilestoneIcon className="w-5 h-5 text-baby-yellow" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <h3 className="font-medium">{milestone.title}</h3>
                              <span className="text-sm text-gray-500">{formatDate(milestone.date)}</span>
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-gray-500 mt-2">{milestone.description}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MilestonesPage;
