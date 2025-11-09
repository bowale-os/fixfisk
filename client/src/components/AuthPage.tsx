import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Click the link in your email to sign in. The link will expire in 15
              minutes.
            </p>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              data-testid="button-back"
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-2xl">F</span>
          </div>
          <CardTitle className="text-2xl">Welcome to Fisk Feedback</CardTitle>
          <CardDescription>
            Share your voice and help improve campus life
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Fisk University Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@my.fisk.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="pl-9"
                  data-testid="input-email"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive" data-testid="text-error">
                  {error}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Only @my.fisk.edu email addresses are allowed
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!email}
              data-testid="button-send-magic-link"
            >
              Send Magic Link
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              We'll send you a secure login link to access the platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
