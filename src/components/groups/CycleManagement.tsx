
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, MoreHorizontal, CheckCircle, Clock, CircleDollarSign, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FadeIn from "@/components/ui/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Cycle {
  id: string;
  number: number;
  status: "pending" | "active" | "completed";
  startDate: string;
  endDate: string | null;
  recipientId: string | null;
  recipientName: string | null;
  paymentsMade: number;
  totalPayments: number;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  isAdmin: boolean;
}

interface CycleManagementProps {
  groupId: string;
}

const CycleManagement = ({ groupId }: CycleManagementProps) => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // New cycle form state
  const [showNewCycleDialog, setShowNewCycleDialog] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("");
  
  // Load data
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Check if user is admin
        const { data: adminCheck, error: adminError } = await supabase
          .from('group_members')
          .select('is_admin')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single();
          
        if (adminError) {
          console.error("Admin check error:", adminError);
          throw adminError;
        }
        
        setIsAdmin(adminCheck.is_admin || false);
        
        // Fetch cycles
        const { data: cyclesData, error: cyclesError } = await supabase
          .from('cycles')
          .select(`
            id, 
            number,
            status,
            start_date,
            end_date,
            recipient_id
          `)
          .eq('group_id', groupId)
          .order('number', { ascending: true });
          
        if (cyclesError) {
          console.error("Cycles fetch error:", cyclesError);
          throw cyclesError;
        }
        
        // Fetch members for the dropdown
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            id, 
            user_id,
            is_admin
          `)
          .eq('group_id', groupId);
          
        if (membersError) {
          console.error("Members fetch error:", membersError);
          throw membersError;
        }
        
        // Fetch user profiles for members
        const userIds = membersData.map(m => m.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("Profiles fetch error:", profilesError);
          throw profilesError;
        }
        
        // Map user profiles to members
        const profileMap = new Map();
        if (profiles) {
          profiles.forEach(profile => {
            profileMap.set(profile.id, profile);
          });
        }
        
        const formattedMembers = membersData.map(member => {
          const profile = profileMap.get(member.user_id);
          return {
            id: member.id,
            userId: member.user_id,
            name: profile?.name || 'Unknown User',
            isAdmin: member.is_admin
          };
        });
        
        setMembers(formattedMembers);
        
        // For each cycle, count the payments
        const formattedCycles = await Promise.all(cyclesData.map(async (cycle) => {
          // Count payments for this cycle
          const { count: paymentsMade, error: paymentsError } = await supabase
            .from('payments')
            .select('id', { count: 'exact', head: true })
            .eq('cycle_id', cycle.id)
            .eq('status', 'paid');
            
          if (paymentsError) {
            console.error("Payments count error:", paymentsError);
            throw paymentsError;
          }
          
          // Get total members count
          const { count: totalMembers, error: membersCountError } = await supabase
            .from('group_members')
            .select('id', { count: 'exact', head: true })
            .eq('group_id', groupId);
            
          if (membersCountError) {
            console.error("Members count error:", membersCountError);
            throw membersCountError;
          }
          
          // Find recipient name if there is one
          let recipientName = null;
          if (cycle.recipient_id) {
            const { data: recipient, error: recipientError } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', cycle.recipient_id)
              .single();
              
            if (recipientError) {
              console.error("Recipient fetch error:", recipientError);
              // Don't throw, just log the error and continue
            } else {
              recipientName = recipient.name;
            }
          }
          
          return {
            id: cycle.id,
            number: cycle.number,
            status: cycle.status as "pending" | "active" | "completed",
            startDate: cycle.start_date,
            endDate: cycle.end_date,
            recipientId: cycle.recipient_id,
            recipientName,
            paymentsMade: paymentsMade || 0,
            totalPayments: totalMembers || 0
          };
        }));
        
        setCycles(formattedCycles);
      } catch (error) {
        console.error("Error fetching cycle data:", error);
        toast({
          title: "Error loading cycles",
          description: "There was an error loading the cycle data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [groupId, user, toast]);
  
  const startCycle = async (cycleId: string) => {
    if (!user || !isAdmin) return;
    
    try {
      // Check if there's already an active cycle
      const { data: activeCycles, error: checkError } = await supabase
        .from('cycles')
        .select('id')
        .eq('group_id', groupId)
        .eq('status', 'active');
        
      if (checkError) {
        console.error("Active cycle check error:", checkError);
        throw checkError;
      }
      
      if (activeCycles && activeCycles.length > 0) {
        toast({
          title: "Active cycle exists",
          description: "Please complete the current active cycle before starting a new one.",
          variant: "destructive",
        });
        return;
      }
      
      // Update the cycle status to active
      const { error: updateError } = await supabase
        .from('cycles')
        .update({ status: 'active' })
        .eq('id', cycleId);
        
      if (updateError) {
        console.error("Cycle activation error:", updateError);
        throw updateError;
      }
      
      // Update cycle number in the group
      const cycleToStart = cycles.find(c => c.id === cycleId);
      if (cycleToStart) {
        const { error: groupUpdateError } = await supabase
          .from('groups')
          .update({ current_cycle: cycleToStart.number })
          .eq('id', groupId);
          
        if (groupUpdateError) {
          console.error("Group update error:", groupUpdateError);
          throw groupUpdateError;
        }
      }
      
      // Create pending payments for all members
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('contribution_amount')
        .eq('id', groupId)
        .single();
        
      if (groupError) {
        console.error("Group fetch error:", groupError);
        throw groupError;
      }
      
      const contributionAmount = groupData.contribution_amount;
      
      // Get all members
      const { data: groupMembers, error: membersError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId);
        
      if (membersError) {
        console.error("Members fetch error:", membersError);
        throw membersError;
      }
      
      // Create pending payments for each member
      const payments = groupMembers.map(member => ({
        group_id: groupId,
        cycle_id: cycleId,
        user_id: member.user_id,
        amount: contributionAmount,
        status: 'pending'
      }));
      
      const { error: paymentsError } = await supabase
        .from('payments')
        .insert(payments);
        
      if (paymentsError) {
        console.error("Payments creation error:", paymentsError);
        throw paymentsError;
      }
      
      // Create notifications for all members
      const notifications = groupMembers.map(member => ({
        user_id: member.user_id,
        group_id: groupId,
        cycle_id: cycleId,
        type: 'cycle_started',
        message: `A new payment cycle has started in ${cycleToStart ? `cycle ${cycleToStart.number}` : 'your group'}`
      }));
      
      await supabase
        .from('notifications')
        .insert(notifications);
      
      // Update the local state
      setCycles(prev => prev.map(cycle => 
        cycle.id === cycleId ? { ...cycle, status: 'active' } : cycle
      ));
      
      toast({
        title: "Cycle started",
        description: "The cycle has been activated and members have been notified.",
      });
    } catch (error) {
      console.error("Error starting cycle:", error);
      toast({
        title: "Error starting cycle",
        description: "There was an error starting the cycle. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const completeCycle = async (cycleId: string) => {
    if (!user || !isAdmin) return;
    
    try {
      // Update the cycle status to completed
      const { error: updateError } = await supabase
        .from('cycles')
        .update({
          status: 'completed',
          end_date: new Date().toISOString()
        })
        .eq('id', cycleId);
        
      if (updateError) {
        console.error("Cycle completion error:", updateError);
        throw updateError;
      }
      
      // Find the next cycle to prepare
      const completedCycle = cycles.find(c => c.id === cycleId);
      if (!completedCycle) return;
      
      const nextCycleNumber = completedCycle.number + 1;
      const nextCycle = cycles.find(c => c.number === nextCycleNumber);
      
      // Create notifications for recipient
      if (completedCycle.recipientId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: completedCycle.recipientId,
            group_id: groupId,
            cycle_id: cycleId,
            type: 'cycle_completed',
            message: `Cycle ${completedCycle.number} has been completed. Check your account for the payout.`
          });
      }
      
      // Update the local state
      setCycles(prev => prev.map(cycle => 
        cycle.id === cycleId ? { ...cycle, status: 'completed', endDate: new Date().toISOString() } : cycle
      ));
      
      toast({
        title: "Cycle completed",
        description: `Cycle ${completedCycle.number} has been marked as completed.`,
      });
      
      // If there's a next cycle, suggest to start it
      if (nextCycle) {
        toast({
          title: "Next cycle ready",
          description: `Cycle ${nextCycle.number} is ready to be started.`,
        });
      }
    } catch (error) {
      console.error("Error completing cycle:", error);
      toast({
        title: "Error completing cycle",
        description: "There was an error completing the cycle. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const createNewCycle = async () => {
    if (!user || !isAdmin || !startDate) return;
    
    try {
      // Validate form
      if (!selectedRecipientId) {
        toast({
          title: "Recipient required",
          description: "Please select a recipient for this cycle.",
          variant: "destructive",
        });
        return;
      }
      
      // Get the next cycle number
      const nextCycleNumber = cycles.length > 0 
        ? Math.max(...cycles.map(c => c.number)) + 1 
        : 1;
      
      // Create the new cycle
      const { data: newCycle, error: cycleError } = await supabase
        .from('cycles')
        .insert({
          group_id: groupId,
          number: nextCycleNumber,
          status: 'pending',
          start_date: startDate.toISOString(),
          end_date: endDate ? endDate.toISOString() : null,
          recipient_id: selectedRecipientId
        })
        .select()
        .single();
        
      if (cycleError) {
        console.error("Cycle creation error:", cycleError);
        throw cycleError;
      }
      
      // Find recipient name
      const recipient = members.find(m => m.userId === selectedRecipientId);
      
      // Add to local state
      const newCycleFormatted: Cycle = {
        id: newCycle.id,
        number: newCycle.number,
        status: newCycle.status as "pending" | "active" | "completed",
        startDate: newCycle.start_date,
        endDate: newCycle.end_date,
        recipientId: newCycle.recipient_id,
        recipientName: recipient?.name || null,
        paymentsMade: 0,
        totalPayments: members.length
      };
      
      setCycles(prev => [...prev, newCycleFormatted]);
      
      // Update total cycles in group if needed
      if (nextCycleNumber > cycles.length) {
        await supabase
          .from('groups')
          .update({ total_cycles: nextCycleNumber })
          .eq('id', groupId);
      }
      
      // Reset form and close dialog
      setStartDate(new Date());
      setEndDate(undefined);
      setSelectedRecipientId("");
      setShowNewCycleDialog(false);
      
      toast({
        title: "Cycle created",
        description: `Cycle ${nextCycleNumber} has been created successfully.`,
      });
    } catch (error) {
      console.error("Error creating cycle:", error);
      toast({
        title: "Error creating cycle",
        description: "There was an error creating the cycle. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-7 w-32 bg-muted/30 rounded animate-pulse"></div>
          <div className="h-9 w-36 bg-muted/30 rounded animate-pulse"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <FadeIn>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Payment Cycles</h3>
        {isAdmin && (
          <Button onClick={() => setShowNewCycleDialog(true)}>
            <Plus size={16} className="mr-2" />
            New Cycle
          </Button>
        )}
      </div>
      
      {cycles.length === 0 ? (
        <Card>
          <CardContent className="py-8 flex flex-col items-center justify-center">
            <div className="p-3 rounded-full bg-primary/10 mb-4">
              <CalendarIcon size={24} className="text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Payment Cycles</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Payment cycles determine who receives the group pool in each round.
              {isAdmin ? " As an admin, you can create and manage cycles." : ""}
            </p>
            {isAdmin && (
              <Button onClick={() => setShowNewCycleDialog(true)}>
                <Plus size={16} className="mr-2" />
                Create First Cycle
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cycles.map((cycle) => (
            <Card key={cycle.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">Cycle {cycle.number}</h3>
                      <Badge
                        className={
                          cycle.status === "active" 
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : cycle.status === "completed"
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                        }
                      >
                        {cycle.status === "active" ? (
                          <><Clock size={12} className="mr-1" /> Active</>
                        ) : cycle.status === "completed" ? (
                          <><CheckCircle size={12} className="mr-1" /> Completed</>
                        ) : (
                          <>Pending</>
                        )}
                      </Badge>
                    </div>
                    
                    <div className="text-muted-foreground text-sm">
                      {cycle.startDate && (
                        <span>
                          Started: {format(new Date(cycle.startDate), "MMM d, yyyy")}
                        </span>
                      )}
                      {cycle.endDate && (
                        <span className="ml-2">
                          • Ended: {format(new Date(cycle.endDate), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">
                        <CircleDollarSign size={14} className="inline mr-1" />
                        {cycle.paymentsMade} of {cycle.totalPayments} payments
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-sm flex items-center">
                        <User size={14} className="mr-1 text-muted-foreground" />
                        <span className="font-medium">
                          {cycle.recipientName || "No recipient"}
                        </span>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {cycle.status === "pending" && (
                            <DropdownMenuItem onClick={() => startCycle(cycle.id)}>
                              Start Cycle
                            </DropdownMenuItem>
                          )}
                          {cycle.status === "active" && (
                            <DropdownMenuItem onClick={() => completeCycle(cycle.id)}>
                              Complete Cycle
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* New Cycle Dialog */}
      <Dialog open={showNewCycleDialog} onOpenChange={setShowNewCycleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Cycle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => (startDate ? date < startDate : false)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select 
                value={selectedRecipientId} 
                onValueChange={setSelectedRecipientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCycleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createNewCycle}>Create Cycle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FadeIn>
  );
};

export default CycleManagement;
