import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import PostDetailPage from "@/pages/post-detail";
import AuthCallback from "@/pages/auth-callback";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { NotificationPanel } from "@/components/NotificationPanel";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/hooks/useAuth";
import type { Post } from "@shared/schema";

type Notification = {
  id: string;
  type: "status_update" | "comment" | "milestone";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  postTitle?: string;
};

function FeedPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("trending");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSGAOnly, setShowSGAOnly] = useState(false);
  
  const statusFilter = showSGAOnly ? "reviewing" : undefined;
  
  const { data: posts = [], refetch: refetchPosts } = useQuery<(Post & { authorEmail?: string })[]>({
    queryKey: ["/api/posts", { sortBy, tags: selectedTags, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("sortBy", sortBy);
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => params.append("tags", tag));
      }
      if (statusFilter) {
        params.set("status", statusFilter);
      }
      const response = await fetch(`/api/posts?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  const createPostMutation = useMutation({
  mutationFn: async (data: {
    title: string;
    description: string;
    tags: string[];
    isAnonymous: boolean;
    image?: File;
  }) => {
    const formData = new FormData();
    
    // Append text fields
    formData.append('title', data.title);
    formData.append('content', data.description);
    formData.append('tags', JSON.stringify(data.tags));
    formData.append('isAnonymous', data.isAnonymous.toString());
    
    // Append the file if it exists
    if (data.image) {
      formData.append('image', data.image);
    }

    // Debug: Log form data before sending
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    // Make the request with FormData
    const response = await fetch('/api/posts', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Important for authentication cookies
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create post');
    }
    
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === "/api/posts"
    });
    toast({
      title: "Success",
      description: "Your post has been submitted!",
    });
  },
  onError: (error: Error) => {
    toast({
      title: "Error",
      description: error.message || "Failed to create post. Please try again.",
      variant: "destructive",
    });
  },
});

  const voteMutation = useMutation({
    mutationFn: async ({ postId, isUpvoted }: { postId: string; isUpvoted: boolean }) => {
      if (isUpvoted) {
        return apiRequest("DELETE", `/api/posts/${postId}/vote`);
      } else {
        return apiRequest("POST", `/api/posts/${postId}/vote`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "/api/posts"
      });
    },
  });


  const markAllReadMutation = useMutation({
    mutationFn: async () => apiRequest("POST", "/api/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) =>
      apiRequest("PATCH", `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header
          unreadCount={unreadCount}
          userEmail={user?.email || ""}
          isAdmin={user?.is_sga_admin || false}
          onNotificationClick={() => setNotificationsOpen(true)}
          onCreatePost={() => setCreatePostOpen(true)}
          onLogout={logout}
        />
        <FilterBar
          onSortChange={setSortBy}
          onTagsChange={setSelectedTags}
          onStatusFilterChange={setShowSGAOnly}
        />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6 md:space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="glass rounded-3xl p-12 max-w-md mx-auto">
                <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-4xl">💡</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">No suggestions yet</h3>
                <p className="text-lg text-muted-foreground">Be the first to share a suggestion and help improve campus life!</p>
              </div>
            </div>
          ) : (
            posts.map((post, index) => (
              <div key={post.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <PostCard
                  id={post.id}
                  title={post.title}
                  description={post.content}
                  author={post.isAnonymous ? undefined : post.authorEmail}
                  isAnonymous={post.isAnonymous}
                  timestamp={new Date(post.createdAt).toLocaleDateString()}
                  tags={post.tags}
                  upvotes={post.upvoteCount}
                  commentCount={post.commentCount}
                  status={post.status as any} 
                  hasUpvoted={(post as any).hasUpvoted || false}
                  isAdmin={user?.is_sga_admin || false}
                  onClick={() => navigate(`/posts/${post.id}`)}
                  imageUrl={post.imageUrl || undefined}
                  onUpvote={() => voteMutation.mutate({ postId: post.id, isUpvoted: (post as any).hasUpvoted || false })}
                />
              </div>
            ))
          )}
        </main>
      </div>
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onSubmit={(data) => createPostMutation.mutate(data)}
      />
      {notificationsOpen && (
        <NotificationPanel
          notifications={notifications.map(n => ({
            ...n,
            timestamp: new Date(n.timestamp).toLocaleString(),
          }))}
          onClose={() => setNotificationsOpen(false)}
          onMarkAllRead={() => markAllReadMutation.mutate()}
          onNotificationClick={(id) => markReadMutation.mutate(id)}
        />
      )}
    </div>
  );
}

function Router() {
  const { user, isLoading, sendMagicLink } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Handle authentication callback - check both query params and hash fragments
  useEffect(() => {
    async function handleAuth() {
      // Check for hash fragments (Supabase magic link tokens)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
        
        if (access_token) {
          try {
            // Send tokens to backend for verification
            await apiRequest('POST', '/api/auth/verify', {
              access_token,
              refresh_token,
            });
            
            // Clear hash and show success
            window.history.replaceState({}, '', '/');
            await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
            const me = await queryClient.fetchQuery<{ id: string } | null>({
              queryKey: ["/api/auth/me"],
            });

            if (me) {
              toast({ title: "Welcome!", description: "You've successfully logged in." });
              navigate('/');
            } else {
              toast({
                title: "Error",
                description: "Login verification failed. Please try again.",
                variant: "destructive",
              });
              navigate('/');
            }
            return;
          } catch (error) {
            console.error('Auth verification error:', error);
            window.history.replaceState({}, '', '/');
            toast({
              title: "Error",
              description: "Failed to verify magic link. Please try again.",
              variant: "destructive",
            });
            navigate('/');
            return;
          }
        }
      }
      
      // Check for query params (success/error redirects)
      const params = new URLSearchParams(window.location.search);
      const authStatus = params.get('auth');
      
      if (authStatus === 'success') {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        toast({
          title: "Welcome!",
          description: "You've successfully logged in.",
        });
        window.history.replaceState({}, '', '/');
        navigate('/');
      } else if (authStatus === 'error') {
        toast({
          title: "Error",
          description: "Failed to verify magic link. Please try again.",
          variant: "destructive",
        });
        window.history.replaceState({}, '', '/');
        navigate('/');
      }
    }
    
    handleAuth();
  }, [toast, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/">
        {user ? (
          <FeedPage />
        ) : (
          <AuthPage
            onSendMagicLink={async (email) => {
              try {
                await sendMagicLink(email);
              } catch (error: any) {
                throw new Error(error.message || "Failed to send magic link");
              }
            }}
          />
        )}
      </Route>
      <Route path="/posts/:id">
        {user ? <PostDetailPage /> : <AuthPage onSendMagicLink={sendMagicLink} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
