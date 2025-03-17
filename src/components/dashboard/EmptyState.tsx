
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import FadeIn from "../ui/FadeIn";

const EmptyState = () => {
  return (
    <FadeIn className="w-full py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-10 w-10 text-primary" />
        </div>
        
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">No savings groups yet</h2>
        
        <p className="mb-8 text-muted-foreground">
          Create your first savings group to start collaborating with friends, family, or colleagues and achieve your financial goals together.
        </p>
        
        <Button asChild size="lg" className="px-8 animate-pulse">
          <Link to="/create-group">
            <Plus className="mr-2 h-5 w-5" />
            Create Your First Group
          </Link>
        </Button>
      </div>
    </FadeIn>
  );
};

export default EmptyState;
