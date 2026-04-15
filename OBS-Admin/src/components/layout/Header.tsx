import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const onLogout = () => {
    localStorage.removeItem("access_ad_token");
    localStorage.removeItem("refresh_ad_token");
    navigate("/login");
  };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 backdrop-blur-md px-4 lg:px-6">
      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl lg:text-2xl font-semibold text-foreground truncate pl-12 lg:pl-0">
          {title}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search - Hidden on mobile */}
        {/* <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div> */}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="relative h-9 w-9 rounded-full overflow-hidden p-[2px] bg-accent text-accent-foreground">
              <img
                src="/favicon.ico"
                alt="Admin"
                className="h-full w-full  rounded-full"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {/* <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@example.com
                </p>
              </div>
            </DropdownMenuLabel> */}
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem className="text-destructive" onClick={onLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
