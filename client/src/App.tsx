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
import { PostDetail } from "@/components/PostDetail";
import { AuthPage } from "@/components/AuthPage";

function FeedPage() {
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const mockPosts = [
    {
      id: "1",
      title: "Broken AC in Johnson Hall needs immediate attention",
      description: "The air conditioning in Johnson Hall has been broken for over a week. It's extremely uncomfortable for students living there, especially during these hot days.",
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
      description: "The WiFi in the library keeps disconnecting every 10-15 minutes. This makes it impossible to complete online assignments or attend virtual meetings.",
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
      description: "There are very few vegetarian options available in the main dining hall. Many students have dietary restrictions that aren't being accommodated.",
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
      description: "The parking lots are very poorly lit at night, which creates safety concerns. More lighting would make students feel safer walking to their cars.",
      isAnonymous: true,
      timestamp: "2 days ago",
      tags: ["Campus Safety", "Facilities"],
      upvotes: 203,
      commentCount: 67,
      status: "completed" as const,
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

  const mockComments = [
    {
      id: "1",
      author: "Emily Carter",
      isAnonymous: false,
      content: "I completely agree! The AC has been unbearable. We've been complaining to the RA for days with no response.",
      timestamp: "1 hour ago",
      upvotes: 23,
      hasUpvoted: true,
      canEdit: true,
      replies: [
        {
          id: "2",
          isAnonymous: true,
          content: "Same here. I can't sleep at night because of the heat.",
          timestamp: "45 minutes ago",
          upvotes: 8,
        },
      ],
    },
  ];

  const selectedPost = mockPosts.find(p => p.id === selectedPostId);

  if (selectedPost) {
    return (
      <>
        <Header
          unreadCount={2}
          userEmail="student@my.fisk.edu"
          isAdmin={true}
          onNotificationClick={() => setNotificationsOpen(true)}
          onCreatePost={() => setCreatePostOpen(true)}
        />
        <PostDetail
          post={selectedPost}
          comments={mockComments}
          isAdmin={true}
          canEdit={false}
          onBack={() => setSelectedPostId(null)}
          onUpvote={() => console.log("Upvoted")}
          onStatusChange={(status) => console.log("Status changed:", status)}
          onAddComment={(content, isAnon) => console.log("Comment added:", content, isAnon)}
        />
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
      </>
    );
  }

  return (
    <>
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
      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {mockPosts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            isAdmin={true}
            onClick={() => setSelectedPostId(post.id)}
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
    </>
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
