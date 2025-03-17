
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  CircleDollarSign, 
  Home, 
  LayoutDashboard, 
  Settings, 
  Users 
} from "lucide-react";

interface GroupNavigationProps {
  currentGroupId?: string;
}

const GroupNavigation = ({ currentGroupId }: GroupNavigationProps) => {
  const [groups, setGroups] = useState<any[]>([]);
  const location = useLocation();
  
  useEffect(() => {
    const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    setGroups(storedGroups);
  }, []);
  
  return (
    <NavigationMenu className="max-w-full w-full justify-start mb-6 overflow-x-auto">
      <NavigationMenuList className="space-x-1">
        <NavigationMenuItem>
          <Link to="/dashboard">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <Link to="/reports">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        {currentGroupId && (
          <>
            <NavigationMenuItem>
              <Link to={`/groups/${currentGroupId}`}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(), 
                    location.pathname === `/groups/${currentGroupId}` && "bg-accent/50"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Group Overview
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to={`/groups/${currentGroupId}?tab=cycles`}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(), 
                    location.search.includes("tab=cycles") && "bg-accent/50"
                  )}
                >
                  <CircleDollarSign className="h-4 w-4 mr-2" />
                  Cycles
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to={`/groups/${currentGroupId}?tab=members`}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(), 
                    location.search.includes("tab=members") && "bg-accent/50"
                  )}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to={`/groups/${currentGroupId}?tab=payments`}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(), 
                    location.search.includes("tab=payments") && "bg-accent/50"
                  )}
                >
                  <CircleDollarSign className="h-4 w-4 mr-2" />
                  Payments
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            
            <NavigationMenuItem>
              <Link to={`/groups/${currentGroupId}?tab=settings`}>
                <NavigationMenuLink 
                  className={cn(
                    navigationMenuTriggerStyle(), 
                    location.search.includes("tab=settings") && "bg-accent/50"
                  )}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        )}
        
        {groups.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <Users className="h-4 w-4 mr-2" />
              My Groups
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[300px] gap-1 p-2">
                {groups.map((group) => (
                  <li key={group.id}>
                    <Link 
                      to={`/groups/${group.id}`}
                      className={cn(
                        "flex select-none items-center rounded-md px-3 py-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                        currentGroupId === group.id && "bg-accent/50"
                      )}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {group.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link 
                    to="/create-group"
                    className="flex select-none items-center rounded-md px-3 py-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="text-primary">+ Create New Group</span>
                  </Link>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default GroupNavigation;
