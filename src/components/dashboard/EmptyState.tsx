
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const EmptyState = ({ title, description, buttonText, buttonLink }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <PlusCircle className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>
      <Button asChild>
        <Link to={buttonLink}>{buttonText}</Link>
      </Button>
    </div>
  );
};

export default EmptyState;
