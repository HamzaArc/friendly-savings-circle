
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { isSameDay } from "date-fns";
import { CalendarEvent } from "@/types/calendar";

interface EventCalendarProps {
  date: Date;
  events: CalendarEvent[];
  selectedGroup: string;
  groups: any[];
  onDateChange: (date: Date) => void;
  onGroupChange: (groupId: string) => void;
}

const EventCalendar = ({ 
  date, 
  events, 
  selectedGroup, 
  groups, 
  onDateChange, 
  onGroupChange 
}: EventCalendarProps) => {
  
  const getDayClassName = (day: Date) => {
    const hasPayment = events.some(event => 
      isSameDay(day, event.date) && 
      event.type === "payment" && 
      (selectedGroup === "all" || event.groupId === selectedGroup)
    );
    
    const hasPayout = events.some(event => 
      isSameDay(day, event.date) && 
      event.type === "payout" && 
      (selectedGroup === "all" || event.groupId === selectedGroup)
    );
    
    if (hasPayment && hasPayout) {
      return "bg-amber-100 text-amber-900 font-medium";
    } else if (hasPayment) {
      return "bg-blue-100 text-blue-900 font-medium";
    } else if (hasPayout) {
      return "bg-green-100 text-green-900 font-medium";
    }
    
    return "";
  };

  return (
    <div>
      <div className="mb-4">
        <Select 
          value={selectedGroup} 
          onValueChange={onGroupChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Calendar
        mode="single"
        selected={date}
        onSelect={(newDate) => newDate && onDateChange(newDate)}
        className="rounded-lg border shadow p-3 pointer-events-auto"
        modifiersClassNames={{
          today: "bg-primary/10",
          payment: "bg-blue-100 text-blue-900 font-medium",
          payout: "bg-green-100 text-green-900 font-medium",
          both: "bg-amber-100 text-amber-900 font-medium"
        }}
        modifiers={{
          payment: events
            .filter(event => event.type === "payment" && (selectedGroup === "all" || event.groupId === selectedGroup))
            .map(event => new Date(event.date)),
          payout: events
            .filter(event => event.type === "payout" && (selectedGroup === "all" || event.groupId === selectedGroup))
            .map(event => new Date(event.date)),
          both: events
            .filter(event => {
              const dateStr = event.date.toDateString();
              const hasPayment = events.some(e => 
                e.date.toDateString() === dateStr && 
                e.type === "payment" && 
                (selectedGroup === "all" || e.groupId === selectedGroup)
              );
              const hasPayout = events.some(e => 
                e.date.toDateString() === dateStr && 
                e.type === "payout" && 
                (selectedGroup === "all" || e.groupId === selectedGroup)
              );
              return hasPayment && hasPayout;
            })
            .map(event => new Date(event.date))
        }}
        classNames={{
          day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          day: "custom-day-class", 
        }}
      />
      
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Payment Due</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
          <span>Payout</span>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
