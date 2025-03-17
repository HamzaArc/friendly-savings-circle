
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import FadeIn from "../ui/FadeIn";

const OnboardingForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!formData.name) {
        toast({
          title: "Name is required",
          description: "Please enter your name to continue.",
          variant: "destructive",
        });
        return;
      }
      
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (!formData.email) {
        toast({
          title: "Email is required",
          description: "Please enter your email to continue.",
          variant: "destructive",
        });
        return;
      }
      
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }
      
      setStep(3);
      return;
    }
    
    if (step === 3) {
      if (!formData.password) {
        toast({
          title: "Password is required",
          description: "Please create a password to continue.",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.password.length < 8) {
        toast({
          title: "Password too short",
          description: "Your password must be at least 8 characters long.",
          variant: "destructive",
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please ensure both passwords match.",
          variant: "destructive",
        });
        return;
      }
      
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Account created!",
        description: "Welcome to Tontine, " + formData.name + "!",
      });
      
      // Store user in localStorage (this would be replaced with proper auth in a real app)
      localStorage.setItem("user", JSON.stringify({
        name: formData.name,
        email: formData.email,
        // Don't store password in localStorage in a real app
      }));
      
      // Navigate to dashboard
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <FadeIn>
      <div className="mx-auto max-w-md px-6 sm:px-0">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to Tontine</h1>
          <p className="text-muted-foreground">
            Let's get you set up to start saving together.
          </p>
        </div>

        <div className="glass-morphism rounded-xl p-8">
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center"
                onClick={() => i < step && setStep(i)}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm 
                  ${
                    i < step
                      ? "bg-primary text-white cursor-pointer"
                      : i === step
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < step ? "✓" : i}
                </div>
                {i < 3 && (
                  <div
                    className={`h-0.5 w-10 ${
                      i < step ? "bg-primary" : "bg-secondary"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            {step === 1 && (
              <FadeIn className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              </FadeIn>
            )}

            {step === 2 && (
              <FadeIn className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
              </FadeIn>
            )}

            {step === 3 && (
              <FadeIn className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Create Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a secure password"
                    value={formData.password}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </FadeIn>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : step < 3
                ? "Continue"
                : "Create Account"}
            </Button>

            {step > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="w-full"
              >
                Back
              </Button>
            )}
          </form>
        </div>
      </div>
    </FadeIn>
  );
};

export default OnboardingForm;
