import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  unreadCount?: number;
  userEmail?: string;
  isAdmin?: boolean;
  onNotificationClick?: () => void;
  onCreatePost?: () => void;
  onLogout?: () => void;
}

export function Header({
  unreadCount = 0,
  userEmail = "student@my.fisk.edu",
  isAdmin = false,
  onNotificationClick,
  onCreatePost,
  onLogout,
}: HeaderProps) {
  const handleLogout = () => {
    console.log("Logging out");
    onLogout?.();
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-background/80 border-b border-white/20 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-20 md:h-24 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-xl md:text-2xl">F</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Fisk Feedback</h1>
              {isAdmin && (
                <p className="text-xs text-muted-foreground font-medium">SGA Admin</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onCreatePost}
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            data-testid="button-create-post"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">New Suggestion</span>
            <span className="sm:hidden">New</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full h-11 w-11"
            onClick={onNotificationClick}
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full p-0 px-1.5 flex items-center justify-center text-xs bg-secondary text-secondary-foreground border-2 border-background"
                data-testid="badge-notification-count"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-11 w-11" data-testid="button-user-menu">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                    {getInitials(userEmail)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 backdrop-blur-lg bg-white/90 dark:bg-background/90">
              <div className="px-3 py-3">
                <p className="text-sm font-semibold">{userEmail}</p>
                {isAdmin && (
                  <Badge variant="secondary" className="mt-1.5 rounded-full">
                    SGA Admin
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2" data-testid="menu-my-posts">
                My Posts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="py-2" data-testid="menu-logout">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
