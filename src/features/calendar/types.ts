import { Dayjs } from "dayjs";
import React from "react";

export interface EffectData {
    count: number;
    effect: string;
}

// Generic date event interface
export interface DateEvent<T = any> {
    date: Dayjs;
    data: T;
    id?: string; // Optional unique identifier for the event
}

// Generic calendar configuration
export interface CalendarConfig {
    eventStartDate: Dayjs;
    eventEndDate: Dayjs;
    weekStartDay?: number; // 0 = Sunday, 4 = Thursday, etc.
    countUpDaysPerWeek?: number; // default 5
    weekdays?: string[]; // default ["일", "월", "화", "수", "목", "금", "토"]
    effectData?: EffectData[]; // Optional - only needed if using effects bar
    anchorPrefix?: string; // default "effect-day-"
    // Custom function to get events for a specific date
    getEventsForDate?: (date: Dayjs) => any[];
    // Custom function to check if a date is special/effect day
    isSpecialDate?: (date: Dayjs, events: any[]) => boolean;
    // Custom function to get count for a date (for legacy support)
    getCountForDate?: (date: Dayjs) => number;
}

export interface CalendarColors {
    white: string;
    pageText: string;
    infoSection: string;
    effectTitle: string;
    effectBoxBorderAchieved: string;
    effectBoxBorderNormal: string;
    effectBoxBgHighlight: string;
    effectBoxBgAchieved: string;
    effectBoxBgNormal: string;
    effectBoxText: string;
    effectBoxBoxShadowHighlight: string;
    effectBoxOutline: string;
    effectBoxHoverShadow: string;
    effectCount: string;
    effectCountShadow: string;
    calendarMonthTitle: string;
    dayWeekBorderBottom: string;
    cellDayNum: string;
    weekdayThu: string;
    weekdayWed: string;
    weekdayOther: string;
    cellBorderEffect: string;
    cellBorderNormal: string;
    cellBgToday: string;
    cellBgEffect: string;
    cellBgCountUp: string;
    cellBgNormal: string;
    cellShadowToday: string;
    cellShadowEffect: string;
    cellShadowNone: string;
    cellHoverBgToday: string;
    cellHoverBgEffect: string;
    cellHoverBgNormal: string;
    cellHoverShadow: string;
    badgeEmphasize: string;
    badgeCountUp: string;
    badgeNormal: string;
    badgeBgEmphasize: string;
    badgeBgCountUp: string;
    badgeBgNormal: string;
    cellHighlight: string;
    cellHighlightShadow: string;
}

// Custom cell renderer function type
export type CellRenderer = (props: {
    date: Dayjs;
    today: Dayjs;
    isToday: boolean;
    isSpecial: boolean;
    isHighlighted: boolean;
    events: any[];
    count?: number;
}) => React.ReactNode;

export interface CalendarProps {
    config: CalendarConfig;
    colors?: CalendarColors; // Optional - will auto-detect theme if not provided
    today?: Dayjs;
    infoTexts?: string[];
    pageTitle?: string;
    effectsTitle?: string;
    // Custom cell renderer - if provided, overrides default rendering
    renderCell?: CellRenderer;
    // Show effects bar (default: true if effectData is provided)
    showEffectsBar?: boolean;
    // Custom effects bar renderer
    renderEffectsBar?: (props: {
        today: Dayjs;
        todayCount?: number;
        effectDays: Array<{ count: number; effect: string; day: Dayjs | null }>;
    }) => React.ReactNode;
}

export interface CalendarHighlightContextType {
    highlightDate: string | null;
    showHighlight: boolean;
    setHighlightDate: (date: string | null, showHighlight?: boolean) => void;
}

