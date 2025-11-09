import { ArrowUp, MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  reviewing: "bg-muted/80 text-muted-foreground border-muted-foreground/20",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-secondary/20 text-secondary-foreground border-secondary/40",
  not_planned: "bg-destructive/10 text-destructive border-destructive/30",
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div
      className="group backdrop-blur-lg bg-white/60 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
      onClick={onClick}
      data-testid={`card-post-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex gap-6 md:gap-8 p-8 md:p-10">
        <div className="flex flex-col items-center gap-2 w-16 md:w-20 shrink-0">
          <Button
            size="icon"
            variant={localUpvoted ? "default" : "outline"}
            className={`h-12 w-12 rounded-full transition-all duration-300 ${
              localUpvoted ? 'bg-secondary hover:bg-secondary/90 scale-110' : ''
            }`}
            onClick={handleUpvote}
            data-testid="button-upvote"
          >
            <ArrowUp className={`h-6 w-6 ${localUpvoted ? 'animate-bounce' : ''}`} />
          </Button>
          <span className="text-xl font-bold" data-testid="text-upvote-count">
            {localUpvotes}
          </span>
        </div>

        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {isAnonymous ? (
                <Avatar className="h-10 w-10 bg-muted">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(author || 'U')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-medium">
                  {isAnonymous ? 'Anonymous' : author}
                </p>
                <p className="text-sm text-muted-foreground">{timestamp}</p>
              </div>
            </div>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" size="sm" className="rounded-full" data-testid="button-status-dropdown">
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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

          <div className="space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <h3 className="text-2xl md:text-3xl font-bold flex-1 leading-tight tracking-tight" data-testid="text-post-title">
                {title}
              </h3>
              {status && (
                <Badge className={`${statusColors[status]} rounded-full px-4 py-1.5 border`} data-testid="badge-status">
                  {statusLabels[status]}
                </Badge>
              )}
            </div>
            <p className="text-lg leading-relaxed text-foreground/80 line-clamp-4">
              {description}
            </p>
          </div>

          {imageUrl && (
            <div className="rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt="Post attachment"
                className="h-48 md:h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-testid="img-post-attachment"
              />
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap pt-2">
            <div className="flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                  data-testid={`badge-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-base text-muted-foreground ml-auto">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium" data-testid="text-comment-count">{commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
