import { Bell, Plus, Moon, Sun } from "lucide-react";
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
import { useState, useEffect } from "react";

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
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleLogout = () => {
    onLogout?.();
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className={`sticky top-0 z-50 glass transition-all duration-300 ${
      scrolled ? 'shadow-xl border-b-2' : 'shadow-lg border-b'
    } border-border/50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 md:h-24 flex items-center justify-between gap-3 md:gap-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <span className="text-primary-foreground font-black text-xl md:text-2xl">F</span>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl md:text-2xl font-black tracking-tight gradient-text">
              FixFisk
            </h1>
            {isAdmin && (
              <p className="text-xs text-muted-foreground font-semibold mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                SGA Admin
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Create Post Button */}
          <Button
            onClick={onCreatePost}
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-4 md:px-8 h-10 md:h-12 text-sm md:text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            data-testid="button-create-post"
          >
            <Plus className="h-4 w-4 md:h-5 md:w-5 md:mr-2" />
            <span className="hidden md:inline">New Suggestion</span>
          </Button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="hidden sm:flex h-10 w-10 md:h-11 md:w-11 rounded-full hover:bg-accent transition-all duration-300 hover:rotate-180"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-secondary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full h-10 w-10 md:h-11 md:w-11 border-2 hover:shadow-lg transition-all duration-300"
            onClick={onNotificationClick}
            data-testid="button-notifications"
          >
            <Bell className={`h-4 w-4 md:h-5 md:w-5 transition-all ${
              unreadCount > 0 ? 'text-secondary' : ''
            }`} />
            {unreadCount > 0 && (
              <>
                <Badge
                  className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full px-1.5 flex items-center justify-center text-xs font-bold bg-secondary text-secondary-foreground border-2 border-background shadow-lg"
                  data-testid="badge-notification-count"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-secondary/30 animate-ping" />
              </>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-10 w-10 md:h-11 md:w-11 hover:scale-105 transition-all duration-300" 
                data-testid="button-user-menu"
              >
                <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-primary/30 ring-offset-2 ring-offset-background transition-all hover:ring-primary/50">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-sm">
                    {getInitials(userEmail)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 glass shadow-2xl rounded-2xl p-2 mt-2 border-2">
              <div className="px-4 py-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10">
                <p className="text-sm md:text-base font-bold mb-1 truncate">{userEmail}</p>
                {isAdmin && (
                  <Badge className="mt-2 rounded-full px-3 py-1 font-semibold bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground border-0">
                    SGA Admin
                  </Badge>
                )}
              </div>
              <DropdownMenuSeparator className="my-2 bg-border/50" />
              <DropdownMenuItem className="py-3 px-4 rounded-lg text-base font-medium cursor-pointer hover:bg-accent" data-testid="menu-my-posts">
                My Posts
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={toggleDarkMode} 
                className="sm:hidden py-3 px-4 rounded-lg text-base font-medium cursor-pointer hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-border/50" />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="py-3 px-4 rounded-lg text-base font-medium cursor-pointer text-destructive hover:bg-destructive/10" 
                data-testid="menu-logout"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
