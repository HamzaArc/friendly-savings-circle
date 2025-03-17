
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import FadeIn from "../ui/FadeIn";
import { useAuth } from "@/contexts/AuthContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OnboardingForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (step === 1) {
      if (!formData.name) {
        setError("Name is required");
        return;
      }
      
      setStep(2);
      return;
    }
    
    if (step === 2) {
      if (!formData.email) {
        setError("Email is required");
        return;
      }
      
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        setError("Please enter a valid email address");
        return;
      }
      
      setStep(3);
      return;
    }
    
    if (step === 3) {
      if (!formData.password) {
        setError("Password is required");
        return;
      }
      
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Sign up with Supabase
      await signUp(formData.email, formData.password, {
        name: formData.name,
      });
      
      toast({
        title: "Account created!",
        description: "Welcome to Tontine, " + formData.name + "!",
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
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

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
