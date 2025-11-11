import { ArrowUp, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Comment {
  id: string;
  author?: string;
  isAnonymous: boolean;
  content: string;
  timestamp: string;
  upvotes: number;
  hasUpvoted?: boolean;
  replies?: Comment[];
  canEdit?: boolean;
}

interface CommentThreadProps {
  comments: Comment[];
  onReply?: (commentId: string, content: string) => void;
  onUpvote?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  depth?: number;
}

function CommentItem({
  comment,
  onReply,
  onUpvote,
  onEdit,
  onDelete,
  depth = 0,
}: {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
  onUpvote?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  depth?: number;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [localUpvoted, setLocalUpvoted] = useState(comment.hasUpvoted || false);
  const [localUpvotes, setLocalUpvotes] = useState(comment.upvotes);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleUpvote = () => {
    setLocalUpvoted(!localUpvoted);
    setLocalUpvotes(localUpvoted ? localUpvotes - 1 : localUpvotes + 1);
    onUpvote?.(comment.id);
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply?.(comment.id, replyContent);
      setReplyContent("");
      setShowReply(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit?.(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete?.(comment.id);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4" data-testid={`card-comment-${comment.id}`}>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 mr-2">
            <Button
              size="icon"
              variant={localUpvoted ? "default" : "ghost"}
              className="h-7 w-7"
              onClick={handleUpvote}
              data-testid="button-upvote-comment"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <span className="text-sm font-medium" data-testid="text-upvote-count">
              {localUpvotes}
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {comment.isAnonymous ? (
                <>
                  <User className="h-3 w-3" />
                  <span>Anonymous</span>
                </>
              ) : (
                <span className="font-medium">{comment.author}</span>
              )}
              <span>•</span>
              <span>{comment.timestamp}</span>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="resize-none text-base"
                  rows={3}
                  data-testid="input-edit-comment"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit} data-testid="button-save-edit">
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                    }}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-base">{comment.content}</p>
            )}

            <div className="flex items-center gap-3 pt-1">
              {depth < 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReply(!showReply)}
                  data-testid="button-reply"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}
              {comment.canEdit && !isEditing && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    data-testid="button-edit"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleDelete}
                    data-testid="button-delete"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {showReply && (
        <div className="pl-12 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="resize-none"
            rows={3}
            data-testid="input-reply"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReply} data-testid="button-submit-reply">
              Reply
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowReply(false);
                setReplyContent("");
              }}
              data-testid="button-cancel-reply"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-12 space-y-4 border-l-2 border-border ml-6">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onUpvote={onUpvote}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({
  comments,
  onReply,
  onUpvote,
  onEdit,
  onDelete,
  depth = 0,
}: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onUpvote={onUpvote}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth}
        />
      ))}
    </div>
  );
}
