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
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/90 dark:bg-background/90 border-b border-white/30 dark:border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-8 md:px-12 h-24 md:h-28 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/25 ring-1 ring-primary/20">
              <span className="text-primary-foreground font-bold text-2xl md:text-3xl">F</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                Fisk Feedback
              </h1>
              {isAdmin && (
                <p className="text-sm text-muted-foreground font-semibold mt-0.5">SGA Admin</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={onCreatePost}
            size="lg"
            className="rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 h-12 text-base font-semibold"
            data-testid="button-create-post"
          >
            <Plus className="h-5 w-5 mr-2.5" />
            <span className="hidden sm:inline">New Suggestion</span>
            <span className="sm:hidden">New</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full h-12 w-12 border-2 backdrop-blur-lg hover:shadow-lg transition-all duration-300"
            onClick={onNotificationClick}
            data-testid="button-notifications"
          >
            <Bell className={`h-5 w-5 transition-all ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
            {unreadCount > 0 && (
              <>
                <Badge
                  className="absolute -top-1.5 -right-1.5 h-6 min-w-[24px] rounded-full px-2 flex items-center justify-center text-xs font-bold bg-secondary text-secondary-foreground border-2 border-background shadow-lg animate-bounce"
                  data-testid="badge-notification-count"
                >
                  {unreadCount}
                </Badge>
                <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-secondary/30 animate-ping" />
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:scale-105 transition-all duration-300" data-testid="button-user-menu">
                <Avatar className="h-11 w-11 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-base">
                    {getInitials(userEmail)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 backdrop-blur-2xl bg-white/95 dark:bg-background/95 border-2 border-white/30 dark:border-white/20 shadow-2xl rounded-2xl p-2 mt-2">
              <div className="px-4 py-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
                <p className="text-base font-bold mb-1">{userEmail}</p>
                {isAdmin && (
                  <Badge variant="secondary" className="mt-2 rounded-full px-3 py-1 font-semibold">
                    SGA Admin
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator className="my-2 bg-border/50" />
              <DropdownMenuItem className="py-3 px-4 rounded-lg text-base font-medium cursor-pointer" data-testid="menu-my-posts">
                My Posts
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-border/50" />
              <DropdownMenuItem onClick={handleLogout} className="py-3 px-4 rounded-lg text-base font-medium cursor-pointer text-destructive" data-testid="menu-logout">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
