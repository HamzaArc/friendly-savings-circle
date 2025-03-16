
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import GroupCard from "@/components/dashboard/GroupCard";
import EmptyState from "@/components/dashboard/EmptyState";

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
  
  // Check if user is logged in, redirect to onboarding if not
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "/onboarding";
      return;
    }
    
    // Load groups
    const storedGroups = localStorage.getItem("groups");
    if (storedGroups) {
      setGroups(JSON.parse(storedGroups));
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

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
