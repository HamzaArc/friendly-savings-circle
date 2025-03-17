
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, RefreshCw } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";

interface Payment {
  id: string;
  amount: number;
  date: string;
  status: "paid" | "pending";
  cycle: number;
  memberName: string;
}

interface PaymentHistoryProps {
  groupId: string;
}

const PaymentHistory = ({ groupId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const loadPaymentHistory = () => {
    setLoading(true);
    
    // Get real payment data from group cycles
    const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    const group = storedGroups.find((g: any) => g.id === groupId);
    
    if (!group || !group.cycles) {
      setPayments([]);
      setLoading(false);
      return;
    }
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id || "1";
    
    // Extract payments from cycles
    const extractedPayments: Payment[] = [];
    
    group.cycles.forEach((cycle: any) => {
      if (!cycle.payments) return;
      
      const userPayment = cycle.payments.find((p: any) => p.memberId === userId);
      
      if (userPayment) {
        extractedPayments.push({
          id: `${cycle.id}-${userId}`,
          amount: group.contributionAmount || 100,
          date: userPayment.date || cycle.endDate,
          status: userPayment.status,
          cycle: cycle.number,
          memberName: "You"
        });
      }
    });
    
    // Sort by cycle number (descending)
    extractedPayments.sort((a, b) => b.cycle - a.cycle);
    
    setPayments(extractedPayments);
    setLoading(false);
  };
  
  useEffect(() => {
    loadPaymentHistory();
  }, [groupId]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: "numeric",
      month: "short",
      day: "numeric" 
    }).format(date);
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
  
  return (
    <FadeIn>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Your Payment History</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadPaymentHistory}
          className="gap-2"
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>
      
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No payments yet</h3>
          <p className="text-muted-foreground">
            Payments will appear here once the first contribution is made.
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {payment.status === "paid" ? (
                        <CheckCircle2 size={18} className="text-green-600" />
                      ) : (
                        <Clock size={18} className="text-amber-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        Cycle {payment.cycle} Payment
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {payment.memberName} • {formatDate(payment.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-right">
                      ${payment.amount}
                    </div>
                    <Badge 
                      variant={payment.status === "paid" ? "default" : "outline"}
                      className={payment.status === "paid" 
                        ? "bg-green-100 text-green-800 hover:bg-green-100" 
                        : "text-amber-800"
                      }
                    >
                      {payment.status === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </FadeIn>
  );
};

export default PaymentHistory;
