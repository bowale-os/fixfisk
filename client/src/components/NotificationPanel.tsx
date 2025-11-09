import { X, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
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
  milestone: AlertCircle,
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
      className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl z-50 flex flex-col"
      data-testid="panel-notifications"
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="default" className="rounded-full" data-testid="badge-unread-count">
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          data-testid="button-close-panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {unreadCount > 0 && (
        <div className="px-4 py-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            data-testid="button-mark-all-read"
          >
            Mark all as read
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up! We'll notify you when there's activity on
              your posts.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer hover-elevate transition-colors ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification.id)}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      {notification.postTitle && (
                        <p className="text-xs text-primary font-medium">
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
