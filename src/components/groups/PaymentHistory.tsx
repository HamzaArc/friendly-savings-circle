
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
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
  
  useEffect(() => {
    // In a real app, this would fetch payment history from an API
    // For now, we'll create some mock data
    setTimeout(() => {
      const mockPayments: Payment[] = [
        {
          id: "1",
          amount: 100,
          date: new Date().toISOString(),
          status: "paid",
          cycle: 1,
          memberName: "You"
        },
        {
          id: "2",
          amount: 100,
          date: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days in the future
          status: "pending",
          cycle: 2,
          memberName: "You"
        }
      ];
      
      setPayments(mockPayments);
      setLoading(false);
    }, 500);
  }, [groupId]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
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
  
  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No payments yet</h3>
        <p className="text-muted-foreground">
          Payments will appear here once the first contribution is made.
        </p>
      </div>
    );
  }
  
  return (
    <FadeIn>
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
    </FadeIn>
  );
};

export default PaymentHistory;
