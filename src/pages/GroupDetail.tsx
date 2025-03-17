
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, DollarSign, Calendar, AlertCircle, Shield, RefreshCw } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import GroupNavigation from "@/components/layout/GroupNavigation";
import MembersList from "@/components/groups/MembersList";
import PaymentHistory from "@/components/groups/PaymentHistory";
import CycleManagement from "@/components/groups/CycleManagement";
import GroupSettings from "@/components/groups/GroupSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useGroup } from "@/hooks/useGroups";
import { useActiveCycle } from "@/hooks/useCycles";
import { useRealtime } from "@/hooks/useRealtime";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isActiveRecipient, setIsActiveRecipient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Use tab from URL or default to "cycles"
  const currentTab = searchParams.get("tab") || "cycles";
  
  // Function to change tab
  const handleTabChange = (value: string) => {
    searchParams.set("tab", value);
    setSearchParams(searchParams);
  };

  // Fetch group data using React Query
  const { data: group, isLoading: isGroupLoading, refetch: refetchGroup } = useGroup(id || '');
  const { data: activeCycle, isLoading: isCycleLoading, refetch: refetchActiveCycle } = useActiveCycle(id || '');

  // Set up realtime updates for this group
  useRealtime([
    { table: 'groups', event: 'UPDATE', filter: `id=eq.${id}` },
    { table: 'group_members', event: '*', filter: `group_id=eq.${id}` },
    { table: 'cycles', event: '*', filter: `group_id=eq.${id}` },
    { table: 'payments', event: '*' }
  ]);
  
  // Load group data function that can be reused for refreshing
  const loadGroupData = async () => {
    setRefreshing(true);
    
    // Refetch data
    await Promise.all([
      refetchGroup(),
      refetchActiveCycle()
    ]);
    
    setRefreshing(false);
  };
  
  // Check admin status and active recipient status
  useEffect(() => {
    if (group && activeCycle && user) {
      // Check if user is admin
      const isMemberAdmin = group.group_members?.some(
        (m: any) => m.user_id === user.id && m.is_admin
      );
      setIsAdmin(isMemberAdmin);
      
      // Check if user is active recipient
      if (activeCycle && activeCycle.recipient_id === user.id) {
        setIsActiveRecipient(true);
      } else {
        setIsActiveRecipient(false);
      }
    }

    if (!isGroupLoading && !isCycleLoading) {
      setLoading(false);
    }
  }, [group, activeCycle, user, isGroupLoading, isCycleLoading]);
  
  const handleMakePayment = async () => {
    if (!user || !activeCycle) return;

    // Implementation will use useCreatePayment hook from services/payments
    // This is a placeholder for the refactored implementation
    toast({
      title: "Payment submitted",
      description: "Your contribution has been recorded.",
    });
    
    // Refresh data after payment
    await loadGroupData();
  };
  
  if (loading || isGroupLoading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/3 bg-muted/30 rounded"></div>
          <div className="h-80 bg-muted/30 rounded-xl"></div>
        </div>
      </AppShell>
    );
  }
  
  if (!group) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Group Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The savings group you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }
  
  const progressPercentage = (group.current_cycle / group.total_cycles) * 100;
  const hasActivePayment = activeCycle?.payments?.some(p => 
    p.payer_id === user?.id && p.status === "pending"
  );
  
  return (
    <AppShell>
      <FadeIn>
        <GroupNavigation currentGroupId={id} />
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              className="mb-4 -ml-3 text-muted-foreground"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadGroupData}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <h1 className="text-3xl font-semibold tracking-tight">{group.name}</h1>
            <div className="flex gap-2">
              {isAdmin && (
                <Badge variant="outline" className="font-normal">
                  <Shield size={14} className="mr-1 text-primary" />
                  Admin
                </Badge>
              )}
              {isActiveRecipient && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 font-normal">
                  Active Recipient
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            {group.description || "Rotating savings group"}
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <FadeIn delay={100}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cycle Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {group.current_cycle} of {group.total_cycles}
                </div>
                <Progress value={progressPercentage} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {progressPercentage.toFixed(0)}% complete
                </p>
              </CardContent>
            </Card>
          </FadeIn>
          
          <FadeIn delay={200}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Contribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  ${group.contribution_amount}
                </div>
                <Badge variant="outline" className="font-normal">
                  {group.contribution_frequency}
                </Badge>
              </CardContent>
            </Card>
          </FadeIn>
          
          <FadeIn delay={300}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">
                  {group.members_count} of {group.max_members}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(group.members_count || 1, 3))].map((_, i) => (
                      <div 
                        key={i}
                        className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-background"
                      >
                        <Users size={14} className="text-primary" />
                      </div>
                    ))}
                  </div>
                  
                  {group.members_count > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{group.members_count - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
        
        <Tabs value={currentTab} onValueChange={handleTabChange} className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="cycles">Cycles</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cycles">
            <CycleManagement groupId={group.id} />
          </TabsContent>
          
          <TabsContent value="members">
            <MembersList groupId={group.id} />
          </TabsContent>
          
          <TabsContent value="payments">
            <PaymentHistory groupId={group.id} />
          </TabsContent>
          
          <TabsContent value="settings">
            <GroupSettings groupId={group.id} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center">
          <Button 
            size="lg" 
            className="px-8 gap-2"
            onClick={handleMakePayment}
            disabled={!hasActivePayment}
          >
            <DollarSign size={18} />
            Make Payment
          </Button>
        </div>
      </FadeIn>
    </AppShell>
  );
};

export default GroupDetail;
