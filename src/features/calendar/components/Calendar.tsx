import React, { useMemo, useRef, useEffect } from "react";
import { dayjs, Dayjs } from "@/dayjs/dayjs";

import { motion } from "framer-motion";
import { CalendarProps, CalendarColors } from "../types";
import { createCalendarStyles } from "../styles/calendarStyles";
import {
    formatDate,
    getMonthList,
    getCalendarGridDates,
    getCountForDate,
    getStartOfEventWeek,
    getDayForEffectCount,
} from "../utils/dateUtils";
import {
    getCellAnimation,
    getCellTransition,
    getCellInitial,
    getMonthAnimation,
} from "../utils/motionConfig";
import { useCalendarHighlight } from "./CalendarHighlightProvider";
import { getCalendarColors } from "../constants/theme";
import { useDarkMode } from "../hooks/useDarkMode";
interface CalendarDayCellProps {
    date: Dayjs;
    today: Dayjs;
    config: CalendarProps["config"];
    colors: CalendarColors; // Always defined at this point
    styles: ReturnType<typeof createCalendarStyles>;
    renderCell?: CalendarProps["renderCell"];
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
    date,
    today,
    config,
    colors,
    styles,
    renderCell,
}) => {
    const { CalendarCell, CellDayNum, Badge } = styles;
    const isToday = formatDate(date) === formatDate(today);

    // Get events for this date
    const events = config.getEventsForDate ? config.getEventsForDate(date) : [];

    // Get count (for legacy support)
    const count = config.getCountForDate
        ? config.getCountForDate(date)
        : getCountForDate(date, config);

    // Check if this is a special date
    const isSpecial = config.isSpecialDate
        ? config.isSpecialDate(date, events)
        : config.effectData?.some((eff) => eff.count === count) ?? false;

    const { highlightDate, setHighlightDate, showHighlight } =
        useCalendarHighlight();

    const isHighlighted = highlightDate === formatDate(date) && showHighlight;

    const anchorPrefix = config.anchorPrefix || "effect-day-";
    const effectAnchor = isSpecial
        ? `${anchorPrefix}${count || date.format("YYYY-MM-DD")}`
        : undefined;

    const animation = getCellAnimation(
        isHighlighted,
        isToday,
        isSpecial,
        colors
    );
    const transition = getCellTransition(isHighlighted, isToday, isSpecial);
    const initial = getCellInitial(isToday);

    // Use custom renderer if provided
    if (renderCell) {
        const customContent = renderCell({
            date,
            today,
            isToday,
            isSpecial,
            isHighlighted,
            events,
            count,
        });

        return (
            <CalendarCell
                isToday={isToday}
                isEffectDay={isSpecial}
                isHighlighted={isHighlighted}
                id={effectAnchor}
                initial={initial}
                animate={animation}
                transition={transition}
            >
                {customContent}
            </CalendarCell>
        );
    }

    // Default rendering (legacy support)
    const thisWeekStart = getStartOfEventWeek(date, config.weekStartDay || 4);
    const dayIdxInWeek = date.diff(thisWeekStart, "day");
    const isCountUpDay =
        dayIdxInWeek >= 0 && dayIdxInWeek < (config.countUpDaysPerWeek || 5);

    return (
        <CalendarCell
            isToday={isToday}
            isEffectDay={isSpecial}
            isHighlighted={isHighlighted}
            id={effectAnchor}
            initial={initial}
            animate={animation}
            transition={transition}
        >
            <CellDayNum>{date.date()}</CellDayNum>
            <div>
                <Badge isCountUpDay={isCountUpDay} shouldEmphasize={isSpecial}>
                    {isCountUpDay ? `Count ${count}` : `누적 ${count}`}
                </Badge>
            </div>
        </CalendarCell>
    );
};

interface MonthCalendarProps {
    month: Dayjs;
    config: CalendarProps["config"];
    today: Dayjs;
    styles: ReturnType<typeof createCalendarStyles>;
    renderCell?: CalendarProps["renderCell"];
    colors: CalendarColors; // Always defined at this point
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
    month,
    config,
    today,
    styles,
    renderCell,
    colors,
}) => {
    const { MonthTitle, DayOfWeekRow, WeekdayCell, CalendarGrid } = styles;
    const weekdays = config.weekdays || [
        "일",
        "월",
        "화",
        "수",
        "목",
        "금",
        "토",
    ];
    const days = getCalendarGridDates(
        month,
        config.eventStartDate,
        config.eventEndDate,
        0 // config.weekStartDay
    );

    if (days.every((d) => d === null)) return null;

    const monthAnimation = getMonthAnimation();

    return (
        <motion.div
            key={month.format("YYYY-MM")}
            style={{ marginBottom: "2.2rem" }}
            {...monthAnimation}
        >
            <MonthTitle>{month.format("YYYY년 M월")}</MonthTitle>
            <DayOfWeekRow>
                {weekdays.map((d, idx) => (
                    <WeekdayCell key={idx} idx={idx}>
                        {d}
                    </WeekdayCell>
                ))}
            </DayOfWeekRow>
            <CalendarGrid>
                {days.map((date, idx) =>
                    date ? (
                        <CalendarDayCell
                            key={date.toISOString()}
                            date={date}
                            today={today}
                            config={config}
                            colors={colors}
                            styles={styles}
                            renderCell={renderCell}
                        />
                    ) : (
                        <div key={idx} />
                    )
                )}
            </CalendarGrid>
        </motion.div>
    );
};

