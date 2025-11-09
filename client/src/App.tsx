import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { Header } from "@/components/Header";
import { FilterBar } from "@/components/FilterBar";
import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import { NotificationPanel } from "@/components/NotificationPanel";
import { AuthPage } from "@/components/AuthPage";

function FeedPage() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-accent/20">
      <Header
        unreadCount={2}
        userEmail="student@my.fisk.edu"
        isAdmin={true}
        onNotificationClick={() => setNotificationsOpen(true)}
        onCreatePost={() => setCreatePostOpen(true)}
      />
      <FilterBar
        onSortChange={(sort) => console.log("Sort:", sort)}
        onTagsChange={(tags) => console.log("Tags:", tags)}
        onStatusFilterChange={(show) => console.log("SGA filter:", show)}
      />
      <main className="max-w-5xl mx-auto px-6 md:px-8 py-12 space-y-8 md:space-y-12">
        {mockPosts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            isAdmin={true}
            onClick={() => console.log("View post:", post.id)}
          />
        ))}
      </main>
      <CreatePostDialog
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
        onSubmit={(post) => console.log("Post created:", post)}
      />
      {notificationsOpen && (
        <NotificationPanel
          notifications={mockNotifications}
          onClose={() => setNotificationsOpen(false)}
          onMarkAllRead={() => console.log("Mark all read")}
          onNotificationClick={(id) => console.log("Notification clicked:", id)}
        />
      )}
    </div>
  );
}

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <Switch>
      <Route path="/">
        {isAuthenticated ? <FeedPage /> : <AuthPage onSendMagicLink={(email) => {
          console.log("Magic link sent to:", email);
          setTimeout(() => setIsAuthenticated(true), 2000);
        }} />}
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
