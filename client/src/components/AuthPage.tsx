import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2, Sparkles, Shield, Zap, Users } from "lucide-react";
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

    onSendMagicLink?.(email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-primary via-primary/80 to-secondary animate-fade-in">
        <div className="w-full max-w-lg glass rounded-3xl shadow-2xl border-2 overflow-hidden animate-slide-up">
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center shadow-xl animate-float">
              <CheckCircle2 className="h-12 w-12 text-secondary-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight gradient-text">Check your email</h2>
              <p className="text-base md:text-lg text-muted-foreground">
                We've sent a magic link to
              </p>
              <p className="text-lg md:text-xl font-bold text-foreground px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                {email}
              </p>
            </div>
            <div className="pt-4 space-y-4">
              <div className="p-4 rounded-xl bg-accent/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to sign in. The link will expire in <strong className="text-foreground">15 minutes</strong>.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-full h-12 border-2 hover:bg-accent"
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-primary via-primary/80 to-secondary overflow-hidden relative animate-fade-in">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-72 w-72 bg-secondary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-96 w-96 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8 text-white animate-slide-up">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-2xl border border-white/30">
                <span className="text-white font-black text-4xl">F</span>
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tight">FixFisk</h1>
                <p className="text-xl text-white/80 font-semibold">Campus Feedback Platform</p>
              </div>
            </div>
            <p className="text-xl text-white/90 leading-relaxed">
              Your voice matters. Share suggestions, vote on ideas, and help shape the future of Fisk University.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="h-12 w-12 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Community Driven</h3>
                <p className="text-white/80 text-sm">Vote and comment on suggestions from fellow students</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="h-12 w-12 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Real Impact</h3>
                <p className="text-white/80 text-sm">Track progress as SGA reviews and implements changes</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="h-12 w-12 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Safe & Secure</h3>
                <p className="text-white/80 text-sm">Post anonymously or with your name - your choice</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass rounded-3xl shadow-2xl border-2 border-white/30 overflow-hidden">
            <div className="p-8 md:p-10 space-y-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center space-y-3">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
                  <span className="text-primary-foreground font-black text-3xl">F</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight gradient-text">FixFisk</h1>
                  <p className="text-sm text-muted-foreground font-semibold">Campus Feedback Platform</p>
                </div>
              </div>

              <div className="space-y-3 text-center">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-base text-muted-foreground">
                  Sign in with your Fisk University email
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3 text-left">
                  <Label htmlFor="email" className="text-base font-bold">
                    Fisk University Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@my.fisk.edu"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="pl-12 h-14 text-base rounded-2xl border-2 focus:border-primary transition-all"
                      data-testid="input-email"
                    />
                  </div>
                  {error && (
                    <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
                      <p className="text-sm text-destructive font-semibold" data-testid="text-error">
                        {error}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Only @my.fisk.edu email addresses are allowed
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary hover:scale-105"
                  disabled={!email}
                  data-testid="button-send-magic-link"
                >
                  Send Magic Link
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </form>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-secondary" />
                  <p>
                    We'll send you a secure login link
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
