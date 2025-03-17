
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Copy, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FadeIn from "@/components/ui/FadeIn";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  joinedAt: string;
}

interface MembersListProps {
  groupId: string;
}

const memberSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

const MembersList = ({ groupId }: MembersListProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openAddMember, setOpenAddMember] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });
  
  useEffect(() => {
    if (!user) return;
    
    const fetchMembers = async () => {
      setLoading(true);
      
      try {
        // Check if current user is admin
        const { data: adminCheck, error: adminError } = await supabase
          .from('group_members')
          .select('is_admin')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single();
          
        if (adminError && adminError.code !== 'PGRST116') {
          console.error("Admin check error:", adminError);
          throw adminError;
        }
        
        setIsAdmin(adminCheck?.is_admin || false);
        console.log("Is admin:", adminCheck?.is_admin);
        
        // Fetch members of this group
        const { data: memberships, error: membershipError } = await supabase
          .from('group_members')
          .select(`
            id,
            user_id,
            is_admin,
            joined_at
          `)
          .eq('group_id', groupId);
          
        if (membershipError) {
          console.error("Membership fetch error:", membershipError);
          throw membershipError;
        }
        
        console.log("Memberships found:", memberships);
        
        // Process the memberships data and fetch profile info separately
        if (memberships && memberships.length > 0) {
          // Get all user IDs
          const userIds = memberships.map(membership => membership.user_id);
          
          // Fetch profiles for these users
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, email')
            .in('id', userIds);
            
          if (profilesError) {
            console.error("Profiles fetch error:", profilesError);
            throw profilesError;
          }
          
          console.log("Profiles found:", profiles);
          
          // Create a map of user IDs to profiles for easier lookup
          const profileMap = new Map();
          if (profiles) {
            profiles.forEach(profile => {
              profileMap.set(profile.id, profile);
            });
          }
          
          // Format members with profile data
          const formattedMembers = memberships.map(membership => {
            const profile = profileMap.get(membership.user_id);
            
            return {
              id: membership.id,
              name: profile?.name || 'Unknown User',
              email: profile?.email || '',
              isAdmin: membership.is_admin,
              joinedAt: membership.joined_at
            };
          });
          
          setMembers(formattedMembers);
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error loading members",
          description: "There was an error loading the group members.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, [groupId, user, toast]);
  
  const copyInviteLink = () => {
    // In a real app, this would generate a unique invite link
    navigator.clipboard.writeText(`${window.location.origin}/invite/${groupId}`);
    
    toast({
      title: "Invite link copied",
      description: "Share this link with others to invite them to your group.",
    });
  };
  
  const onAddMember = async (data: MemberFormValues) => {
    if (!user) return;
    
    try {
      // First check if a user with this email exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();
        
      if (userError && userError.code !== 'PGRST116') {
        console.error("User check error:", userError);
        throw userError;
      }
      
      let userId = existingUser?.id;
      
      if (!userId) {
        // In a real app, you would send an invite email
        // For now, we'll create a placeholder user profile
        toast({
          title: "User not found",
          description: "This email is not registered in the system. An invitation will be sent.",
        });
        
        // Create a placeholder profile
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(), // Generate a UUID for the user
            name: data.name,
            email: data.email
          })
          .select()
          .single();
          
        if (profileError) {
          console.error("Profile creation error:", profileError);
          throw profileError;
        }
        
        userId = newProfile.id;
      }
      
      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        console.error("Member check error:", memberCheckError);
        throw memberCheckError;
      }
      
      if (existingMember) {
        toast({
          title: "Member already exists",
          description: "This user is already a member of this group.",
          variant: "destructive",
        });
        setOpenAddMember(false);
        form.reset();
        return;
      }
      
      // Add member to group
      const { data: newMember, error: addError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          is_admin: false
        })
        .select()
        .single();
        
      if (addError) {
        console.error("Member addition error:", addError);
        throw addError;
      }
      
      // Add new member to the list
      const newMemberData: Member = {
        id: newMember.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        isAdmin: false,
        joinedAt: new Date().toISOString()
      };
      
      setMembers(prev => [...prev, newMemberData]);
      
      toast({
        title: "Member added",
        description: `${data.name} has been added to the group.`,
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error adding member",
        description: "There was an error adding the member to the group.",
        variant: "destructive",
      });
    }
    
    setOpenAddMember(false);
    form.reset();
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
    <FadeIn>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-medium">Members ({members.length})</h3>
        <Button onClick={copyInviteLink} variant="outline" size="sm">
          <Copy size={14} className="mr-2" />
          Copy Invite Link
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-0">
          <div className="divide-y">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.name}
                      {member.isAdmin && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail size={12} />
                      {member.email}
                    </div>
                    {member.phone && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone size={12} />
                        {member.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isAdmin && (
              <div className="py-6 px-6">
                <Button variant="outline" className="w-full" onClick={() => setOpenAddMember(true)}>
                  <Plus size={16} className="mr-2" />
                  Add Member
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground text-center">
        Group members will be able to contribute funds and receive payouts based on the cycle schedule.
      </div>
      
      {/* Add Member Dialog */}
      <Dialog open={openAddMember} onOpenChange={setOpenAddMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddMember)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpenAddMember(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Member</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
};

export default MembersList;