interface EffectsVerticalBarProps {
    today: Dayjs;
    config: CalendarProps["config"];
    colors: CalendarProps["colors"];
    styles: ReturnType<typeof createCalendarStyles>;
    effectsTitle?: string;
    renderEffectsBar?: CalendarProps["renderEffectsBar"];
}

const EffectsVerticalBar: React.FC<EffectsVerticalBarProps> = ({
    today,
    config,
    colors,
    styles,
    effectsTitle = "이벤트 누적 달성 효과",
    renderEffectsBar,
}) => {
    const {
        EffectsBarWrap,
        EffectsTitle,
        EffectBoxStyled,
        EffectCount,
        EffectDesc,
        EffectsColumn,
    } = styles;
    const { setHighlightDate } = useCalendarHighlight();
    const todayCount = config.getCountForDate
        ? config.getCountForDate(today)
        : getCountForDate(today, config);
    const anchorPrefix = config.anchorPrefix || "effect-day-";

    const effectDays: { count: number; effect: string; day: Dayjs | null }[] =
        useMemo(() => {
            if (!config.effectData) return [];
            return config.effectData.map((e) => ({
                ...e,
                day: getDayForEffectCount(e.count, config),
            }));
        }, [config]);

    // Use custom effects bar renderer if provided
    if (renderEffectsBar) {
        return <>{renderEffectsBar({ today, todayCount, effectDays })}</>;
    }

    const activeRef = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
        }
    }, [todayCount]);

    const handleEffectClick = (
        e: React.MouseEvent,
        eff: (typeof effectDays)[number]
    ) => {
        e.preventDefault();
        if (eff.day) {
            const anchorId = `${anchorPrefix}${eff.count}`;
            const elm = document.getElementById(anchorId);
            if (elm) {
                elm.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                });
            }
            setHighlightDate(formatDate(eff.day), true);
        }
    };

    return (
        <EffectsBarWrap>
            <EffectsTitle>
                <span role="img" aria-label="trophy">
                    🎉
                </span>{" "}
                {effectsTitle}
            </EffectsTitle>
            <EffectsColumn>
                {effectDays.map((eff) => {
                    const achieved = todayCount >= eff.count;
                    const highlighted = todayCount === eff.count;
                    const href = eff.day
                        ? `#${anchorPrefix}${eff.count}`
                        : undefined;
                    return (
                        <EffectBoxStyled
                            href={href}
                            achieved={achieved}
                            highlighted={highlighted}
                            key={eff.count}
                            ref={highlighted ? activeRef : undefined}
                            tabIndex={0}
                            title={
                                eff.day
                                    ? `${
                                          eff.count
                                      }회 달성일자: ${eff.day.format(
                                          "YYYY-MM-DD"
                                      )}`
                                    : undefined
                            }
                            style={{ width: "100%" }}
                            onClick={(e) => handleEffectClick(e, eff)}
                        >
                            <EffectCount>{eff.count}</EffectCount>
                            <EffectDesc>{eff.effect}</EffectDesc>
                        </EffectBoxStyled>
                    );
                })}
            </EffectsColumn>
        </EffectsBarWrap>
    );
};

export const Calendar: React.FC<CalendarProps> = ({
    config,
    colors: colorsProp,
    today,
    infoTexts,
    pageTitle,
    effectsTitle,
    renderCell,
    showEffectsBar,
    renderEffectsBar,
}) => {
    // Use theme system if colors not provided
    const isDark = useDarkMode();
    const themeColors: CalendarColors = useMemo(
        () => colorsProp || getCalendarColors(isDark),
        [colorsProp, isDark]
    );
    const styles = useMemo(
        () => createCalendarStyles(themeColors),
        [themeColors]
    );
    const { PageWrap, MainLayout, LeftCol, RightCol, InfoSection } = styles;

    const monthList = getMonthList(config.eventStartDate, config.eventEndDate);
    const todayDate = today || dayjs();

    const defaultPageTitle =
        pageTitle ||
        `전체 이벤트 달력 (시작: ${config.eventStartDate.format(
            "YYYY.MM.DD (dd)"
        )} ~ ${config.eventEndDate.format("YYYY.MM.DD (dd)")})`;

    // Determine if effects bar should be shown
    const shouldShowEffectsBar =
        showEffectsBar !== undefined
            ? showEffectsBar
            : config.effectData && config.effectData.length > 0;

    return (
        <PageWrap>
            {pageTitle && (
                <h3
                    style={{
                        fontSize: "1.16rem",
                        marginBottom: 8,
                        lineHeight: 1.33,
                    }}
                >
                    {defaultPageTitle}
                </h3>
            )}
            <MainLayout>
                <LeftCol>
                    <div style={{ marginTop: 8 }}>
                        {monthList.map((monthObj) => (
                            <MonthCalendar
                                key={monthObj.format("YYYY-MM")}
                                month={monthObj}
                                config={config}
                                today={todayDate}
                                styles={styles}
                                renderCell={renderCell}
                                colors={themeColors}
                            />
                        ))}
                    </div>
                    {infoTexts && infoTexts.length > 0 && (
                        <InfoSection>
                            {infoTexts.map((text, idx) => (
                                <div key={idx}>{text}</div>
                            ))}
                        </InfoSection>
                    )}
                </LeftCol>
                {shouldShowEffectsBar && (
                    <RightCol>
                        <EffectsVerticalBar
                            today={todayDate}
                            config={config}
                            colors={themeColors}
                            styles={styles}
                            effectsTitle={effectsTitle}
                            renderEffectsBar={renderEffectsBar}
                        />
                    </RightCol>
                )}
            </MainLayout>
        </PageWrap>
    );
};
