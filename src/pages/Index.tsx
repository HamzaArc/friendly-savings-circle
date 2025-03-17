
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Calendar, Shield, BarChart3 } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  // Check if user is logged in
  const { user } = useAuth();
  
  const features = [
    {
      icon: Users,
      title: "Group Management",
      description: "Create and manage multiple savings groups with friends, family, or colleagues."
    },
    {
      icon: Calendar,
      title: "Payment Cycles",
      description: "Schedule automatic contribution cycles with customizable frequencies."
    },
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "Track all contributions and payouts with complete transparency."
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Visualize your savings progress and track your financial goals."
    }
  ];

  return (
    <AppShell fullWidth noHeader>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(230,245,255,0.4)0%,rgba(230,245,255,0)100%)]" />
        
        <div className="fixed top-0 left-0 right-0 z-50 py-5 px-6">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-xl font-display font-semibold tracking-tight">
              <div className="rounded-lg bg-primary h-8 w-8 flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span>Tontine</span>
            </Link>
            
            <div className="flex items-center gap-4">
              {user ? (
                <Button asChild size="sm">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="container px-6 max-w-5xl mx-auto text-center">
          <FadeIn delay={100}>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6">
              Modern Savings Solution
            </div>
          </FadeIn>
          
          <FadeIn delay={200}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold tracking-tight mb-6 max-w-3xl mx-auto">
              Achieve Your Financial Goals Together
            </h1>
          </FadeIn>
          
          <FadeIn delay={300}>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Create and manage rotating savings groups with friends, family, or colleagues. 
              Build wealth together with transparency and ease.
            </p>
          </FadeIn>
          
          <FadeIn delay={400}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link to="/register">
                  Get Started for Free
                  <ChevronRight size={18} className="ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/learn-more">Learn More</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
        
        <div className="container px-6 mx-auto mt-20">
          <FadeIn delay={500} className="max-w-3xl mx-auto neo-morphism rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 h-14 flex items-center px-6">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
            </div>
            
            <div className="p-6 bg-white">
              <div className="aspect-video bg-gray-100 rounded-lg animate-pulse"></div>
            </div>
          </FadeIn>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-4">
              Powerful Features for Group Savings
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your rotating savings groups in one place.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FadeIn key={index} delay={100 * (index + 1)}>
                <div className="glass-card rounded-xl p-6 h-full">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-accent">
        <div className="container px-6 mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-6 max-w-2xl mx-auto">
              Ready to Start Your Savings Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of people who are already saving together and achieving their financial goals.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/register">
                Create Your Account
                <ChevronRight size={18} className="ml-1" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-muted/30">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link to="/" className="flex items-center gap-2 text-xl font-display font-semibold tracking-tight mb-2">
                <div className="rounded-lg bg-primary h-8 w-8 flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span>Tontine</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Tontine. All rights reserved.
              </p>
            </div>
            
            <div className="flex gap-6">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </AppShell>
  );
};

export default Index;
