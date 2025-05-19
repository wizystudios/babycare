import React, { useEffect, useState } from "react";
import { MockStorage } from "@/services/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Milestone } from "@/types/models";
import { formatDate } from "@/lib/date-utils";
import { MilestoneIcon, AddIcon } from "@/components/BabyIcons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

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
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>(milestoneCategories[0]);
  
  useEffect(() => {
    // Load milestone data
    const milestonesData = MockStorage.getMilestones();
    setMilestones(milestonesData);
  }, []);
  
  // Group milestones by category
  const groupedMilestones: Record<string, Milestone[]> = {};
  
  milestones.forEach(milestone => {
    const categoryKey = milestone.category || "Other";
    if (!groupedMilestones[categoryKey]) {
      groupedMilestones[categoryKey] = [];
    }
    groupedMilestones[categoryKey].push(milestone);
  });
  
  const handleSaveMilestone = () => {
    const newMilestone = {
      babyId: "baby1",
      title,
      date: new Date(date),
      description: description || undefined,
      category,
      photoUrls: [] as string[],
    };
    
    const addedMilestone = MockStorage.addMilestone(newMilestone);
    setMilestones([addedMilestone, ...milestones]);
    
    // Reset form
    setTitle("");
    setDate(new Date().toISOString().substring(0, 10));
    setDescription("");
    setCategory(milestoneCategories[0]);
    
    // Close dialog
    setDialogOpen(false);
    
    // Show success message
    toast({
      title: "Milestone added",
      description: "The milestone has been successfully recorded.",
    });
  };
  
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
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="First smile, first step, etc."
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
                      <SelectValue placeholder="Select category" />
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
      </div>
    </Layout>
  );
};

export default MilestonesPage;
