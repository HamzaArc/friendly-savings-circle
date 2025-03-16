
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import GroupForm from "@/components/groups/GroupForm";
import { useEffect } from "react";

const CreateGroup = () => {
  // Check if user is logged in, redirect to onboarding if not
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "/onboarding";
    }
  }, []);

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
