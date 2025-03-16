
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
  const [openAddMember, setOpenAddMember] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });
  
  useEffect(() => {
    // Load members from localStorage
    setTimeout(() => {
      const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
      const currentGroup = storedGroups.find((g: any) => g.id === groupId);
      
      let storedMembers: Member[] = [];
      
      if (currentGroup && currentGroup.members) {
        storedMembers = currentGroup.membersList || [];
      }
      
      // Add current user as admin if the list is empty
      if (storedMembers.length === 0) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        storedMembers = [
          {
            id: "1",
            name: user.name || "You",
            email: user.email || "you@example.com",
            isAdmin: true,
            joinedAt: new Date().toISOString()
          }
        ];
        
        // Save the initial members list
        saveMembers(storedMembers);
      }
      
      setMembers(storedMembers);
      setLoading(false);
    }, 500);
  }, [groupId]);
  
  const saveMembers = (membersList: Member[]) => {
    // Save members to localStorage
    const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const updatedGroups = storedGroups.map((group: any) => {
      if (group.id === groupId) {
        return {
          ...group,
          membersList,
          members: membersList.length, // Update the count
        };
      }
      return group;
    });
    
    localStorage.setItem("groups", JSON.stringify(updatedGroups));
  };
  
  const copyInviteLink = () => {
    // In a real app, this would generate a unique invite link
    navigator.clipboard.writeText(`https://tontine-app.example/invite/${groupId}`);
    
    toast({
      title: "Invite link copied",
      description: "Share this link with others to invite them to your group.",
    });
  };
  
  const onAddMember = (data: MemberFormValues) => {
    const newMember: Member = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      isAdmin: false,
      joinedAt: new Date().toISOString(),
    };
    
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveMembers(updatedMembers);
    
    toast({
      title: "Member added",
      description: `${data.name} has been added to the group.`,
    });
    
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
            
            <div className="py-6 px-6">
              <Button variant="outline" className="w-full" onClick={() => setOpenAddMember(true)}>
                <Plus size={16} className="mr-2" />
                Add Member
              </Button>
            </div>
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
