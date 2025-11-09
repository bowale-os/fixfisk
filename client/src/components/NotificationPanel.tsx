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
      className="fixed right-0 top-0 h-full w-full md:w-[520px] backdrop-blur-2xl bg-white/97 dark:bg-background/97 border-l-2 border-white/30 dark:border-white/20 shadow-2xl z-50 flex flex-col"
      data-testid="panel-notifications"
    >
      <div className="flex items-center justify-between p-8 md:p-10 border-b-2 border-white/30 dark:border-white/20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          {unreadCount > 0 && (
            <Badge className="rounded-full bg-secondary text-secondary-foreground px-3 py-1.5 text-base font-bold shadow-lg" data-testid="badge-unread-count">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full h-12 w-12 hover:bg-destructive/10"
          data-testid="button-close-panel"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {unreadCount > 0 && (
        <div className="px-8 md:px-10 py-5 border-b border-white/20">
          <Button
            variant="ghost"
            onClick={handleMarkAllRead}
            className="font-semibold text-base h-10 px-4 rounded-xl"
            data-testid="button-mark-all-read"
          >
            Mark all as read
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-10 py-24">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center mb-8 shadow-xl">
              <CheckCircle2 className="h-14 w-14 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">No notifications</h3>
            <p className="text-lg text-muted-foreground max-w-sm leading-relaxed">
              You're all caught up! We'll notify you when there's activity on
              your posts.
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-border/30">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const colorClass = notificationColors[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`p-8 md:p-10 cursor-pointer hover-elevate transition-all ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex gap-5">
                    <div className="shrink-0">
                      <div className={`h-14 w-14 rounded-2xl ${colorClass} flex items-center justify-center shadow-lg ring-2 ring-white/50 dark:ring-white/10`}>
                        <Icon className="h-7 w-7" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-2.5">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-lg font-bold leading-tight">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-3 w-3 rounded-full bg-secondary shrink-0 mt-1.5 shadow-lg animate-pulse" />
                        )}
                      </div>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.postTitle && (
                        <p className="text-base text-primary font-bold mt-3">
                          {notification.postTitle}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground font-medium mt-3">
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
