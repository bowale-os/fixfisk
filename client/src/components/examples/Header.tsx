import { Header } from '../Header';

export default function HeaderExample() {
  return (
    <div>
      <Header
        unreadCount={3}
        userEmail="sarah.johnson@my.fisk.edu"
        isAdmin={false}
        onNotificationClick={() => console.log('Open notifications')}
        onCreatePost={() => console.log('Create post')}
        onLogout={() => console.log('Logout')}
      />
      <div className="p-8">
        <p className="text-muted-foreground">Page content would go here...</p>
      </div>
    </div>
  );
}
