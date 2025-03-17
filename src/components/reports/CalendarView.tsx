
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Users, Award } from "lucide-react";
import { format, isToday, isSameDay } from "date-fns";

interface CalendarEvent {
  date: Date;
  type: "payment" | "payout" | "meeting";
  groupId: string;
  groupName: string;
  cycleNumber?: number;
  amount?: number;
}

const CalendarView = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [groups, setGroups] = useState<any[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  
  useEffect(() => {
    // Load groups from localStorage
    const storedGroups = JSON.parse(localStorage.getItem("groups") || "[]");
    setGroups(storedGroups);
    
    // Generate calendar events
    const calendarEvents: CalendarEvent[] = [];
    
    storedGroups.forEach((group: any) => {
      if (group.cycles) {
        group.cycles.forEach((cycle: any) => {
          if (cycle.status === "active" || cycle.status === "upcoming") {
            // Add payment date
            const paymentDate = new Date(cycle.endDate);
            calendarEvents.push({
              date: paymentDate,
              type: "payment",
              groupId: group.id,
              groupName: group.name,
              cycleNumber: cycle.number,
              amount: group.contributionAmount
            });
            
            // Add payout date if it exists
            if (cycle.payoutDate) {
              const payoutDate = new Date(cycle.payoutDate);
              calendarEvents.push({
                date: payoutDate,
                type: "payout",
                groupId: group.id,
                groupName: group.name,
                cycleNumber: cycle.number,
                amount: group.contributionAmount * group.members
              });
            }
          }
        });
      }
    });
    
    // Add a few sample events if none exist
    if (calendarEvents.length === 0) {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      calendarEvents.push({
        date: today,
        type: "payment",
        groupId: "sample1",
        groupName: "Sample Group 1",
        cycleNumber: 1,
        amount: 100
      });
      
      calendarEvents.push({
        date: nextWeek,
        type: "payout",
        groupId: "sample1",
        groupName: "Sample Group 1",
        cycleNumber: 1,
        amount: 500
      });
    }
    
    setEvents(calendarEvents);
    updateSelectedDayEvents(date, calendarEvents, selectedGroup);
  }, []);
  
  useEffect(() => {
    updateSelectedDayEvents(date, events, selectedGroup);
  }, [date, selectedGroup]);
  
  const updateSelectedDayEvents = (
    selectedDate: Date, 
    eventsList: CalendarEvent[], 
    groupFilter: string
  ) => {
    const filteredEvents = eventsList.filter((event) => {
      const sameDay = isSameDay(event.date, selectedDate);
      return groupFilter === "all" 
        ? sameDay 
        : sameDay && event.groupId === groupFilter;
    });
    
    setSelectedDayEvents(filteredEvents);
  };
  
  const formatEventDate = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    }
    return format(date, "EEEE, MMMM d, yyyy");
  };
  
  // Function to customize the appearance of dates with events
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

  // Define dayStyles function separately to properly type it
  const getDayStyle = (date: Date) => {
    const className = getDayClassName(date);
    if (className.includes("bg-amber-100")) {
      return { 
        backgroundColor: "#fef3c7",
        color: "#92400e",
        fontWeight: "500"
      };
    } else if (className.includes("bg-blue-100")) {
      return { 
        backgroundColor: "#dbeafe",
        color: "#1e3a8a",
        fontWeight: "500"
      };
    } else if (className.includes("bg-green-100")) {
      return { 
        backgroundColor: "#dcfce7",
        color: "#14532d",
        fontWeight: "500"
      };
    }
    return {};
  };

  return (
    <div className="grid md:grid-cols-[350px_1fr] gap-6">
      <div>
        <div className="mb-4">
          <Select 
            value={selectedGroup} 
            onValueChange={setSelectedGroup}
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
          onSelect={(newDate) => newDate && setDate(newDate)}
          className="rounded-lg border shadow p-3 pointer-events-auto"
          modifiersClassNames={{
            today: "bg-primary/10",
          }}
          modifiers={{
            paymentDay: events
              .filter(event => event.type === "payment" && (selectedGroup === "all" || event.groupId === selectedGroup))
              .map(event => event.date),
            payoutDay: events
              .filter(event => event.type === "payout" && (selectedGroup === "all" || event.groupId === selectedGroup))
              .map(event => event.date),
          }}
          classNames={{
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            day: "custom-day-class", 
          }}
          styles={{
            day: (date) => getDayStyle(date)
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
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{formatEventDate(date)}</CardTitle>
            <CardDescription>
              {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((event, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={event.type === "payment" ? "default" : "outline"}
                        className={event.type === "payment" 
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-100" 
                          : "bg-green-100 text-green-800 hover:bg-green-100"}
                      >
                        {event.type === "payment" ? (
                          <>
                            <CreditCard className="w-3 h-3 mr-1" />
                            Payment Due
                          </>
                        ) : (
                          <>
                            <Award className="w-3 h-3 mr-1" />
                            Payout Day
                          </>
                        )}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Cycle {event.cycleNumber}
                      </span>
                    </div>
                    <h3 className="font-medium mb-1">{event.groupName}</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        {event.type === "payment" ? "Your contribution" : "Group payout"}
                      </div>
                      <span className="font-medium">
                        ${event.amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
