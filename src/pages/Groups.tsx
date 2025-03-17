
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import FadeIn from "@/components/ui/FadeIn";

const Groups = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard since this is a duplicate route
    navigate("/dashboard");
  }, [navigate]);

  return (
    <AppShell>
      <FadeIn>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">Redirecting...</h2>
          <p className="text-muted-foreground">
            Taking you to the dashboard.
          </p>
        </div>
      </FadeIn>
    </AppShell>
  );
};

export default Groups;
