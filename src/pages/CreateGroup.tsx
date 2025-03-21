
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import GroupForm from "@/components/groups/GroupForm";
import { useAuth } from "@/context/AuthContext";

const CreateGroup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  return (
    <AppShell>
      <FadeIn className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-1">Create a Savings Group</h1>
        <p className="text-muted-foreground">
          Set up a new rotating savings group and invite members
        </p>
      </FadeIn>
      
      <GroupForm />
    </AppShell>
  );
};

export default CreateGroup;
