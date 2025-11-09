import { Bell, Plus, User } from "lucide-react";
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
import { useState } from "react";

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
    <header className="sticky top-0 z-20 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Fisk Feedback</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onCreatePost}
            data-testid="button-create-post"
          >
            <Plus className="h-4 w-4 mr-2" />
            Submit Suggestion
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onNotificationClick}
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                data-testid="badge-notification-count"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(userEmail)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userEmail}</p>
                {isAdmin && (
                  <p className="text-xs text-muted-foreground">SGA Admin</p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="menu-my-posts">
                <User className="h-4 w-4 mr-2" />
                My Posts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
