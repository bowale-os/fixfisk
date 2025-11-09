import { X, CheckCircle2, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  type: "status_update" | "comment" | "milestone";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  postTitle?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClose?: () => void;
  onMarkAllRead?: () => void;
  onNotificationClick?: (id: string) => void;
}

const notificationIcons = {
  status_update: CheckCircle2,
  comment: MessageSquare,
  milestone: TrendingUp,
};

const notificationColors = {
  status_update: "bg-primary/10 text-primary",
  comment: "bg-accent text-accent-foreground",
  milestone: "bg-secondary/20 text-secondary-foreground",
};

export function NotificationPanel({
  notifications,
  onClose,
  onMarkAllRead,
  onNotificationClick,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (id: string) => {
    console.log("Notification clicked:", id);
    onNotificationClick?.(id);
  };

  const handleMarkAllRead = () => {
    console.log("Mark all as read");
    onMarkAllRead?.();
  };

  return (
    <div
      className="fixed right-0 top-0 h-full w-full md:w-[480px] backdrop-blur-xl bg-white/95 dark:bg-background/95 border-l border-white/20 dark:border-white/10 shadow-2xl z-50 flex flex-col"
      data-testid="panel-notifications"
    >
      <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/20">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <Badge className="rounded-full bg-secondary text-secondary-foreground" data-testid="badge-unread-count">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full"
          data-testid="button-close-panel"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {unreadCount > 0 && (
        <div className="px-6 md:px-8 py-4 border-b border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="font-medium"
            data-testid="button-mark-all-read"
          >
            Mark all as read
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20">
            <div className="h-24 w-24 rounded-full bg-accent/50 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-3">No notifications</h3>
            <p className="text-base text-muted-foreground max-w-sm">
              You're all caught up! We'll notify you when there's activity on
              your posts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const colorClass = notificationColors[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`p-6 md:p-8 cursor-pointer hover-elevate transition-all ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <div className={`h-12 w-12 rounded-full ${colorClass} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-base font-semibold">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2.5 w-2.5 rounded-full bg-secondary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.postTitle && (
                        <p className="text-sm text-primary font-semibold">
                          {notification.postTitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
