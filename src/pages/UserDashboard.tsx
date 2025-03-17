
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Bell, 
  ArrowRight,
  CreditCard,
  ArrowUpRight,
  Clock,
  Check,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";

interface Notification {
  id: string;
  groupId: string;
  cycleId: string;
  memberId: string;
  message: string;
  type: "payment_reminder" | "cycle_completed" | "cycle_started";
  isRead: boolean;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  members: number;
  currentCycle: number;
  totalCycles: number;
  contributionAmount: number;
  contributionFrequency: string;
  nextPaymentDate: string;
  cycles: any[];
  membersList: any[];
}

interface PaymentDue {
  groupId: string;
  groupName: string;
  cycleId: string;
  cycleNumber: number;
  amount: number;
  dueDate: string;
}

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<PaymentDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroups, setActiveGroups] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [totalContributed, setTotalContributed] = useState(0);
  const [currentRecipient, setCurrentRecipient] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if user is logged in, redirect to onboarding if not
    const userData = localStorage.getItem("user");
    if (!userData) {
      window.location.href = "/onboarding";
      return;
    }
    
    const user = JSON.parse(userData);
    setUser(user);
    
    // Load data
    loadUserData(user.id || "1");
  }, []);
  
  const loadUserData = (userId: string) => {
    setTimeout(() => {
      // Load groups
      const storedGroups: Group[] = JSON.parse(localStorage.getItem("groups") || "[]");
      
      // Calculate stats
      let totalPaid = 0;
      let cyclesCompleted = 0;
      let isCurrentlyRecipient = false;
      
      storedGroups.forEach(group => {
        if (group.cycles) {
          // Count completed cycles
          const completed = group.cycles.filter((cycle: any) => cycle.status === "completed");
          cyclesCompleted += completed.length;
          
          // Calculate total paid
          group.cycles.forEach((cycle: any) => {
            const userPayment = cycle.payments?.find((p: any) => p.memberId === userId && p.status === "paid");
            if (userPayment) {
              totalPaid += group.contributionAmount;
            }
            
            // Check if user is current recipient
            if (cycle.status === "active" && cycle.recipientId === userId) {
              isCurrentlyRecipient = true;
            }
          });
        }
      });
      
      // Get upcoming payments
      const dues: PaymentDue[] = [];
      storedGroups.forEach(group => {
        if (group.cycles) {
          const activeCycle = group.cycles.find((cycle: any) => cycle.status === "active");
          if (activeCycle) {
            const userPayment = activeCycle.payments?.find((p: any) => p.memberId === userId && p.status === "pending");
            if (userPayment) {
              dues.push({
                groupId: group.id,
                groupName: group.name,
                cycleId: activeCycle.id,
                cycleNumber: activeCycle.number,
                amount: group.contributionAmount,
                dueDate: activeCycle.endDate
              });
            }
          }
        }
      });
      
      // Get recent notifications
      const allNotifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]");
      const userNotifications = allNotifications
        .filter(n => n.memberId === "all" || n.memberId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      setGroups(storedGroups);
      setActiveGroups(storedGroups.length);
      setCompletedCycles(cyclesCompleted);
      setTotalContributed(totalPaid);
      setUpcomingPayments(dues);
      setNotifications(userNotifications);
      setCurrentRecipient(isCurrentlyRecipient);
      setLoading(false);
    }, 800);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  if (loading) {
    return (
      <AppShell>
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-1/3 bg-muted/30 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-muted/30 rounded-xl"></div>
            <div className="h-32 bg-muted/30 rounded-xl"></div>
            <div className="h-32 bg-muted/30 rounded-xl"></div>
          </div>
          <div className="h-80 bg-muted/30 rounded-xl"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <FadeIn>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-1">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your savings activity and upcoming payments
            </p>
          </div>
          
          {currentRecipient && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <Check size={14} className="mr-1" /> You are an active recipient
            </Badge>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <FadeIn delay={100}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2 flex items-center">
                  {activeGroups}
                  <Users size={16} className="ml-2 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  You're participating in {activeGroups} saving group{activeGroups !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </FadeIn>
          
          <FadeIn delay={200}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed Cycles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2 flex items-center">
                  {completedCycles}
                  <Calendar size={16} className="ml-2 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedCycles} cycle{completedCycles !== 1 ? 's' : ''} completed so far
                </p>
              </CardContent>
            </Card>
          </FadeIn>
          
          <FadeIn delay={300}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Contributed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2 flex items-center">
                  {formatCurrency(totalContributed)}
                  <DollarSign size={16} className="ml-2 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Total amount you've contributed
                </p>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <FadeIn delay={150}>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Upcoming Payments</span>
                  <CreditCard size={18} className="text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Your pending contributions for active cycles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Check className="h-8 w-8 text-primary/50 mb-2" />
                    <p className="text-muted-foreground">
                      You have no pending payments. You're all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingPayments.map((payment) => (
                      <div key={payment.cycleId} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                        <div>
                          <div className="font-medium">{payment.groupName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock size={14} />
                            Due by {formatDate(payment.dueDate)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(payment.amount)}</div>
                          <div className="text-sm text-muted-foreground">
                            Cycle {payment.cycleNumber}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard">
                    View All Groups
                    <ArrowRight size={14} className="ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </FadeIn>
          
          <FadeIn delay={300}>
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Recent Notifications</span>
                  <Bell size={18} className="text-muted-foreground" />
                </CardTitle>
                <CardDescription>
                  Updates from your savings groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 text-sm border rounded-lg ${!notification.isRead ? 'bg-muted/20' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs font-normal">
                            {notification.type === "payment_reminder" ? "Payment Due" : 
                             notification.type === "cycle_completed" ? "Cycle Completed" : 
                             "Cycle Started"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p>{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
        
        <FadeIn delay={400}>
          <Card>
            <CardHeader>
              <CardTitle>Your Groups</CardTitle>
              <CardDescription>
                All the savings groups you're participating in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">You haven't joined any groups yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first savings group to get started
                  </p>
                  <Button asChild>
                    <Link to="/create-group">Create Your First Group</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {groups.map((group) => (
                    <div key={group.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{group.name}</h3>
                        <Badge variant={group.currentCycle > 0 ? "default" : "outline"}>
                          {group.currentCycle > 0 ? "Active" : "Pending"}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-6 mb-4">
                        <div className="text-sm space-y-1">
                          <div className="text-muted-foreground">Cycle Progress</div>
                          <div className="font-medium">
                            {group.currentCycle || 0} of {group.totalCycles || 0}
                          </div>
                          <Progress 
                            value={group.totalCycles ? (group.currentCycle / group.totalCycles) * 100 : 0} 
                            className="h-2 w-40"
                          />
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <div className="text-muted-foreground">Contribution</div>
                          <div className="font-medium">${group.contributionAmount}</div>
                          <div className="text-xs text-muted-foreground">
                            {group.contributionFrequency}
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <div className="text-muted-foreground">Members</div>
                          <div className="font-medium">{group.members}</div>
                        </div>
                      </div>
                      
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/groups/${group.id}`}>
                          View Group Details
                          <ChevronRight size={14} className="ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      </FadeIn>
    </AppShell>
  );
};

export default UserDashboard;
