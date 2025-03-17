
import { useState, useEffect } from "react";
import { isSameDay } from "date-fns";
import EventCalendar from "./EventCalendar";
import CalendarEventList from "./CalendarEventList";
import { CalendarEvent } from "@/types/calendar";

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
  
  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };
  
  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
  };

  return (
    <div className="grid md:grid-cols-[350px_1fr] gap-6">
      <EventCalendar 
        date={date}
        events={events}
        selectedGroup={selectedGroup}
        groups={groups}
        onDateChange={handleDateChange}
        onGroupChange={handleGroupChange}
      />
      
      <CalendarEventList 
        date={date}
        events={selectedDayEvents}
      />
    </div>
  );
};

export default CalendarView;
