
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Users, 
  DollarSign, 
  Calendar,
  ArrowRight,
  Trophy,
  HelpCircle
} from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  image?: string;
  icon: JSX.Element;
}

interface GuidedTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GuidedTour = ({ open, onOpenChange }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps: TourStep[] = [
    {
      title: "Welcome to Savings Groups",
      description: "A modern way to manage rotating savings groups, helping communities save together and achieve financial goals.",
      icon: <Users className="h-12 w-12 text-primary" />
    },
    {
      title: "Create or Join Groups",
      description: "Start by creating your own savings group or joining an existing one. Invite friends, family, or colleagues to participate.",
      icon: <Users className="h-12 w-12 text-primary" />
    },
    {
      title: "Manage Your Contributions",
      description: "Make regular contributions according to your group's schedule. Track payments and see when it's your turn to receive the pot.",
      icon: <DollarSign className="h-12 w-12 text-primary" />
    },
    {
      title: "Stay on Schedule",
      description: "Use the calendar view to keep track of upcoming payment deadlines and payout dates. Never miss an important date.",
      icon: <Calendar className="h-12 w-12 text-primary" />
    },
    {
      title: "Earn Achievements",
      description: "Make on-time payments and participate actively to earn badges and climb the leaderboard.",
      icon: <Trophy className="h-12 w-12 text-primary" />
    }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      
      // Store that the user has seen the tour
      localStorage.setItem("guidedTourSeen", "true");
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const skipTour = () => {
    onOpenChange(false);
    localStorage.setItem("guidedTourSeen", "true");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {steps.length}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8 flex flex-col items-center text-center">
          <div className="mb-6 bg-primary/10 p-6 rounded-full">
            {steps[currentStep].icon}
          </div>
          
          <p className="text-muted-foreground mb-6">
            {steps[currentStep].description}
          </p>
          
          <div className="flex items-center gap-1">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`} 
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {currentStep > 0 ? (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={skipTour}>
                Skip Tour
              </Button>
            )}
          </div>
          
          <Button onClick={nextStep}>
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GuidedTour;
