import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PostDetail } from "@/components/PostDetail";
import { format } from "date-fns";
import type { Post, Comment } from "@shared/schema";

type EnrichedPost = Post & {
  authorEmail?: string;
  hasUpvoted: boolean;
};

type EnrichedComment = Comment & {
  authorEmail?: string;
  hasUpvoted: boolean;
};

export default function PostDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch post
  const { data: posts = [], isLoading: postLoading } = useQuery<EnrichedPost[]>({
    queryKey: ["/api/posts", { postId: id }],
    queryFn: async () => {
      const response = await fetch(`/api/posts?sortBy=recent`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  const post = posts.find(p => p.id === id);

  // Fetch comments
  const { data: comments = [] } = useQuery<EnrichedComment[]>({
    queryKey: ["/api/posts", id, "comments"],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${id}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
    enabled: !!id,
  });

  // Vote on post
  const votePostMutation = useMutation({
    mutationFn: async () => {
      if (post?.hasUpvoted) {
        return apiRequest("DELETE", `/api/posts/${id}/vote`);
      } else {
        return apiRequest("POST", `/api/posts/${id}/vote`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "/api/posts"
      });
    },
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; isAnonymous: boolean }) => {
      return apiRequest("POST", `/api/posts/${id}/comments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", id, "comments"],
      });
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "/api/posts" && !query.queryKey.includes("comments")
      });
      toast({
        title: "Success",
        description: "Your comment has been posted!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Vote on comment
  const voteCommentMutation = useMutation({
    mutationFn: async ({ commentId, isUpvoted }: { commentId: string; isUpvoted: boolean }) => {
      if (isUpvoted) {
        return apiRequest("DELETE", `/api/comments/${commentId}/vote`);
      } else {
        return apiRequest("POST", `/api/comments/${commentId}/vote`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", id, "comments"],
      });
    },
  });

  // Update post status (SGA admin only)
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/posts/${id}/status`, { status });
    },
    onSuccess: () => {
      // Invalidate specific post detail query
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", { postId: id }]
      });
      // Invalidate all post list queries
      queryClient.invalidateQueries({
        predicate: (query) => 
          query.queryKey[0] === "/api/posts" && 
          !query.queryKey.some(key => typeof key === "object" && key && "postId" in key)
      });
      toast({
        title: "Status updated",
        description: "Post status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (postLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!post) {
    return <div className="flex items-center justify-center h-screen">Post not found</div>;
  }

  // Transform data to match PostDetail props
  const transformedPost = {
    id: post.id,
    title: post.title,
    description: post.content,
    author: post.authorEmail,
    isAnonymous: post.isAnonymous,
    timestamp: format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a"),
    tags: post.tags || [],
    upvotes: post.upvoteCount,
    status: post.status as "pending" | "reviewing" | "in_progress" | "completed" | "wont_fix" | null,
    hasUpvoted: post.hasUpvoted,
    imageUrl: post.imageUrl || undefined,
  };

  const transformedComments = comments.map(comment => ({
    id: comment.id,
    author: comment.authorEmail,
    isAnonymous: comment.isAnonymous,
    content: comment.content,
    timestamp: format(new Date(comment.createdAt), "MMM d, h:mm a"),
    upvotes: comment.upvoteCount,
    hasUpvoted: comment.hasUpvoted,
    replies: [], // Backend doesn't support nested replies yet
  }));

  return (
    <PostDetail
      post={transformedPost}
      comments={transformedComments}
      isAdmin={user?.isSGAAdmin || false}
      onBack={() => navigate("/")}
      onUpvote={() => votePostMutation.mutate()}
      onCommentUpvote={(commentId) => {
        const comment = comments.find(c => c.id === commentId);
        if (comment) {
          voteCommentMutation.mutate({ commentId, isUpvoted: comment.hasUpvoted });
        }
      }}
      onAddComment={(content, isAnonymous) =>
        addCommentMutation.mutate({ content, isAnonymous })
      }
      onStatusChange={(status) => {
        updateStatusMutation.mutate(status as string);
      }}
    />
  );
}
