import { Dayjs } from "dayjs";

export interface EffectData {
    count: number;
    effect: string;
}

export interface CalendarConfig {
    eventStartDate: Dayjs;
    eventEndDate: Dayjs;
    weekStartDay?: number; // 0 = Sunday, 4 = Thursday, etc.
    countUpDaysPerWeek?: number; // default 5
    weekdays?: string[]; // default ["일", "월", "화", "수", "목", "금", "토"]
    effectData: EffectData[];
    anchorPrefix?: string; // default "effect-day-"
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

export interface CalendarProps {
    config: CalendarConfig;
    colors: CalendarColors;
    today?: Dayjs;
    infoTexts?: string[];
    pageTitle?: string;
    effectsTitle?: string;
}

export interface CalendarHighlightContextType {
    highlightDate: string | null;
    showHighlight: boolean;
    setHighlightDate: (date: string | null, showHighlight?: boolean) => void;
}

