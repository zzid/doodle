import { CalendarColors } from "../types";

/**
 * Calendar theme colors for light mode
 */
export const lightTheme: CalendarColors = {
    white: "#ffffff",
    pageText: "#1f2937",
    infoSection: "#6b7280",
    // Gold/yellow for effects
    effectTitle: "#ffda44",
    effectBoxBorderAchieved: "#ffc600",
    effectBoxBorderNormal: "#e5cb73",
    effectBoxBgHighlight: "#fffbe5",
    effectBoxBgAchieved: "#fffbe7",
    effectBoxBgNormal: "#faf7e3",
    effectBoxText: "#be9700",
    effectBoxBoxShadowHighlight:
        "0 0 8px 1px #fffbe3, 0 3px 14px 0 #ffe47ea1",
    effectBoxOutline: "#ffd326",
    effectBoxHoverShadow: "0 0 10px 2px #fffbe386",
    // Effect Count
    effectCount: "#f7bb36",
    effectCountShadow: "0 0 3px #fff5bbad",
    // Calendar
    calendarMonthTitle: "#1f2937",
    dayWeekBorderBottom: "#d1d5db",
    cellDayNum: "#111827",
    // Weekdays
    weekdayThu: "#2074c5", // idx 0=목
    weekdayWed: "#b7a600", // idx 6=수
    weekdayOther: "#6b7280",
    // Calendar Cell
    cellBorderEffect: "#ffb75b",
    cellBorderNormal: "#d1d5db",
    cellBgToday: "#fffac1",
    cellBgEffect: "#fcf5ec",
    cellBgCountUp: "#f7fafd",
    cellBgNormal: "#ffffff",
    cellShadowToday: "0 0 0 2px #ffe58e8a",
    cellShadowEffect: "0 0 0 2px #ffebcb80",
    cellShadowNone: "none",
    cellHoverBgToday: "#fff5be",
    cellHoverBgEffect: "#fff3e2",
    cellHoverBgNormal: "#e9f2fd",
    cellHoverShadow: "0 0 0 3px #ffe8b733",
    // Badge
    badgeEmphasize: "#D7263D",
    badgeCountUp: "#176fcc",
    badgeNormal: "#9ca3af",
    badgeBgEmphasize: "#ffeaea",
    badgeBgCountUp: "#dbeafe",
    badgeBgNormal: "#f3f4f6",
    // highlight
    cellHighlight: "#ffe57f",
    cellHighlightShadow: "0 0 0 7px #ffdf7f77",
};

/**
 * Calendar theme colors for dark mode
 */
export const darkTheme: CalendarColors = {
    white: "#ffffff",
    pageText: "#f1f5f9",
    infoSection: "#94a3b8",
    // Gold/yellow for effects (adjusted for dark mode)
    effectTitle: "#fbbf24",
    effectBoxBorderAchieved: "#f59e0b",
    effectBoxBorderNormal: "#d97706",
    effectBoxBgHighlight: "#451a03",
    effectBoxBgAchieved: "#78350f",
    effectBoxBgNormal: "#92400e",
    effectBoxText: "#fcd34d",
    effectBoxBoxShadowHighlight:
        "0 0 8px 1px #78350f, 0 3px 14px 0 #f59e0ba1",
    effectBoxOutline: "#fbbf24",
    effectBoxHoverShadow: "0 0 10px 2px #78350f86",
    // Effect Count
    effectCount: "#fbbf24",
    effectCountShadow: "0 0 3px #f59e0bad",
    // Calendar
    calendarMonthTitle: "#f1f5f9",
    dayWeekBorderBottom: "#475569",
    cellDayNum: "#f1f5f9",
    // Weekdays
    weekdayThu: "#60a5fa", // idx 0=목 (lighter blue for dark mode)
    weekdayWed: "#fbbf24", // idx 6=수 (yellow for dark mode)
    weekdayOther: "#cbd5e1",
    // Calendar Cell
    cellBorderEffect: "#f59e0b",
    cellBorderNormal: "#475569",
    cellBgToday: "#78350f",
    cellBgEffect: "#451a03",
    cellBgCountUp: "#1e293b",
    cellBgNormal: "#0f172a",
    cellShadowToday: "0 0 0 2px #f59e0b8a",
    cellShadowEffect: "0 0 0 2px #f59e0b80",
    cellShadowNone: "none",
    cellHoverBgToday: "#92400e",
    cellHoverBgEffect: "#78350f",
    cellHoverBgNormal: "#1e293b",
    cellHoverShadow: "0 0 0 3px #f59e0b33",
    // Badge
    badgeEmphasize: "#ef4444",
    badgeCountUp: "#60a5fa",
    badgeNormal: "#64748b",
    badgeBgEmphasize: "#7f1d1d",
    badgeBgCountUp: "#1e3a8a",
    badgeBgNormal: "#1e293b",
    // highlight
    cellHighlight: "#fbbf24",
    cellHighlightShadow: "0 0 0 7px #f59e0b77",
};

/**
 * Get calendar colors based on theme mode
 */
export function getCalendarColors(isDark: boolean): CalendarColors {
    return isDark ? darkTheme : lightTheme;
}

/**
 * Default calendar colors (light mode)
 * @deprecated Use getCalendarColors with useDarkMode hook instead
 */
export const colors = lightTheme;

