"use client";

import React from "react";
import { dayjs } from "@/dayjs/dayjs";

import { Calendar, CalendarHighlightProvider } from "@/features/calendar";
import {
    calendarConfig,
    infoTexts,
} from "@/features/calendar/constants";

export default function Page() {
    const today = dayjs();

    return (
        <CalendarHighlightProvider>
            <Calendar
                config={calendarConfig}
                today={today}
                infoTexts={infoTexts}
                // colors prop is optional - will auto-detect theme if not provided
            />
        </CalendarHighlightProvider>
    );
}
