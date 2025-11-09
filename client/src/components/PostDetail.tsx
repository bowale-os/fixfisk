import { ArrowLeft, ArrowUp, User, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentThread } from "./CommentThread";
import { useState } from "react";

type PostStatus = "reviewing" | "in_progress" | "completed" | "not_planned" | null;

interface PostDetailProps {
  post: {
    id: string;
    title: string;
    description: string;
    author?: string;
    isAnonymous: boolean;
    timestamp: string;
    tags: string[];
    upvotes: number;
    status?: PostStatus;
    hasUpvoted?: boolean;
    imageUrl?: string;
  };
  comments: any[];
  isAdmin?: boolean;
  canEdit?: boolean;
  onBack?: () => void;
  onUpvote?: () => void;
  onStatusChange?: (status: PostStatus) => void;
  onAddComment?: (content: string, isAnonymous: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusColors: Record<string, string> = {
  reviewing: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  not_planned: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  reviewing: "Under Review",
  in_progress: "In Progress",
  completed: "Completed",
  not_planned: "Not Planned",
};

export function PostDetail({
  post,
  comments,
  isAdmin = false,
  canEdit = false,
  onBack,
  onUpvote,
  onStatusChange,
  onAddComment,
  onEdit,
  onDelete,
}: PostDetailProps) {
  const [localUpvoted, setLocalUpvoted] = useState(post.hasUpvoted || false);
  const [localUpvotes, setLocalUpvotes] = useState(post.upvotes);
  const [commentContent, setCommentContent] = useState("");
  const [commentAnonymous, setCommentAnonymous] = useState(false);

  const handleUpvote = () => {
    setLocalUpvoted(!localUpvoted);
    setLocalUpvotes(localUpvoted ? localUpvotes - 1 : localUpvotes + 1);
    onUpvote?.();
  };

  const handleStatusChange = (newStatus: PostStatus) => {
    console.log(`Status changed to: ${newStatus}`);
    onStatusChange?.(newStatus);
  };

  const handleAddComment = () => {
    if (commentContent.trim()) {
      console.log("Adding comment:", { content: commentContent, isAnonymous: commentAnonymous });
      onAddComment?.(commentContent, commentAnonymous);
      setCommentContent("");
      setCommentAnonymous(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
          <Button
            variant="ghost"
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </div>

        <div className="p-6">
          <div className="flex gap-6">
            <div className="flex flex-col items-center gap-2 w-20 shrink-0">
              <Button
                size="icon"
                variant={localUpvoted ? "default" : "outline"}
                onClick={handleUpvote}
                data-testid="button-upvote"
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
              <span className="text-lg font-bold" data-testid="text-upvote-count">
                {localUpvotes}
              </span>
              <span className="text-xs text-muted-foreground">votes</span>
            </div>

            <div className="flex-1 min-w-0 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      {post.isAnonymous ? (
                        <>
                          <User className="h-4 w-4" />
                          <span>Anonymous</span>
                        </>
                      ) : (
                        <span>{post.author}</span>
                      )}
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2" data-testid="text-post-title">
                      {post.title}
                    </h1>
                  </div>
                  {post.status && (
                    <Badge className={statusColors[post.status]} data-testid="badge-status">
                      {statusLabels[post.status]}
                    </Badge>
                  )}
                </div>

                <p className="text-base leading-relaxed">{post.description}</p>

                {post.imageUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt="Post attachment"
                      className="max-h-96 w-full object-cover"
                      data-testid="img-post-attachment"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="rounded-full px-3 py-1"
                      data-testid={`badge-tag-${tag.toLowerCase()}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" data-testid="button-status-dropdown">
                          Update Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange("reviewing")}>
                          Under Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                          Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange("not_planned")}>
                          Not Planned
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(null)}>
                          Clear Status
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {canEdit && (
                    <>
                      <Button variant="outline" onClick={onEdit} data-testid="button-edit">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        onClick={onDelete}
                        data-testid="button-delete"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments.length})
                </h2>

                <div className="space-y-3">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                    data-testid="input-comment"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="comment-anonymous"
                        checked={commentAnonymous}
                        onCheckedChange={(checked) =>
                          setCommentAnonymous(checked as boolean)
                        }
                        data-testid="checkbox-anonymous"
                      />
                      <Label
                        htmlFor="comment-anonymous"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Comment anonymously
                      </Label>
                    </div>
                    <Button
                      onClick={handleAddComment}
                      disabled={!commentContent.trim()}
                      data-testid="button-submit-comment"
                    >
                      Comment
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <CommentThread comments={comments} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
