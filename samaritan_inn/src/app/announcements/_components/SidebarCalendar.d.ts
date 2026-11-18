import * as React from "react";

export interface SidebarCalendarItem {
  id: string;
  title: string;
  content?: string;
  date: string; // "YYYY-MM-DD"
}

export interface SidebarCalendarProps {
  announcements?: SidebarCalendarItem[];
  className?: string;
  onDateSelect?: (isoDate: string) => void;
}

declare const SidebarCalendar: React.FC<SidebarCalendarProps>;
export default SidebarCalendar;
