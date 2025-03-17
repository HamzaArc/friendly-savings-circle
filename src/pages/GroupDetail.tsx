
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, DollarSign, Calendar, AlertCircle, Shield } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import MembersList from "@/components/groups/MembersList";
import PaymentHistory from "@/components/groups/PaymentHistory";
import CycleManagement from "@/components/groups/CycleManagement";

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
  maxMembers: number;
  cycles?: any[];
  membersList?: any[];
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isActiveRecipient, setIsActiveRecipient] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is logged in, redirect to onboarding if not
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "/onboarding";
      return;
    }
    
    const userData = JSON.parse(user);
    setCurrentUserId(userData.id || "1");
    
    // Load group data
    const loadGroup = () => {
      try {
        const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
        const foundGroup = storedGroups.find((g: Group) => g.id === id);
        
        if (foundGroup) {
          setGroup(foundGroup);
          
          // Check if user is admin
          if (foundGroup.membersList) {
            const isMemberAdmin = foundGroup.membersList.some(
              (m: any) => m.id === userData.id && m.isAdmin
            );
            setIsAdmin(isMemberAdmin);
          }
          
          // Check if user is active recipient
          if (foundGroup.cycles) {
            const activeCycle = foundGroup.cycles.find((c: any) => c.status === "active");
            if (activeCycle && activeCycle.recipientId === userData.id) {
              setIsActiveRecipient(true);
            }
          }
        } else {
          toast({
            title: "Group not found",
            description: "The savings group you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error loading group:", error);
        toast({
          title: "Error loading group",
          description: "There was an error loading the group data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Simulate loading delay
    setTimeout(loadGroup, 800);
  }, [id, navigate, toast]);
  
  const handleMakePayment = () => {
    // Find active cycle
    if (group?.cycles) {
      const activeCycle = group.cycles.find(c => c.status === "active");
      if (activeCycle) {
        // Check if user has already paid
        const userPayment = activeCycle.payments.find(p => p.memberId === currentUserId);
        if (userPayment && userPayment.status === "paid") {
          toast({
            title: "Already paid",
            description: "You have already made your contribution for this cycle.",
          });
          return;
        }
        
        // Update the user's payment
        const updatedGroups = JSON.parse(localStorage.getItem("groups") || "[]").map((g: Group) => {
          if (g.id === id) {
            const updatedCycles = g.cycles?.map(c => {
              if (c.id === activeCycle.id) {
                const updatedPayments = c.payments.map(p => {
                  if (p.memberId === currentUserId) {
                    return { ...p, status: "paid", date: new Date().toISOString() };
                  }
                  return p;
                });
                return { ...c, payments: updatedPayments };
              }
              return c;
            });
            return { ...g, cycles: updatedCycles };
          }
          return g;
        });
        
        localStorage.setItem("groups", JSON.stringify(updatedGroups));
        
        // Reload group data
        setGroup(updatedGroups.find((g: Group) => g.id === id) || null);
        
        toast({
          title: "Payment submitted",
          description: "Your contribution has been recorded.",
        });
      } else {
        toast({
          title: "No active cycle",
          description: "There is no active cycle to contribute to.",
        });
      }
    }
  };
  
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
  const hasActivePayment = group.cycles?.some(c => 
    c.status === "active" && c.payments.some(p => 
      p.memberId === currentUserId && p.status === "pending"
    )
  );
  
  return (
    <AppShell>
      <FadeIn>
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 -ml-3 text-muted-foreground"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          
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
                  {group.members} of {group.maxMembers}
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
        
        <Tabs defaultValue="cycles" className="mb-8">
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
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6">
                  Group settings will be available in a future update.
                </p>
              </CardContent>
            </Card>
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
