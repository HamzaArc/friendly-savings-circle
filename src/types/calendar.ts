
export interface CalendarEvent {
  date: Date;
  type: "payment" | "payout" | "meeting";
  groupId: string;
  groupName: string;
  cycleNumber?: number;
  amount?: number;
}
