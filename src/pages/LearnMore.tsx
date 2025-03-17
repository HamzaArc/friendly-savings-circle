
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FadeIn from "@/components/ui/FadeIn";
import { Info, Book, HelpCircle, Users, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LearnMore = () => {
  return (
    <AppShell>
      <FadeIn>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Learn More</h1>
          <p className="text-muted-foreground">
            Discover how Tontine works and how it can help you and your community
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={18} />
                What is a Tontine?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                A tontine is a traditional group savings arrangement where members contribute regularly to a common fund. Each member takes turns receiving the entire pot of money on a predetermined schedule. This method helps communities save money together and build financial security.
              </p>
              <p className="mb-4">
                Unlike traditional banking products, tontines are built on trust within a community, providing members with access to larger sums of money than they might be able to save individually in a short period.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle size={18} />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4 bg-muted/20 rounded-lg">
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <h3 className="font-medium mb-2">Form a Group</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by creating a savings group and inviting trusted friends, family, or colleagues to join.
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 bg-muted/20 rounded-lg">
                  <DollarSign className="h-10 w-10 text-primary mb-2" />
                  <h3 className="font-medium mb-2">Make Contributions</h3>
                  <p className="text-sm text-muted-foreground">
                    Each member contributes an equal amount on a regular schedule (weekly, monthly, etc.).
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 bg-muted/20 rounded-lg">
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <h3 className="font-medium mb-2">Take Turns</h3>
                  <p className="text-sm text-muted-foreground">
                    Each cycle, one member receives the entire pool of contributions until everyone has had a turn.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book size={18} />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-1">Is my money safe?</h3>
                  <p className="text-sm text-muted-foreground">
                    Tontines are based on trust within your community. Our app helps you track contributions and payouts, but you should only create or join groups with people you trust.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">How are recipient orders determined?</h3>
                  <p className="text-sm text-muted-foreground">
                    The group admin can set the order of recipients when creating cycles, or it can be determined by mutual agreement among members.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-1">What happens if someone doesn't contribute?</h3>
                  <p className="text-sm text-muted-foreground">
                    The app allows group admins to track payments and send reminders. However, enforcement of contributions ultimately relies on your group's social dynamics and agreements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mt-4">
            <Button asChild>
              <Link to="/onboarding">
                Get Started Today
              </Link>
            </Button>
          </div>
        </div>
      </FadeIn>
    </AppShell>
  );
};

export default LearnMore;
