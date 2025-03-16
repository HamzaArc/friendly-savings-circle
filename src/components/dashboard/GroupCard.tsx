
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import FadeIn from "../ui/FadeIn";

interface GroupCardProps {
  id: string;
  name: string;
  description?: string;
  members: number;
  totalMembers: number;
  currentCycle: number;
  totalCycles: number;
  contributionAmount: number;
  contributionFrequency: string;
  nextPaymentDate: string;
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
  nextPaymentDate
}: GroupCardProps) => {
  const progressPercentage = (currentCycle / totalCycles) * 100;
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  }
  
  return (
    <FadeIn>
      <Card className="h-full flex flex-col">
        <CardContent className="pt-6 pb-2 flex-grow">
          <div className="mb-3 flex justify-between items-start">
            <h3 className="font-semibold tracking-tight text-lg">{name}</h3>
            
            <Badge 
              variant="secondary" 
              className="text-xs font-normal"
            >
              {contributionFrequency}
            </Badge>
          </div>
          
          {description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">Cycle Progress</div>
              <div className="font-medium">{currentCycle}/{totalCycles}</div>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <div className="flex justify-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground">Members</div>
                <div className="text-sm font-medium">{members}/{totalMembers}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground">Contribution</div>
                <div className="text-sm font-medium">${contributionAmount}</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground">Next Payment</div>
                <div className="text-sm font-medium">{formatDate(nextPaymentDate)}</div>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 pb-6">
          <Button 
            variant="ghost" 
            className="w-full justify-between group"
            asChild
          >
            <Link to={`/groups/${id}`}>
              View Group Details
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </FadeIn>
  );
};

export default GroupCard;
