import React from "react";
import { dayjs } from "@/lib/dayjs";
import { Calendar, CalendarHighlightProvider } from "../features/calendar";
import {
    calendarConfig,
    colors,
    infoTexts,
} from "../features/calendar/constants";

export default function CalendarPage() {
    const today = dayjs();

    return (
        <CalendarHighlightProvider>
            <Calendar
                config={calendarConfig}
                colors={colors}
                today={today}
                infoTexts={infoTexts}
            />
        </CalendarHighlightProvider>
    );
}
