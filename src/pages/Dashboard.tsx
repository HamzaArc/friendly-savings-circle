
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import GroupCard from "@/components/dashboard/GroupCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { useGroups } from "@/hooks/useGroups";
import { useRealtime } from "@/hooks/useRealtime";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: groups = [], isLoading } = useGroups();
  
  // Set up realtime updates for groups
  useRealtime([
    { table: 'groups', event: '*' },
    { table: 'group_members', event: '*', filter: user ? `user_id=eq.${user.id}` : undefined }
  ], { enabled: !!user });

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
      
      {isLoading ? (
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
