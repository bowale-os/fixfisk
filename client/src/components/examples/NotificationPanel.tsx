import { useState } from 'react';
import { NotificationPanel } from '../NotificationPanel';
import { Button } from '@/components/ui/button';

export default function NotificationPanelExample() {
  const [open, setOpen] = useState(true);

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

  return (
    <div className="relative h-screen">
      <div className="p-4">
        <Button onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Open'} Notification Panel
        </Button>
      </div>
      {open && (
        <NotificationPanel
          notifications={mockNotifications}
          onClose={() => setOpen(false)}
          onMarkAllRead={() => console.log('Mark all read')}
          onNotificationClick={(id) => console.log('Clicked:', id)}
        />
      )}
    </div>
  );
}
