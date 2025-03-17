
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import GroupCard from "@/components/dashboard/GroupCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  totalMembers: number;
  currentCycle: number;
  totalCycles: number;
  contributionAmount: number;
  contributionFrequency: string;
  nextPaymentDate: string;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchGroups = async () => {
      setLoading(true);
      
      try {
        console.log("Fetching groups for user:", user.id);
        
        // First fetch group memberships
        const { data: memberships, error: membershipError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);
          
        if (membershipError) {
          console.error("Membership fetch error:", membershipError);
          throw membershipError;
        }
        
        console.log("Memberships found:", memberships);
        
        if (memberships && memberships.length > 0) {
          const groupIds = memberships.map(m => m.group_id);
          
          // Fetch the group data
          const { data: groupsData, error: groupsError } = await supabase
            .from('groups')
            .select(`
              id, 
              name, 
              description, 
              contribution_amount, 
              contribution_frequency, 
              max_members, 
              current_cycle, 
              total_cycles, 
              next_payment_date
            `)
            .in('id', groupIds);
            
          if (groupsError) {
            console.error("Groups fetch error:", groupsError);
            throw groupsError;
          }
          
          console.log("Groups data:", groupsData);
          
          // For each group, get the member count
          const groupsWithMembers = await Promise.all(
            groupsData.map(async (group) => {
              const { count, error: countError } = await supabase
                .from('group_members')
                .select('id', { count: 'exact', head: true })
                .eq('group_id', group.id);
                
              if (countError) {
                console.error("Member count error:", countError);
                throw countError;
              }
              
              return {
                id: group.id,
                name: group.name,
                description: group.description || '',
                contributionAmount: Number(group.contribution_amount),
                contributionFrequency: group.contribution_frequency,
                members: count || 0,
                totalMembers: group.max_members,
                currentCycle: group.current_cycle || 0,
                totalCycles: group.total_cycles || group.max_members,
                nextPaymentDate: group.next_payment_date || new Date().toISOString()
              };
            })
          );
          
          setGroups(groupsWithMembers);
        } else {
          console.log("No memberships found");
          setGroups([]);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast({
          title: "Error fetching groups",
          description: "There was an error loading your groups. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, [user, toast]);

  return (
    <AppShell>
      <FadeIn className="mb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">Your Savings Groups</h1>
            <p className="text-muted-foreground">
              Manage and track all your rotating savings groups
            </p>
          </div>
          
          <Button asChild>
            <Link to="/create-group">
              <Plus size={18} className="mr-1.5" />
              New Group
            </Link>
          </Button>
        </div>
      </FadeIn>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[270px] bg-muted/30 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : groups.length > 0 ? (
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <GroupCard key={group.id} {...group} />
            ))}
          </div>
        </FadeIn>
      ) : (
        <EmptyState />
      )}
    </AppShell>
  );
};

export default Dashboard;
