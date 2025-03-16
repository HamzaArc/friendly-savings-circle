
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, DollarSign, Calendar, AlertCircle } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import MembersList from "@/components/groups/MembersList";
import PaymentHistory from "@/components/groups/PaymentHistory";

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
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in, redirect to onboarding if not
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "/onboarding";
      return;
    }
    
    // Load group data
    const loadGroup = () => {
      try {
        const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
        const foundGroup = storedGroups.find((g: Group) => g.id === id);
        
        if (foundGroup) {
          setGroup(foundGroup);
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
    toast({
      title: "Payment submitted",
      description: "Your contribution has been recorded.",
    });
    
    // In a real app, this would update the database
    // For now, we'll just show a success message
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
          
          <h1 className="text-3xl font-semibold tracking-tight mb-1">{group.name}</h1>
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
        
        <Tabs defaultValue="members" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
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
