import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import PostDetailPage from "@/pages/post-detail";
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
      let imageUrl = undefined;
      
      // Convert image to base64 if provided
      if (data.image) {
        const imageFile = data.image;
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        imageUrl = base64;
      }
      
      return apiRequest("POST", "/api/posts", {
        title: data.title,
        content: data.description,
        tags: data.tags,
        isAnonymous: data.isAnonymous,
        imageUrl,
      });
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
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

  const mockPosts = [
    {
      id: "1",
      title: "Broken AC in Johnson Hall needs immediate attention",
      description: "The air conditioning in Johnson Hall has been broken for over a week. It's extremely uncomfortable for students living there, especially during these hot days. Multiple residents have complained to the RA but nothing has been done yet.",
      author: "Sarah Johnson",
      isAnonymous: false,
      timestamp: "2 hours ago",
      tags: ["Housing", "Facilities"],
      upvotes: 47,
      commentCount: 12,
      hasUpvoted: false,
    },
    {
      id: "2",
      title: "Campus WiFi constantly disconnects in library",
      description: "The WiFi in the library keeps disconnecting every 10-15 minutes. This makes it impossible to complete online assignments or attend virtual meetings. This has been happening for weeks now.",
      isAnonymous: true,
      timestamp: "5 hours ago",
      tags: ["Technology", "Academics"],
      upvotes: 89,
      commentCount: 34,
      status: "in_progress" as const,
      hasUpvoted: true,
    },
    {
      id: "3",
      title: "Need more vegetarian options in dining hall",
      description: "There are very few vegetarian options available in the main dining hall. Many students have dietary restrictions that aren't being accommodated. We need more variety and healthier choices.",
      author: "Michael Davis",
      isAnonymous: false,
      timestamp: "1 day ago",
      tags: ["Dining"],
      upvotes: 156,
      commentCount: 45,
      status: "reviewing" as const,
    },
    {
      id: "4",
      title: "Better lighting needed in parking lots",
      description: "The parking lots are very poorly lit at night, which creates safety concerns. More lighting would make students feel safer walking to their cars after evening classes and events.",
      isAnonymous: true,
      timestamp: "2 days ago",
      tags: ["Campus Safety", "Facilities"],
      upvotes: 203,
      commentCount: 67,
      status: "completed" as const,
    },
    {
      id: "5",
      title: "Extended library hours during finals week",
      description: "The library should stay open 24 hours during finals week like other universities do. Students need a quiet place to study late at night, especially those who live in noisy dorms.",
      author: "Jessica Williams",
      isAnonymous: false,
      timestamp: "3 days ago",
      tags: ["Academics", "Facilities"],
      upvotes: 234,
      commentCount: 89,
    },
  ];

  const mockNotifications = [
    {
      id: "1",
      type: "status_update" as const,
      title: "Status Updated",
      message: "SGA marked your suggestion as 'In Progress'",
      timestamp: "2 hours ago",
      isRead: false,
      postTitle: "Broken AC in Johnson Hall",
    },
    {
      id: "2",
      type: "comment" as const,
      title: "New Comment",
      message: "Emily Carter commented on your post",
      timestamp: "5 hours ago",
      isRead: false,
      postTitle: "Campus WiFi constantly disconnects",
    },
    {
      id: "3",
      type: "milestone" as const,
      title: "Milestone Reached",
      message: "Your post reached 100 upvotes!",
      timestamp: "1 day ago",
      isRead: true,
      postTitle: "Need more vegetarian options",
    },
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-accent/20">
      <Header
        unreadCount={unreadCount}
        userEmail={user?.email || ""}
        isAdmin={user?.isSGAAdmin || false}
        onNotificationClick={() => setNotificationsOpen(true)}
        onCreatePost={() => setCreatePostOpen(true)}
        onLogout={logout}
      />
      <FilterBar
        onSortChange={setSortBy}
        onTagsChange={setSelectedTags}
        onStatusFilterChange={setShowSGAOnly}
      />
      <main className="max-w-5xl mx-auto px-6 md:px-8 py-12 space-y-8 md:space-y-12">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No posts yet. Be the first to share a suggestion!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
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
              isAdmin={user?.isSGAAdmin || false}
              onClick={() => navigate(`/posts/${post.id}`)}
              imageUrl={post.imageUrl || undefined}
              onUpvote={() => voteMutation.mutate({ postId: post.id, isUpvoted: (post as any).hasUpvoted || false })}
            />
          ))
        )}
      </main>
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onSubmit={(data) => createPostMutation.mutate(data)}
      />
      {notificationsOpen && (
        <NotificationPanel
          notifications={notifications.map(n => ({
            ...n,
            timestamp: new Date(n.createdAt as any).toLocaleString(),
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
  const [location, setLocation] = useState(window.location.pathname);

  // Handle authentication callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    
    if (authStatus === 'success') {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome!",
        description: "You've successfully logged in.",
      });
      window.history.replaceState({}, '', '/');
      setLocation('/');
    } else if (authStatus === 'error') {
      toast({
        title: "Error",
        description: "Failed to verify magic link. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/');
      setLocation('/');
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Switch>
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
