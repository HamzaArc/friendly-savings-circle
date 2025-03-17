
import { format, isToday, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarEvent } from "@/types/calendar";
import { CreditCard, Users, Award } from "lucide-react";

interface CalendarEventListProps {
  date: Date;
  events: CalendarEvent[];
}

const CalendarEventList = ({ date, events }: CalendarEventListProps) => {
  const formatEventDate = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    }
    return format(date, "EEEE, MMMM d, yyyy");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formatEventDate(date)}</CardTitle>
        <CardDescription>
          {events.length} event{events.length !== 1 ? 's' : ''} scheduled
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No events scheduled for this day</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
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
  );
};

export default CalendarEventList;
