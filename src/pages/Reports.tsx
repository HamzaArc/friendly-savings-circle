
import { useEffect } from "react";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FadeIn from "@/components/ui/FadeIn";
import { FileText, BarChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const Reports = () => {
  useEffect(() => {
    // Check if user is logged in, redirect to onboarding if not
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "/onboarding";
    }
  }, []);

  return (
    <AppShell>
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Reports</h1>
          <p className="text-muted-foreground">
            View and download reports about your savings groups
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={18} />
                Reports Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center">
                <div className="mx-auto bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <BarChart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Reports Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  The reports dashboard is currently in development. Check back soon for detailed analytics and reporting on your savings groups.
                </p>
                <Button variant="outline" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </AppShell>
  );
};

export default Reports;
