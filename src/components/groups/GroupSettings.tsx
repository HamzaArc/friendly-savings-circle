
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Save, Trash2 } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const groupSettingsSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters"),
  description: z.string().optional(),
  contributionAmount: z.coerce.number().min(1, "Contribution must be at least 1"),
  contributionFrequency: z.string(),
  maxMembers: z.coerce.number().min(2, "At least 2 members required").max(100, "Maximum 100 members allowed"),
  isPublic: z.boolean().default(false),
  allowJoinRequests: z.boolean().default(true),
});

type GroupSettingsFormValues = z.infer<typeof groupSettingsSchema>;

interface GroupSettingsProps {
  groupId: string;
}

const GroupSettings = ({ groupId }: GroupSettingsProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [group, setGroup] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<GroupSettingsFormValues>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      name: "",
      description: "",
      contributionAmount: 100,
      contributionFrequency: "Monthly",
      maxMembers: 10,
      isPublic: false,
      allowJoinRequests: true,
    }
  });
  
  const loadGroupData = () => {
    setLoading(true);
    
    // Get current user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || "1";
    
    // Get group data
    const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const currentGroup = storedGroups.find((g: any) => g.id === groupId);
    
    if (currentGroup) {
      // Check if user is admin
      const isUserAdmin = currentGroup.membersList && 
        currentGroup.membersList.some((m: any) => m.id === userId && m.isAdmin);
      
      setIsAdmin(isUserAdmin);
      setGroup(currentGroup);
      
      // Set form values
      form.reset({
        name: currentGroup.name || "",
        description: currentGroup.description || "",
        contributionAmount: currentGroup.contributionAmount || 100,
        contributionFrequency: currentGroup.contributionFrequency || "Monthly",
        maxMembers: currentGroup.maxMembers || 10,
        isPublic: currentGroup.isPublic || false,
        allowJoinRequests: currentGroup.allowJoinRequests !== false,
      });
    }
    
    setLoading(false);
  };
  
  useEffect(() => {
    loadGroupData();
  }, [groupId]);
  
  const onSubmit = (data: GroupSettingsFormValues) => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only group administrators can update settings",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // Update group in localStorage
      const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
      const updatedGroups = storedGroups.map((g: any) => {
        if (g.id === groupId) {
          return {
            ...g,
            name: data.name,
            description: data.description || "",
            contributionAmount: data.contributionAmount,
            contributionFrequency: data.contributionFrequency,
            maxMembers: data.maxMembers,
            isPublic: data.isPublic,
            allowJoinRequests: data.allowJoinRequests,
          };
        }
        return g;
      });
      
      localStorage.setItem("groups", JSON.stringify(updatedGroups));
      
      // Update local state
      setGroup((prev: any) => ({
        ...prev,
        name: data.name,
        description: data.description || "",
        contributionAmount: data.contributionAmount,
        contributionFrequency: data.contributionFrequency,
        maxMembers: data.maxMembers,
        isPublic: data.isPublic,
        allowJoinRequests: data.allowJoinRequests,
      }));
      
      toast({
        title: "Settings updated",
        description: "Group settings have been successfully updated",
      });
    } catch (error) {
      console.error("Error saving group settings:", error);
      toast({
        title: "Error",
        description: "Failed to save group settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteGroup = () => {
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "Only group administrators can delete the group",
        variant: "destructive",
      });
      return;
    }
    
    if (deleteConfirmValue !== group?.name) {
      toast({
        title: "Confirmation failed",
        description: "Please type the group name exactly to confirm deletion",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Remove group from localStorage
      const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
      const updatedGroups = storedGroups.filter((g: any) => g.id !== groupId);
      localStorage.setItem("groups", JSON.stringify(updatedGroups));
      
      toast({
        title: "Group deleted",
        description: "The group has been permanently deleted",
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete the group",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Group Settings</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadGroupData}
          className="gap-2"
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your group's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter group name" 
                        {...field} 
                        disabled={!isAdmin}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose of this group" 
                        {...field} 
                        disabled={!isAdmin}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of your savings group's purpose
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Contribution Settings</CardTitle>
              <CardDescription>
                Define how contributions work in your group
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contributionAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Amount ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        step="1" 
                        {...field} 
                        disabled={!isAdmin}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount each member contributes per cycle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contributionFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Frequency</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={!isAdmin}
                      />
                    </FormControl>
                    <FormDescription>
                      How often members contribute (e.g., Weekly, Monthly)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Membership</CardTitle>
              <CardDescription>
                Control group size and access settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="maxMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Members</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="2" 
                        step="1" 
                        {...field} 
                        disabled={!isAdmin}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of members allowed in this group
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Group</FormLabel>
                      <FormDescription>
                        Make this group visible to anyone
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isAdmin}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allowJoinRequests"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Join Requests</FormLabel>
                      <FormDescription>
                        Let people request to join this group
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isAdmin}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saving || !isAdmin} 
              className="gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      {isAdmin && (
        <>
          <Separator className="my-8" />
          
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1">Delete Group</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this group and all its data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setOpenDeleteDialog(true)} 
                  className="gap-2"
                >
                  <Trash2 size={16} />
                  Delete Group
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Group</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. It will permanently delete the group and remove all associated data.
                </DialogDescription>
              </DialogHeader>
              
              <Alert variant="destructive">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  All group data including cycles, payments, and member information will be permanently lost.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  Type <span className="font-medium">{group?.name}</span> to confirm
                </Label>
                <Input 
                  id="confirm"
                  value={deleteConfirmValue}
                  onChange={(e) => setDeleteConfirmValue(e.target.value)}
                  placeholder={group?.name}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteGroup}
                  disabled={deleteConfirmValue !== group?.name}
                >
                  I understand, delete this group
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default GroupSettings;
