import { ArrowUp, MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

type PostStatus = "reviewing" | "in_progress" | "completed" | "not_planned" | null;

interface PostCardProps {
  id: string;
  title: string;
  description: string;
  author?: string;
  isAnonymous: boolean;
  timestamp: string;
  tags: string[];
  upvotes: number;
  commentCount: number;
  status?: PostStatus;
  hasUpvoted?: boolean;
  isAdmin?: boolean;
  imageUrl?: string;
  onUpvote?: () => void;
  onStatusChange?: (status: PostStatus) => void;
  onClick?: () => void;
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

export function PostCard({
  title,
  description,
  author,
  isAnonymous,
  timestamp,
  tags,
  upvotes,
  commentCount,
  status,
  hasUpvoted = false,
  isAdmin = false,
  imageUrl,
  onUpvote,
  onStatusChange,
  onClick,
}: PostCardProps) {
  const [localUpvoted, setLocalUpvoted] = useState(hasUpvoted);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalUpvoted(!localUpvoted);
    setLocalUpvotes(localUpvoted ? localUpvotes - 1 : localUpvotes + 1);
    onUpvote?.();
  };

  const handleStatusChange = (newStatus: PostStatus) => {
    console.log(`Status changed to: ${newStatus}`);
    onStatusChange?.(newStatus);
  };

  return (
    <Card
      className="p-4 hover-elevate cursor-pointer transition-shadow"
      onClick={onClick}
      data-testid={`card-post-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 w-12 shrink-0">
          <Button
            size="icon"
            variant={localUpvoted ? "default" : "outline"}
            className="h-8 w-8"
            onClick={handleUpvote}
            data-testid="button-upvote"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium" data-testid="text-upvote-count">
            {localUpvotes}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isAnonymous ? (
                <>
                  <User className="h-4 w-4" />
                  <span>Anonymous</span>
                </>
              ) : (
                <span>{author}</span>
              )}
              <span>•</span>
              <span>{timestamp}</span>
            </div>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" data-testid="button-status-dropdown">
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 flex-wrap">
              <h3 className="text-xl font-semibold line-clamp-2 flex-1" data-testid="text-post-title">
                {title}
              </h3>
              {status && (
                <Badge className={statusColors[status]} data-testid="badge-status">
                  {statusLabels[status]}
                </Badge>
              )}
            </div>
            <p className="text-base text-foreground/80 line-clamp-3">
              {description}
            </p>
          </div>

          {imageUrl && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Post attachment"
                className="h-32 w-48 object-cover"
                data-testid="img-post-attachment"
              />
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs"
                  data-testid={`badge-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <MessageSquare className="h-4 w-4" />
              <span data-testid="text-comment-count">{commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
