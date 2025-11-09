import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthPageProps {
  onSendMagicLink?: (email: string) => void;
}

export function AuthPage({ onSendMagicLink }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@my\.fisk\.edu$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please use a valid @my.fisk.edu email address");
      return;
    }

    console.log("Sending magic link to:", email);
    onSendMagicLink?.(email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-background/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-10 md:p-12 text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-xl">
              <CheckCircle2 className="h-10 w-10 text-secondary-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
              <p className="text-base text-muted-foreground">
                We've sent a magic link to <strong className="text-foreground">{email}</strong>
              </p>
            </div>
            <div className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the link in your email to sign in. The link will expire in 15
                minutes.
              </p>
              <Button
                variant="ghost"
                className="w-full rounded-full h-12"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
                data-testid="button-back"
              >
                Use a different email
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-md backdrop-blur-xl bg-white/80 dark:bg-background/80 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-10 md:p-12 text-center space-y-8">
          <div className="space-y-4">
            <div className="mx-auto h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
              <span className="text-primary-foreground font-bold text-3xl md:text-4xl">F</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Welcome to Fisk Feedback
              </h1>
              <p className="text-base text-muted-foreground">
                Share your voice and help improve campus life
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3 text-left">
              <Label htmlFor="email" className="text-base font-semibold">
                Fisk University Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@my.fisk.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="pl-12 h-14 text-base rounded-xl"
                  data-testid="input-email"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive font-medium" data-testid="text-error">
                  {error}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Only @my.fisk.edu email addresses are allowed
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={!email}
              data-testid="button-send-magic-link"
            >
              Send Magic Link
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground pt-4">
            <Sparkles className="h-4 w-4" />
            <p>
              We'll send you a secure login link
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
