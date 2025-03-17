
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import FadeIn from "../ui/FadeIn";

interface EmptyStateProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
}

const EmptyState = ({
  title = "No savings groups yet",
  description = "Create your first savings group to start collaborating with friends, family, or colleagues and achieve your financial goals together.",
  buttonText = "Create Your First Group",
  buttonLink = "/create-group"
}: EmptyStateProps) => {
  return (
    <FadeIn className="w-full py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-10 w-10 text-primary" />
        </div>
        
        <h2 className="mb-2 text-2xl font-semibold tracking-tight">{title}</h2>
        
        <p className="mb-8 text-muted-foreground">
          {description}
        </p>
        
        <Button asChild size="lg" className="px-8 animate-pulse">
          <Link to={buttonLink}>
            <Plus className="mr-2 h-5 w-5" />
            {buttonText}
          </Link>
        </Button>
      </div>
    </FadeIn>
  );
};

export default EmptyState;
