import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Extract tokens from hash fragment
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        
        if (!access_token) {
          setError('No access token found in callback');
          // Clear hash and redirect to login with error
          window.history.replaceState(null, '', '/');
          setTimeout(() => navigate('/?auth=error'), 2000);
          return;
        }

        // Send tokens to backend for verification
        const response = await apiRequest('POST', '/api/auth/verify', {
          access_token,
          refresh_token,
        });

        // Clear hash fragments immediately to prevent token leakage
        window.history.replaceState(null, '', '/');
        
        // Redirect to home with success
        navigate('/?auth=success');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Authentication failed');
        // Clear hash and redirect to login with error
        window.history.replaceState(null, '', '/');
        setTimeout(() => navigate('/?auth=error'), 2000);
      }
    }

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      {error ? (
        <div className="text-center">
          <p className="text-destructive text-lg mb-2">{error}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" data-testid="loader-auth" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      )}
    </div>
  );
}
