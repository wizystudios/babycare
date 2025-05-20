
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
  const { currentBaby } = useBaby();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>(milestoneCategories[0]);

  // Fetch milestones data from Supabase
  const { data: milestones, isLoading, error, refetch } = useQuery({
    queryKey: ['milestones', currentBaby?.id],
    queryFn: () => currentBaby ? getMilestonesByBabyId(currentBaby.id) : Promise.resolve([]),
    enabled: !!currentBaby,
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
  
  const handleSaveMilestone = async () => {
    if (!currentBaby) {
      toast({
        title: t("error.noBabySelected"),
        description: t("error.selectBabyFirst"),
        variant: "destructive",
      });
      return;
    }

    try {
      const newMilestone = {
        babyId: currentBaby.id,
        title,
        date: new Date(date),
        description: description || undefined,
        category,
        photoUrls: [] as string[],
      };
      
      await addMilestone(newMilestone);
      
      // Refetch the milestones
      refetch();
      
      // Reset form
      setTitle("");
      setDate(new Date().toISOString().substring(0, 10));
      setDescription("");
      setCategory(milestoneCategories[0]);
      
      // Close dialog
      setDialogOpen(false);
      
      // Show success message
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
                <div className="space-y-2">
                  <Label htmlFor="title">{t("milestone.title")}</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("milestone.titlePlaceholder")}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="milestone-date">{t("milestone.date")}</Label>
                  <Input
                    id="milestone-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">{t("milestone.category")}</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("milestone.selectCategory")} />
                    </SelectTrigger>
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
