
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FadeIn from "@/components/ui/FadeIn";

interface Member {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  joinedAt: string;
}

interface MembersListProps {
  groupId: string;
}

const MembersList = ({ groupId }: MembersListProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // In a real app, this would fetch members from an API
    // For now, we'll create some mock data
    setTimeout(() => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const mockMembers: Member[] = [
        {
          id: "1",
          name: user.name || "You",
          email: user.email || "you@example.com",
          isAdmin: true,
          joinedAt: new Date().toISOString()
        }
      ];
      
      setMembers(mockMembers);
      setLoading(false);
    }, 500);
  }, [groupId]);
  
  const copyInviteLink = () => {
    // In a real app, this would generate a unique invite link
    navigator.clipboard.writeText(`https://tontine-app.example/invite/${groupId}`);
    
    toast({
      title: "Invite link copied",
      description: "Share this link with others to invite them to your group.",
    });
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
                  </div>
                </div>
              </div>
            ))}
            
            <div className="py-6 px-6">
              <Button variant="outline" className="w-full" onClick={copyInviteLink}>
                <Plus size={16} className="mr-2" />
                Invite Member
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-sm text-muted-foreground text-center">
        Group members will be able to contribute funds and receive payouts based on the cycle schedule.
      </div>
    </FadeIn>
  );
};

export default MembersList;
