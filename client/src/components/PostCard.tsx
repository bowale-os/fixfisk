import { ArrowUp, MessageSquare, User, CheckCircle2, Clock, XCircle, Eye, type LucideIcon } from "lucide-react";
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

type PostStatus = "pending" | "reviewing" | "in_progress" | "completed" | "not_planned" | "wont_fix" | null;

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

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon; gradient: string }> = {
  pending: {
    label: "Pending",
    color: "bg-muted/50 text-muted-foreground border-muted-foreground/20",
    icon: Clock,
    gradient: "from-muted/20 to-muted/10",
  },
  reviewing: {
    label: "Under Review",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: Eye,
    gradient: "from-blue-500/20 to-blue-600/10",
  },
  in_progress: {
    label: "In Progress",
    color: "bg-primary/10 text-primary border-primary/30",
    icon: Clock,
    gradient: "from-primary/20 to-primary/10",
  },
  completed: {
    label: "Completed",
    color: "bg-secondary/20 text-secondary-foreground border-secondary/40",
    icon: CheckCircle2,
    gradient: "from-secondary/30 to-secondary/10",
  },
  not_planned: {
    label: "Not Planned",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    icon: XCircle,
    gradient: "from-destructive/20 to-destructive/10",
  },
  wont_fix: {
    label: "Won't Fix",
    color: "bg-destructive/10 text-destructive border-destructive/30",
    icon: XCircle,
    gradient: "from-destructive/20 to-destructive/10",
  },
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
    onStatusChange?.(newStatus);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const StatusIcon = status && statusConfig[status] ? statusConfig[status].icon : null;

  return (
    <article
      className="group glass hover-lift rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-2 border-border/30 hover:border-primary/30 animate-slide-up"
      onClick={onClick}
      data-testid={`card-post-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Status Bar - Top accent */}
      {status && statusConfig[status] && (
        <div className={`h-1.5 bg-gradient-to-r ${statusConfig[status].gradient}`} />
      )}

      <div className="flex gap-4 md:gap-6 p-6 md:p-8">
        {/* Upvote Section */}
        <div className="flex flex-col items-center gap-2 w-14 md:w-16 shrink-0">
          <Button
            size="icon"
            variant={localUpvoted ? "default" : "outline"}
            className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl transition-all duration-500 border-2 ${
              localUpvoted 
                ? 'bg-gradient-to-br from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 scale-110 shadow-lg animate-glow border-secondary' 
                : 'hover:border-primary/50 hover:bg-primary/5'
            }`}
            onClick={handleUpvote}
            data-testid="button-upvote"
          >
            <ArrowUp className={`h-6 w-6 transition-transform duration-300 ${
              localUpvoted ? 'scale-110' : 'group-hover:scale-110'
            }`} />
          </Button>
          <span className={`text-lg md:text-xl font-black transition-colors ${
            localUpvoted ? 'text-secondary' : 'text-foreground'
          }`} data-testid="text-upvote-count">
            {localUpvotes}
          </span>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Author & Admin Actions */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              {isAnonymous ? (
                <Avatar className="h-10 w-10 md:h-11 md:w-11 bg-gradient-to-br from-muted to-muted/70 ring-2 ring-border/50">
                  <AvatarFallback className="bg-transparent">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-10 w-10 md:h-11 md:w-11 bg-gradient-to-br from-primary/10 to-secondary/10 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-transparent text-primary font-bold">
                    {getInitials(author || 'U')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-semibold text-sm md:text-base">
                  {isAnonymous ? 'Anonymous Student' : author}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">{timestamp}</p>
              </div>
            </div>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full hover:bg-primary/10 hover:border-primary transition-all" 
                    data-testid="button-status-dropdown"
                  >
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 glass rounded-xl border-2">
                  <DropdownMenuItem onClick={() => handleStatusChange("reviewing")} className="gap-2">
                    <Eye className="h-4 w-4" />
                    Under Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("in_progress")} className="gap-2">
                    <Clock className="h-4 w-4" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("not_planned")} className="gap-2">
                    <XCircle className="h-4 w-4" />
                    Not Planned
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(null)}>
                    Clear Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Title & Status */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-black flex-1 leading-tight tracking-tight group-hover:text-primary transition-colors" data-testid="text-post-title">
                {title}
              </h3>
              {status && statusConfig[status] && StatusIcon && (
                <Badge 
                  className={`${statusConfig[status].color} rounded-full px-3 md:px-4 py-1.5 border-2 flex items-center gap-1.5 font-bold text-xs md:text-sm shadow-sm`} 
                  data-testid="badge-status"
                >
                  <StatusIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {statusConfig[status].label}
                </Badge>
              )}
            </div>
            <p className="text-base md:text-lg leading-relaxed text-foreground/70 line-clamp-3">
              {description}
            </p>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden border-2 border-border/30 group-hover:border-primary/30 transition-all">
              <img
                src={imageUrl}
                alt="Post attachment"
                className="h-48 md:h-56 lg:h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                data-testid="img-post-attachment"
              />
            </div>
          )}

          {/* Tags & Comments */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            <div className="flex gap-2 flex-wrap flex-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  className="rounded-full px-3 md:px-4 py-1 md:py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-primary/15 to-primary/10 text-foreground border border-primary/30 hover:from-primary/25 hover:to-primary/15 hover:border-primary/50 transition-all cursor-pointer"
                  data-testid={`badge-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
              <span className="font-semibold" data-testid="text-comment-count">{commentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
