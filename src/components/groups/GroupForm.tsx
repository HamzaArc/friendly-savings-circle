
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import FadeIn from "../ui/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const GroupForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contributionAmount: "",
    contributionFrequency: "monthly",
    maxMembers: "12",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a group.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // Validate form
    if (!formData.name.trim()) {
      toast({
        title: "Group name is required",
        description: "Please enter a name for your savings group.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.contributionAmount.trim() || isNaN(Number(formData.contributionAmount))) {
      toast({
        title: "Valid contribution amount required",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create new group in Supabase
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: formData.name,
          description: formData.description,
          contribution_amount: Number(formData.contributionAmount),
          contribution_frequency: formData.contributionFrequency,
          max_members: Number(formData.maxMembers),
          total_cycles: Number(formData.maxMembers),
          created_by: user.id
        })
        .select()
        .single();
      
      if (groupError) throw groupError;
      
      // Add the creator as a member and admin
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          is_admin: true
        });
      
      if (memberError) throw memberError;
      
      toast({
        title: "Group created!",
        description: `Your savings group "${formData.name}" has been created.`,
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating group:", error);
      toast({
        title: "Error creating group",
        description: "There was an error creating your group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <FadeIn delay={100} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter a name for your group"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the purpose of your savings group"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </FadeIn>
          
          <FadeIn delay={200} className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contributionAmount">Contribution Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="contributionAmount"
                  name="contributionAmount"
                  type="number"
                  placeholder="100"
                  className="pl-8"
                  value={formData.contributionAmount}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contributionFrequency">Contribution Frequency</Label>
              <Select
                value={formData.contributionFrequency}
                onValueChange={value => handleSelectChange("contributionFrequency", value)}
              >
                <SelectTrigger id="contributionFrequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxMembers">Number of Members</Label>
              <Select
                value={formData.maxMembers}
                onValueChange={value => handleSelectChange("maxMembers", value)}
              >
                <SelectTrigger id="maxMembers">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 8, 10, 12].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} members
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FadeIn>
          
          <FadeIn delay={300}>
            <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
              {loading ? "Creating Group..." : "Create Savings Group"}
            </Button>
          </FadeIn>
        </div>
        
        <div className="md:col-span-1">
          <FadeIn delay={400}>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">About Savings Groups</h3>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    A Tontine savings group pools money from members at regular intervals, with each member taking turns to receive the full pool.
                  </p>
                  <p>
                    This helps members save for larger expenses and creates accountability through the group structure.
                  </p>
                  <p>
                    As the group creator, you'll be the first member and admin with the ability to invite others and manage the group settings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    </form>
  );
};

export default GroupForm;
