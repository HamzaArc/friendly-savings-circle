
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Calendar, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface GroupCardProps {
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
  className?: string;
}

const GroupCard = ({
  id,
  name,
  description,
  members,
  totalMembers,
  currentCycle,
  totalCycles,
  contributionAmount,
  contributionFrequency,
  nextPaymentDate,
  className,
}: GroupCardProps) => {
  // Calculate progress percentage
  const cycleProgress = (currentCycle / totalCycles) * 100;
  const memberProgress = (members / totalMembers) * 100;

  return (
    <Link to={`/groups/${id}`}>
      <Card className={cn(
        "glass-card h-full overflow-hidden transition-transform hover:translate-y-[-4px]",
        className
      )}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-xl font-semibold tracking-tight mb-1">{name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users size={16} className="mr-1.5" />
                <span>
                  {members}/{totalMembers} members
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar size={16} className="mr-1.5" />
                <span>{nextPaymentDate}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cycle progress</span>
                <span className="font-medium">{currentCycle}/{totalCycles}</span>
              </div>
              <Progress value={cycleProgress} className="h-1.5" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-border mt-6">
          <div>
            <p className="text-sm text-muted-foreground">Contribution</p>
            <p className="font-medium">${contributionAmount} <span className="text-xs text-muted-foreground">/ {contributionFrequency}</span></p>
          </div>
          <ArrowRight size={18} className="text-muted-foreground" />
        </CardFooter>
      </Card>
    </Link>
  );
};

export default GroupCard;
