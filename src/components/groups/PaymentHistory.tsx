
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import FadeIn from "@/components/ui/FadeIn";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Payment {
  id: string;
  cycleNumber: number;
  memberName: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  date: string | null;
}

interface PaymentHistoryProps {
  groupId: string;
}

const PaymentHistory = ({ groupId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchPayments = async () => {
      setLoading(true);
      
      try {
        // First get group members for mapping user IDs to names
        const { data: memberships, error: membershipsError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', groupId);
          
        if (membershipsError) {
          console.error("Memberships fetch error:", membershipsError);
          throw membershipsError;
        }
        
        if (!memberships || memberships.length === 0) {
          setPayments([]);
          setFilteredPayments([]);
          setLoading(false);
          return;
        }
        
        // Get user profiles
        const userIds = memberships.map(m => m.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("Profiles fetch error:", profilesError);
          throw profilesError;
        }
        
        // Create a map of user IDs to names
        const userMap = new Map();
        if (profiles) {
          profiles.forEach(profile => {
            userMap.set(profile.id, profile.name || 'Unknown User');
          });
        }
        
        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            id,
            user_id,
            cycle_id,
            amount,
            status,
            payment_date
          `)
          .eq('group_id', groupId);
          
        if (paymentsError) {
          console.error("Payments fetch error:", paymentsError);
          throw paymentsError;
        }
        
        // Get cycle information to map cycle IDs to cycle numbers
        const cycleIds = [...new Set(paymentsData.map(p => p.cycle_id))];
        const { data: cyclesData, error: cyclesError } = await supabase
          .from('cycles')
          .select('id, number')
          .in('id', cycleIds);
          
        if (cyclesError) {
          console.error("Cycles fetch error:", cyclesError);
          throw cyclesError;
        }
        
        // Create a map of cycle IDs to cycle numbers
        const cycleMap = new Map();
        if (cyclesData) {
          cyclesData.forEach(cycle => {
            cycleMap.set(cycle.id, cycle.number);
          });
        }
        
        // Format payments data
        const formattedPayments = paymentsData.map(payment => ({
          id: payment.id,
          cycleNumber: cycleMap.get(payment.cycle_id) || 0,
          memberName: userMap.get(payment.user_id) || 'Unknown User',
          amount: Number(payment.amount),
          status: payment.status as "pending" | "paid" | "failed",
          date: payment.payment_date
        }));
        
        // Sort by date, most recent first
        const sortedPayments = formattedPayments.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setPayments(sortedPayments);
        setFilteredPayments(sortedPayments);
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast({
          title: "Error loading payments",
          description: "There was an error loading the payment history.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPayments();
  }, [groupId, user, toast]);
  
  // Apply filters whenever search or statusFilter changes
  useEffect(() => {
    let filtered = [...payments];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }
    
    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.memberName.toLowerCase().includes(searchLower) ||
        payment.cycleNumber.toString().includes(searchLower)
      );
    }
    
    setFilteredPayments(filtered);
  }, [payments, search, statusFilter]);
  
  const exportPayments = () => {
    try {
      // Create CSV content
      const headers = ["Cycle", "Member", "Amount", "Status", "Date"];
      const rows = filteredPayments.map(payment => [
        payment.cycleNumber.toString(),
        payment.memberName,
        `$${payment.amount.toFixed(2)}`,
        payment.status,
        payment.date ? format(new Date(payment.date), "MMM d, yyyy") : "N/A"
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");
      
      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `payment-history-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Payment history has been exported to CSV.",
      });
    } catch (error) {
      console.error("Error exporting payments:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the payment history.",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted/30 rounded animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-1 items-center relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by member name or cycle..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportPayments}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {filteredPayments.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-sm text-muted-foreground">
                      <th className="py-3 px-4 text-left">Member</th>
                      <th className="py-3 px-4 text-left">Cycle</th>
                      <th className="py-3 px-4 text-left">Amount</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="py-3 px-4 font-medium">
                          {payment.memberName}
                        </td>
                        <td className="py-3 px-4">
                          Cycle {payment.cycleNumber}
                        </td>
                        <td className="py-3 px-4">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              payment.status === "paid" 
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {payment.status === "paid" ? (
                              <><CheckCircle size={12} className="mr-1" /> Paid</>
                            ) : payment.status === "pending" ? (
                              <><Clock size={12} className="mr-1" /> Pending</>
                            ) : (
                              <><AlertTriangle size={12} className="mr-1" /> Failed</>
                            )}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {payment.date 
                            ? format(new Date(payment.date), "MMM d, yyyy") 
                            : "Not processed"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <h3 className="text-lg font-medium mb-2">No payments found</h3>
            <p className="text-muted-foreground">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Payments will appear here once members start contributing"}
            </p>
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default PaymentHistory;
