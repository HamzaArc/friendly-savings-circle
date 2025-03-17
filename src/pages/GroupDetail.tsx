
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

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
  createdAt: string;
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isActiveRecipient, setIsActiveRecipient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  
  // Use tab from URL or default to "cycles"
  const currentTab = searchParams.get("tab") || "cycles";
  
  // Function to change tab
  const handleTabChange = (value: string) => {
    searchParams.set("tab", value);
    setSearchParams(searchParams);
  };
  
  // Load group data function that can be reused for refreshing
  const loadGroupData = async () => {
    if (!id || !user) return;
    
    setLoading(true);
    setRefreshing(true);
    
    try {
      console.log("Loading group data for:", id);
      
      // Check if user is member of this group
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('is_admin')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (membershipError && membershipError.code !== 'PGRST116') {
        console.error("Membership check error:", membershipError);
        throw membershipError;
      }
      
      if (!membership) {
        toast({
          title: "Access denied",
          description: "You are not a member of this group.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }
      
      setIsAdmin(membership.is_admin || false);
      
      // Fetch group details
      const { data: groupData, error: groupError } = await supabase
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
          next_payment_date,
          created_at
        `)
        .eq('id', id)
        .single();
        
      if (groupError) {
        console.error("Group fetch error:", groupError);
        throw groupError;
      }
      
      // Get member count
      const { count: memberCount, error: countError } = await supabase
        .from('group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', id);
        
      if (countError) {
        console.error("Member count error:", countError);
        throw countError;
      }
      
      // Check if user is current active recipient
      const { data: activeCycle, error: cycleError } = await supabase
        .from('cycles')
        .select('recipient_id')
        .eq('group_id', id)
        .eq('status', 'active')
        .maybeSingle();
        
      if (cycleError && cycleError.code !== 'PGRST116') {
        console.error("Cycle check error:", cycleError);
        throw cycleError;
      }
      
      setIsActiveRecipient(activeCycle?.recipient_id === user.id);
      
      // Format and set group data
      const formattedGroup: Group = {
        id: groupData.id,
        name: groupData.name,
        description: groupData.description || '',
        members: memberCount || 0,
        totalMembers: groupData.max_members,
        currentCycle: groupData.current_cycle || 0,
        totalCycles: groupData.total_cycles || groupData.max_members,
        contributionAmount: Number(groupData.contribution_amount),
        contributionFrequency: groupData.contribution_frequency,
        nextPaymentDate: groupData.next_payment_date || new Date().toISOString(),
        createdAt: groupData.created_at
      };
      
      setGroup(formattedGroup);
    } catch (error) {
      console.error("Error loading group:", error);
      toast({
        title: "Error loading group",
        description: "There was an error loading the group data.",
        variant: "destructive",
      });
      
      // Check if the error was a "not found" error
      if (error instanceof Error && error.message.includes("not found")) {
        navigate("/dashboard");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    if (user) {
      loadGroupData();
    }
  }, [id, user]);
  
  const handleMakePayment = async () => {
    if (!id || !user || !group) return;
    
    try {
      // Get active cycle
      const { data: activeCycle, error: cycleError } = await supabase
        .from('cycles')
        .select('id, number')
        .eq('group_id', id)
        .eq('status', 'active')
        .single();
        
      if (cycleError) {
        console.error("Cycle fetch error:", cycleError);
        throw cycleError;
      }
      
      // Check if user has already paid for this cycle
      const { data: existingPayment, error: paymentCheckError } = await supabase
        .from('payments')
        .select('id, status')
        .eq('group_id', id)
        .eq('cycle_id', activeCycle.id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (paymentCheckError && paymentCheckError.code !== 'PGRST116') {
        console.error("Payment check error:", paymentCheckError);
        throw paymentCheckError;
      }
      
      if (existingPayment && existingPayment.status === 'paid') {
        toast({
          title: "Already paid",
          description: "You have already made your contribution for this cycle.",
        });
        return;
      }
      
      // Create or update payment
      if (existingPayment) {
        // Update existing payment
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString()
          })
          .eq('id', existingPayment.id);
          
        if (updateError) {
          console.error("Payment update error:", updateError);
          throw updateError;
        }
      } else {
        // Create new payment
        const { error: createError } = await supabase
          .from('payments')
          .insert({
            group_id: id,
            cycle_id: activeCycle.id,
            user_id: user.id,
            amount: group.contributionAmount,
            status: 'paid',
            payment_date: new Date().toISOString()
          });
          
        if (createError) {
          console.error("Payment creation error:", createError);
          throw createError;
        }
      }
      
      // Create notification for recipient
      const { data: recipientInfo, error: recipientError } = await supabase
        .from('cycles')
        .select('recipient_id')
        .eq('id', activeCycle.id)
        .single();
        
      if (recipientError) {
        console.error("Recipient fetch error:", recipientError);
        throw recipientError;
      }
      
      if (recipientInfo.recipient_id) {
        // Get the user's name
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
          
        const userName = userProfile?.name || 'A member';
        
        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: recipientInfo.recipient_id,
            group_id: id,
            cycle_id: activeCycle.id,
            type: 'payment_received',
            message: `${userName} has contributed to cycle ${activeCycle.number}`
          });
      }
      
      toast({
        title: "Payment submitted",
        description: "Your contribution has been recorded.",
      });
      
      // Refresh to show updated state
      loadGroupData();
    } catch (error) {
      console.error("Error making payment:", error);
      toast({
        title: "Error making payment",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Check if user has a pending payment for the active cycle
  const [hasActivePayment, setHasActivePayment] = useState(false);
  
  useEffect(() => {
    if (!id || !user) return;
    
    const checkActiveCycle = async () => {
      try {
        // Get active cycle
        const { data: activeCycle, error: cycleError } = await supabase
          .from('cycles')
          .select('id')
          .eq('group_id', id)
          .eq('status', 'active')
          .maybeSingle();
          
        if (cycleError && cycleError.code !== 'PGRST116') {
          console.error("Active cycle check error:", cycleError);
          throw cycleError;
        }
        
        if (!activeCycle) {
          setHasActivePayment(false);
          return;
        }
        
        // Check for pending payment
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('status')
          .eq('group_id', id)
          .eq('cycle_id', activeCycle.id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (paymentError && paymentError.code !== 'PGRST116') {
          console.error("Payment check error:", paymentError);
          throw paymentError;
        }
        
        // Either no payment yet or payment is pending
        setHasActivePayment(!payment || payment.status === 'pending');
      } catch (error) {
        console.error("Error checking for active cycle:", error);
      }
    };
    
    checkActiveCycle();
  }, [id, user, refreshing]);
  
  if (loading) {
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
  
  const progressPercentage = (group.currentCycle / group.totalCycles) * 100;
  
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
                  {group.currentCycle} of {group.totalCycles}
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
                  ${group.contributionAmount}
                </div>
                <Badge variant="outline" className="font-normal">
                  {group.contributionFrequency}
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
                  {group.members} of {group.totalMembers}
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(group.members, 3))].map((_, i) => (
                      <div 
                        key={i}
                        className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-background"
                      >
                        <Users size={14} className="text-primary" />
                      </div>
                    ))}
                  </div>
                  
                  {group.members > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{group.members - 3} more
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
