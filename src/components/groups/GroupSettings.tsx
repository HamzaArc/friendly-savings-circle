
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import FadeIn from "@/components/ui/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface GroupSettingsProps {
  groupId: string;
}

const GroupSettings = ({ groupId }: GroupSettingsProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contributionAmount: "",
    contributionFrequency: "",
  });
  
  useEffect(() => {
    if (!user) return;
    
    const fetchGroupSettings = async () => {
      setLoading(true);
      
      try {
        // Check if user is an admin
        const { data: adminCheck, error: adminError } = await supabase
          .from('group_members')
          .select('is_admin')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single();
          
        if (adminError) {
          console.error("Admin check error:", adminError);
          throw adminError;
        }
        
        setIsAdmin(adminCheck.is_admin);
        
        // Fetch group details
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select(`
            name,
            description,
            contribution_amount,
            contribution_frequency
          `)
          .eq('id', groupId)
          .single();
          
        if (groupError) {
          console.error("Group fetch error:", groupError);
          throw groupError;
        }
        
        setFormData({
          name: groupData.name,
          description: groupData.description || "",
          contributionAmount: groupData.contribution_amount.toString(),
          contributionFrequency: groupData.contribution_frequency,
        });
      } catch (error) {
        console.error("Error loading group settings:", error);
        toast({
          title: "Error loading settings",
          description: "There was an error loading the group settings.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroupSettings();
  }, [groupId, user, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSaveSettings = async () => {
    if (!user || !isAdmin) return;
    
    setSaving(true);
    
    try {
      // Validate form
      if (!formData.name.trim()) {
        toast({
          title: "Group name is required",
          description: "Please enter a name for the group.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      
      if (!formData.contributionAmount.trim() || isNaN(Number(formData.contributionAmount))) {
        toast({
          title: "Valid contribution amount required",
          description: "Please enter a valid contribution amount.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }
      
      // Update group
      const { error: updateError } = await supabase
        .from('groups')
        .update({
          name: formData.name,
          description: formData.description,
          contribution_amount: Number(formData.contributionAmount),
          contribution_frequency: formData.contributionFrequency
        })
        .eq('id', groupId);
        
      if (updateError) {
        console.error("Group update error:", updateError);
        throw updateError;
      }
      
      toast({
        title: "Settings saved",
        description: "Group settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error saving settings",
        description: "There was an error saving the group settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleLeaveGroup = async () => {
    if (!user) return;
    
    try {
      // Check if user is the only admin
      if (isAdmin) {
        const { count, error: adminCountError } = await supabase
          .from('group_members')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', groupId)
          .eq('is_admin', true);
          
        if (adminCountError) {
          console.error("Admin count error:", adminCountError);
          throw adminCountError;
        }
        
        if (count === 1) {
          toast({
            title: "Cannot leave group",
            description: "You are the only admin. Please assign another admin before leaving.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Remove user from group
      const { error: leaveError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);
        
      if (leaveError) {
        console.error("Leave group error:", leaveError);
        throw leaveError;
      }
      
      toast({
        title: "Left group",
        description: "You have successfully left the group.",
      });
      
      // Navigate back to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error leaving group:", error);
      toast({
        title: "Error leaving group",
        description: "There was an error leaving the group.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteGroup = async () => {
    if (!user || !isAdmin) return;
    
    try {
      // Delete all related data with cascading deletion
      // First delete payments
      const { error: paymentsError } = await supabase
        .from('payments')
        .delete()
        .eq('group_id', groupId);
        
      if (paymentsError) {
        console.error("Payments deletion error:", paymentsError);
        throw paymentsError;
      }
      
      // Delete notifications
      const { error: notificationsError } = await supabase
        .from('notifications')
        .delete()
        .eq('group_id', groupId);
        
      if (notificationsError) {
        console.error("Notifications deletion error:", notificationsError);
        throw notificationsError;
      }
      
      // Delete cycles
      const { error: cyclesError } = await supabase
        .from('cycles')
        .delete()
        .eq('group_id', groupId);
        
      if (cyclesError) {
        console.error("Cycles deletion error:", cyclesError);
        throw cyclesError;
      }
      
      // Delete members
      const { error: membersError } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId);
        
      if (membersError) {
        console.error("Members deletion error:", membersError);
        throw membersError;
      }
      
      // Finally, delete the group
      const { error: groupError } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);
        
      if (groupError) {
        console.error("Group deletion error:", groupError);
        throw groupError;
      }
      
      toast({
        title: "Group deleted",
        description: "The group has been permanently deleted.",
      });
      
      // Close dialog and navigate back to dashboard
      setShowDeleteDialog(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Error deleting group",
        description: "There was an error deleting the group.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 bg-muted/30 rounded animate-pulse"></div>
        <div className="h-72 bg-muted/30 rounded-xl animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <FadeIn>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Group Settings</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "As an admin, you can update the group information and settings."
                : "Group information and settings are managed by the group admin."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isAdmin}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isAdmin}
                rows={4}
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contributionAmount">Contribution Amount ($)</Label>
                <Input
                  id="contributionAmount"
                  name="contributionAmount"
                  type="number"
                  value={formData.contributionAmount}
                  onChange={handleInputChange}
                  disabled={!isAdmin}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contributionFrequency">Contribution Frequency</Label>
                <Input
                  id="contributionFrequency"
                  name="contributionFrequency"
                  value={formData.contributionFrequency}
                  onChange={handleInputChange}
                  disabled={!isAdmin}
                />
              </div>
            </div>
            
            {isAdmin && (
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Be careful with these actions. They cannot be undone."
                : "You can leave the group at any time."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAdmin && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Deleting the group will permanently remove all group data, including payment history and cycles.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button variant="outline" onClick={handleLeaveGroup}>
                Leave Group
              </Button>
              
              {isAdmin && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Group
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Group?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the group, payment history, and all related data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <p className="font-medium">
              Type "DELETE" to confirm:
            </p>
            <Input className="mt-2" placeholder="Type DELETE" />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGroup}>
              I understand, delete this group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
};

export default GroupSettings;
