
import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader } from "@/components/ui/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby } from "@/types/models";
import { getBabies, updateBaby, deleteBaby } from "@/services/babyService";
import { formatDate } from "@/lib/date-utils";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [babyName, setBabyName] = useState("");
  const [babyWeight, setBabyWeight] = useState("");
  const [babyHeight, setBabyHeight] = useState("");
  const [babyNote, setBabyNote] = useState("");

  // Fetch user avatar if available
  useEffect(() => {
    async function fetchAvatar() {
      if (!user) return;
      
      try {
        // Check if user has an avatar in storage
        const { data, error } = await supabase.storage
          .from('avatars')
          .download(`${user.id}.jpg`);
          
        if (error || !data) {
          // No avatar found, use initials (handled by fallback)
          return;
        }
        
        const url = URL.createObjectURL(data);
        setAvatarUrl(url);
        
      } catch (error) {
        console.error('Error downloading avatar:', error);
      }
    }
    
    fetchAvatar();
    
    return () => {
      // Clean up object URL on unmount
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    };
  }, [user]);

  // Fetch babies data
  const { 
    data: babies = [], 
    isLoading: isLoadingBabies,
    error: babiesError,
  } = useQuery({
    queryKey: ['babies'],
    queryFn: getBabies,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update baby mutation
  const updateBabyMutation = useMutation({
    mutationFn: updateBaby,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies'] });
      toast({
        title: "Baby updated",
        description: "Baby information has been updated successfully",
      });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating baby:", error);
      toast({
        title: "Error",
        description: "Failed to update baby information. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete baby mutation
  const deleteBabyMutation = useMutation({
    mutationFn: deleteBaby,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies'] });
      toast({
        title: "Baby deleted",
        description: "Baby has been deleted successfully",
      });
      setSelectedBaby(null);
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting baby:", error);
      toast({
        title: "Error",
        description: "Failed to delete baby. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    setIsUploading(true);
    
    try {
      // Create avatars bucket if it doesn't exist
      const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
        public: false,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
      });
      
      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}.jpg`, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL of the uploaded file
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your profile picture",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Open edit dialog with baby data
  const handleEditBaby = (baby: Baby) => {
    setSelectedBaby(baby);
    setBabyName(baby.name);
    setBabyWeight(baby.weight ? baby.weight.toString() : "");
    setBabyHeight(baby.height ? baby.height.toString() : "");
    setBabyNote(""); // Add note field to baby model if needed
    setEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteBaby = (baby: Baby) => {
    setSelectedBaby(baby);
    setDeleteDialogOpen(true);
  };

  // Submit baby update
  const handleUpdateBaby = () => {
    if (!selectedBaby) return;
    
    updateBabyMutation.mutate({
      ...selectedBaby,
      name: babyName,
      weight: babyWeight ? parseFloat(babyWeight) : null,
      height: babyHeight ? parseFloat(babyHeight) : null,
    });
  };

  // Confirm baby deletion
  const handleConfirmDelete = () => {
    if (!selectedBaby) return;
    deleteBabyMutation.mutate(selectedBaby.id);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Get initials from email for fallback avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Get background color from email for fallback avatar
  const getAvatarColor = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  if (isLoadingBabies) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={user?.email || "User"} />
                ) : (
                  <AvatarFallback style={{ backgroundColor: getAvatarColor(user?.email || '') }}>
                    {getInitials(user?.email || "U")}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <Loader size="small" className="text-white" />
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-lg">+</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{user?.email}</h2>
              <p className="text-gray-500 text-sm">Member since {formatDate(new Date(user?.created_at || ""))}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </Card>
        
        <Tabs defaultValue="babies" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="babies">My Babies</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="babies">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">My Babies</h2>
                <Button onClick={() => navigate("/add-baby")}>Add New Baby</Button>
              </div>
              
              {babies.length === 0 ? (
                <div className="text-center p-8 border rounded-lg">
                  <p className="text-gray-500 mb-4">You don't have any babies added yet.</p>
                  <Button onClick={() => navigate("/add-baby")}>Add Your First Baby</Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {babies.map((baby) => (
                    <Card key={baby.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{baby.name}</h3>
                          <p className="text-gray-500 text-sm">Born on {formatDate(baby.birthDate)}</p>
                          {baby.weight && (
                            <p className="text-sm">Weight: {baby.weight} kg</p>
                          )}
                          {baby.height && (
                            <p className="text-sm">Height: {baby.height} cm</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditBaby(baby)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteBaby(baby)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user?.email || ""} readOnly />
                </div>
                <div className="pt-2 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => navigate("/settings")}>
                    App Settings
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Edit Baby Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Baby Information</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="baby-name">Name</Label>
                <Input
                  id="baby-name"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="baby-weight">Weight (kg)</Label>
                <Input
                  id="baby-weight"
                  type="number"
                  step="0.01"
                  value={babyWeight}
                  onChange={(e) => setBabyWeight(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="baby-height">Height (cm)</Label>
                <Input
                  id="baby-height"
                  type="number"
                  step="0.1"
                  value={babyHeight}
                  onChange={(e) => setBabyHeight(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="baby-note">Notes (optional)</Label>
                <Textarea
                  id="baby-note"
                  value={babyNote}
                  onChange={(e) => setBabyNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleUpdateBaby}
                disabled={updateBabyMutation.isPending}
              >
                {updateBabyMutation.isPending ? (
                  <>
                    <Loader size="small" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Baby Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedBaby?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-500 hover:bg-red-600"
                onClick={handleConfirmDelete}
              >
                {deleteBabyMutation.isPending ? (
                  <>
                    <Loader size="small" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default ProfilePage;
