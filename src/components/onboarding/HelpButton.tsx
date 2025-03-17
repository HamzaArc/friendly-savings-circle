
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import GuidedTour from "./GuidedTour";

const HelpButton = () => {
  const [showTour, setShowTour] = useState(false);
  
  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 rounded-full"
        onClick={() => setShowTour(true)}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      
      <GuidedTour open={showTour} onOpenChange={setShowTour} />
    </>
  );
};

export default HelpButton;
