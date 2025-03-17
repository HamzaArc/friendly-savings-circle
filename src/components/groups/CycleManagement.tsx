import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { 
  Form, FormField, FormItem, FormLabel, 
  FormControl, FormMessage, FormDescription 
} from "@/components/ui/form";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, Check, AlertCircle, Plus, Repeat, UserCheck, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import FadeIn from "@/components/ui/FadeIn";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
  joinedAt: string;
}

interface CyclePayment {
  memberId: string;
  memberName: string;
  status: "pending" | "paid";
  date?: string;
}

interface Cycle {
  id: string;
  number: number;
  recipientId: string;
  recipientName: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  payments: CyclePayment[];
}

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

interface CycleManagementProps {
  groupId: string;
}

const cycleSchema = z.object({
  recipientId: z.string().min(1, { message: "Please select a recipient" }),
  startDate: z.string().min(1, { message: "Please enter a start date" }),
});

type CycleFormValues = z.infer<typeof cycleSchema>;

const CycleManagement = ({ groupId }: CycleManagementProps) => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [openAddCycle, setOpenAddCycle] = useState(false);
  const [openCycleDetails, setOpenCycleDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [openSendReminder, setOpenSendReminder] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<CycleFormValues>({
    resolver: zodResolver(cycleSchema),
    defaultValues: {
      recipientId: "",
      startDate: new Date().toISOString().split('T')[0],
    },
  });
  
  useEffect(() => {
    setTimeout(() => {
      const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
      const currentGroup = storedGroups.find((g: any) => g.id === groupId);
      
      let storedMembers: Member[] = [];
      let storedCycles: Cycle[] = [];
      
      if (currentGroup) {
        storedMembers = currentGroup.membersList || [];
        storedCycles = currentGroup.cycles || [];
      }
      
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUserId(user.id || "1");
      
      setMembers(storedMembers);
      setCycles(storedCycles);
      setLoading(false);
    }, 500);
  }, [groupId]);
  
  const saveCycles = (cyclesList: Cycle[]) => {
    const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const updatedGroups = storedGroups.map((group: any) => {
      if (group.id === groupId) {
        const activeCycle = cyclesList.find(cycle => cycle.status === "active");
        
        return {
          ...group,
          cycles: cyclesList,
          currentCycle: activeCycle ? activeCycle.number : 0,
          totalCycles: cyclesList.length,
        };
      }
      return group;
    });
    
    localStorage.setItem("groups", JSON.stringify(updatedGroups));
  };
  
  const onAddCycle = (data: CycleFormValues) => {
    const recipient = members.find(m => m.id === data.recipientId);
    
    if (!recipient) {
      toast({
        title: "Error",
        description: "Selected recipient not found",
        variant: "destructive",
      });
      return;
    }
    
    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    
    const payments: CyclePayment[] = members.map(member => ({
      memberId: member.id,
      memberName: member.name,
      status: "pending",
    }));
    
    const newCycle: Cycle = {
      id: Date.now().toString(),
      number: cycles.length + 1,
      recipientId: data.recipientId,
      recipientName: recipient.name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: cycles.length === 0 ? "active" : "upcoming",
      payments,
    };
    
    const updatedCycles = [...cycles, newCycle];
    setCycles(updatedCycles);
    saveCycles(updatedCycles);
    
    if (newCycle.status === "active") {
      addNotification({
        groupId,
        cycleId: newCycle.id,
        memberId: "all",
        message: `Cycle ${newCycle.number} has started with ${recipient.name} as the recipient.`,
        type: "cycle_started"
      });
    }
    
    toast({
      title: "Cycle added",
      description: `Cycle ${newCycle.number} has been created with ${recipient.name} as the recipient.`,
    });
    
    setOpenAddCycle(false);
    form.reset();
  };
  
  const viewCycleDetails = (cycle: Cycle) => {
    setSelectedCycle(cycle);
    setOpenCycleDetails(true);
  };
  
  const markPayment = (cycleId: string, memberId: string, status: "pending" | "paid") => {
    if (!canRecordPayments(cycleId)) {
      toast({
        title: "Permission denied",
        description: "Only admin or active recipient can record payments.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedCycles = cycles.map(cycle => {
      if (cycle.id === cycleId) {
        const updatedPayments = cycle.payments.map(payment => {
          if (payment.memberId === memberId) {
            return {
              ...payment,
              status,
              date: status === "paid" ? new Date().toISOString() : undefined,
            };
          }
          return payment;
        });
        
        return {
          ...cycle,
          payments: updatedPayments,
        };
      }
      return cycle;
    });
    
    setCycles(updatedCycles);
    saveCycles(updatedCycles);
    
    if (selectedCycle && selectedCycle.id === cycleId) {
      const updatedCycle = updatedCycles.find(c => c.id === cycleId) || null;
      setSelectedCycle(updatedCycle);
    }
    
    toast({
      title: status === "paid" ? "Payment confirmed" : "Payment reset",
      description: `Payment has been marked as ${status}.`,
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const getPaymentProgress = (cycle: Cycle) => {
    const totalPayments = cycle.payments.length;
    const paidPayments = cycle.payments.filter(p => p.status === "paid").length;
    return Math.round((paidPayments / totalPayments) * 100);
  };
  
  const getNextRecipient = () => {
    const recipientIds = cycles.map(cycle => cycle.recipientId);
    const availableMembers = members.filter(member => !recipientIds.includes(member.id));
    
    if (availableMembers.length > 0) {
      return availableMembers[0];
    }
    
    const sortedCycles = [...cycles].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    const firstRecipientId = sortedCycles[0]?.recipientId;
    return members.find(member => member.id === firstRecipientId) || members[0];
  };
  
  const completeCycle = (cycleId: string) => {
    if (!canRecordPayments(cycleId)) {
      toast({
        title: "Permission denied",
        description: "Only admin or active recipient can complete the cycle.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedCycles = cycles.map(cycle => {
      if (cycle.id === cycleId) {
        return { ...cycle, status: "completed" as "completed" | "active" | "upcoming" };
      }
      
      if (cycle.status === "upcoming" && cycles.find(c => c.id === cycleId)?.status === "active") {
        addNotification({
          groupId,
          cycleId: cycle.id,
          memberId: "all",
          message: `Cycle ${cycle.number} is now active with ${cycle.recipientName} as the recipient.`,
          type: "cycle_started"
        });
        
        return { ...cycle, status: "active" as "completed" | "active" | "upcoming" };
      }
      
      return cycle;
    });
    
    setCycles(updatedCycles);
    saveCycles(updatedCycles);
    setOpenCycleDetails(false);
    
    const completedCycle = cycles.find(c => c.id === cycleId);
    if (completedCycle) {
      addNotification({
        groupId,
        cycleId,
        memberId: "all",
        message: `Cycle ${completedCycle.number} has been completed.`,
        type: "cycle_completed"
      });
    }
    
    toast({
      title: "Cycle completed",
      description: "The cycle has been marked as completed and the next cycle has been activated.",
    });
  };
  
  const canRecordPayments = (cycleId: string) => {
    const currentUser = members.find(m => m.id === currentUserId);
    
    if (currentUser?.isAdmin) {
      return true;
    }
    
    const activeCycle = cycles.find(c => c.id === cycleId);
    if (activeCycle && activeCycle.status === "active" && activeCycle.recipientId === currentUserId) {
      return true;
    }
    
    return false;
  };
  
  const getPendingMembers = (cycleId: string) => {
    const cycle = cycles.find(c => c.id === cycleId);
    if (!cycle) return [];
    
    return cycle.payments
      .filter(p => p.status === "pending")
      .map(p => ({
        id: p.memberId,
        name: p.memberName
      }));
  };
  
  const handleSendReminder = (cycleId: string, memberId: string) => {
    if (!canRecordPayments(cycleId)) {
      toast({
        title: "Permission denied",
        description: "Only admin or active recipient can send reminders.",
        variant: "destructive",
      });
      return;
    }
    
    const member = members.find(m => m.id === memberId);
    const cycle = cycles.find(c => c.id === cycleId);
    
    if (!member || !cycle) {
      toast({
        title: "Error",
        description: "Member or cycle not found",
        variant: "destructive",
      });
      return;
    }
    
    addNotification({
      groupId,
      cycleId,
      memberId,
      message: `Reminder: Your payment for cycle ${cycle.number} is due. Please make your contribution as soon as possible.`,
      type: "payment_reminder"
    });
    
    toast({
      title: "Reminder sent",
      description: `Payment reminder sent to ${member.name}.`,
    });
    
    setOpenSendReminder(false);
    setSelectedMemberId(null);
  };
  
  const addNotification = ({ groupId, cycleId, memberId, message, type }: {
    groupId: string;
    cycleId: string;
    memberId: string;
    message: string;
    type: "payment_reminder" | "cycle_completed" | "cycle_started";
  }) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      groupId,
      cycleId,
      memberId,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    const notifications: Notification[] = JSON.parse(localStorage.getItem("notifications") || "[]");
    const updatedNotifications = [...notifications, newNotification];
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
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
  
  const suggestedRecipient = getNextRecipient();
  
  return (
    <FadeIn>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-medium">Cycles ({cycles.length})</h3>
        <Button onClick={() => setOpenAddCycle(true)}>
          <Plus size={16} className="mr-2" />
          Create New Cycle
        </Button>
      </div>
      
      {cycles.length === 0 ? (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <Repeat className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No cycles yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first cycle to start collecting contributions and assign a recipient.
            </p>
            <Button onClick={() => setOpenAddCycle(true)}>
              <Plus size={16} className="mr-2" />
              Create First Cycle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell className="font-medium">Cycle {cycle.number}</TableCell>
                    <TableCell>
                      {cycle.recipientName}
                      {cycle.status === "active" && cycle.recipientId === currentUserId && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          Active Recipient
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={cycle.status === "active" ? "default" : 
                                cycle.status === "completed" ? "outline" : "secondary"}
                      >
                        {cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={getPaymentProgress(cycle)} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">
                          {getPaymentProgress(cycle)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => viewCycleDetails(cycle)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={openAddCycle} onOpenChange={setOpenAddCycle}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Cycle</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddCycle)} className="space-y-4">
              <FormField
                control={form.control}
                name="recipientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || suggestedRecipient?.id || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This member will receive all contributions for this cycle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      The cycle will last for 30 days from this date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpenAddCycle(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Cycle</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {selectedCycle && (
        <Dialog open={openCycleDetails} onOpenChange={setOpenCycleDetails}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Cycle {selectedCycle.number} Details</span>
                <Badge
                  variant={selectedCycle.status === "active" ? "default" : 
                          selectedCycle.status === "completed" ? "outline" : "secondary"}
                >
                  {selectedCycle.status.charAt(0).toUpperCase() + selectedCycle.status.slice(1)}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Recipient</h4>
                  <div className="font-medium flex items-center gap-2">
                    <UserCheck size={16} className="text-primary" />
                    {selectedCycle.recipientName}
                    {selectedCycle.status === "active" && selectedCycle.recipientId === currentUserId && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Period</h4>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    {formatDate(selectedCycle.startDate)} - {formatDate(selectedCycle.endDate)}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Payment Progress</h4>
                <div className="mb-4">
                  <Progress value={getPaymentProgress(selectedCycle)} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {selectedCycle.payments.filter(p => p.status === "paid").length} of {selectedCycle.payments.length} payments received
                    </span>
                    <span>{getPaymentProgress(selectedCycle)}% complete</span>
                  </div>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCycle.payments.map((payment) => (
                      <TableRow key={payment.memberId}>
                        <TableCell className="font-medium">
                          {payment.memberName}
                          {payment.memberId === selectedCycle.recipientId && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Recipient
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={payment.status === "paid" ? "default" : "outline"}
                            className={payment.status === "paid" ? 
                              "bg-green-100 text-green-800 hover:bg-green-100" : 
                              "text-amber-800"}
                          >
                            {payment.status === "paid" ? (
                              <span className="flex items-center gap-1">
                                <Check size={14} />
                                Paid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                Pending
                              </span>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payment.date ? formatDate(payment.date) : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {payment.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markPayment(selectedCycle.id, payment.memberId, "paid")}
                                  disabled={!canRecordPayments(selectedCycle.id)}
                                >
                                  Mark as Paid
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedMemberId(payment.memberId);
                                    setOpenSendReminder(true);
                                  }}
                                  disabled={!canRecordPayments(selectedCycle.id)}
                                >
                                  <Bell size={14} className="mr-1" />
                                  Remind
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markPayment(selectedCycle.id, payment.memberId, "pending")}
                                disabled={!canRecordPayments(selectedCycle.id)}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCycleDetails(false)}>
                Close
              </Button>
              {selectedCycle.status === "active" && (
                <Button 
                  onClick={() => completeCycle(selectedCycle.id)}
                  disabled={getPaymentProgress(selectedCycle) < 100 || !canRecordPayments(selectedCycle.id)}
                >
                  Complete Cycle
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Dialog open={openSendReminder} onOpenChange={setOpenSendReminder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="mb-4">
              Send a payment reminder to {members.find(m => m.id === selectedMemberId)?.name}.
            </p>
            <p className="text-sm text-muted-foreground">
              This will send an in-app notification to the member reminding them to make their payment for the current cycle.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSendReminder(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedCycle && selectedMemberId && handleSendReminder(selectedCycle.id, selectedMemberId)}
            >
              <Bell size={16} className="mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
};

export default CycleManagement;

