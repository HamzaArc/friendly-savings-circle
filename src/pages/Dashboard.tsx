
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGroups } from '@/hooks/useGroups';
import { useRealtime } from '@/hooks/useRealtime';
import GroupCard from '@/components/dashboard/GroupCard';
import EmptyState from '@/components/dashboard/EmptyState';
import FadeIn from '@/components/ui/FadeIn';
import { useAuth } from '@/contexts/AuthContext';
import { useGroupMembers } from '@/hooks/useGroups';

const Dashboard = () => {
  const { data: groups = [], isLoading, isError } = useGroups();
  const { user } = useAuth();
  const [membersCount, setMembersCount] = useState<{[key: string]: number}>({});

  // Set up realtime subscriptions only if user is logged in
  useRealtime([
    { table: 'groups', event: '*' },
    { table: 'group_members', event: '*', filter: user?.id ? `user_id=eq.${user.id}` : undefined }
  ], { enabled: !!user?.id });

  // Fetch members count for each group
  useEffect(() => {
    if (!groups || groups.length === 0) return;
    
    const fetchMembersCount = async () => {
      const counts: {[key: string]: number} = {};
      
      for (const group of groups) {
        try {
          const { data: members } = await useGroupMembers(group.id);
          counts[group.id] = members?.length || 0;
        } catch (error) {
          console.error(`Error fetching members for group ${group.id}:`, error);
          counts[group.id] = 0;
        }
      }
      
      setMembersCount(counts);
    };
    
    fetchMembersCount();
  }, [groups]);

  // Calculate next payment date (placeholder logic - should be replaced with actual calculation)
  const getNextPaymentDate = (group: any) => {
    // This is a placeholder - in a real app, this would be calculated based on contribution frequency
    const today = new Date();
    const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
    return nextMonth.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Groups</h1>
          <Button asChild>
            <Link to="/create-group">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Group
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error loading groups</h2>
          <p className="mt-2">There was a problem fetching your groups. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Groups</h1>
        <Button asChild>
          <Link to="/create-group">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Group
          </Link>
        </Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState 
          title="No groups yet"
          description="Create your first group to get started with managing your money pool."
          buttonText="Create Group"
          buttonLink="/create-group"
        />
      ) : (
        <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const currentCycle = group.current_cycle || 0;
              const totalCycles = group.total_cycles || 0;
              const nextPaymentDate = getNextPaymentDate(group);
              
              return (
                <GroupCard
                  key={group.id}
                  id={group.id}
                  name={group.name}
                  description={group.description || ""}
                  members={membersCount[group.id] || 0}
                  totalMembers={group.max_members || 0}
                  contributionAmount={group.contribution_amount}
                  contributionFrequency={group.contribution_frequency}
                  currentCycle={currentCycle}
                  totalCycles={totalCycles}
                  nextPaymentDate={nextPaymentDate}
                />
              );
            })}
          </div>
        </FadeIn>
      )}
    </div>
  );
};

export default Dashboard;
