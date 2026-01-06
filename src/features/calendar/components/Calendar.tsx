import React, { useMemo, useRef, useEffect } from "react";
import { dayjs, Dayjs } from "@/lib/dayjs";

import { motion } from "framer-motion";
import { CalendarProps } from "../types";
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
import { colors } from "../constants";
interface CalendarDayCellProps {
    date: Dayjs;
    today: Dayjs;
    config: CalendarProps["config"];
    colors: CalendarProps["colors"];
    styles: ReturnType<typeof createCalendarStyles>;
}

const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
    date,
    today,
    config,
    colors,
    styles,
}) => {
    const { CalendarCell, CellDayNum, Badge } = styles;
    const count = getCountForDate(date, config);
    const isToday = formatDate(date) === formatDate(today);
    const thisWeekStart = getStartOfEventWeek(date, config.weekStartDay || 4);
    const dayIdxInWeek = date.diff(thisWeekStart, "day");
    const isCountUpDay =
        dayIdxInWeek >= 0 && dayIdxInWeek < (config.countUpDaysPerWeek || 5);
    const isEffectDay =
        config.effectData.some((eff) => eff.count === count) && isCountUpDay;

    const { highlightDate, setHighlightDate, showHighlight } =
        useCalendarHighlight();

    const isHighlighted = highlightDate === formatDate(date) && showHighlight;

    const anchorPrefix = config.anchorPrefix || "effect-day-";
    const effectAnchor = isEffectDay ? `${anchorPrefix}${count}` : undefined;

    const animation = getCellAnimation(
        isHighlighted,
        isToday,
        isEffectDay,
        colors
    );
    const transition = getCellTransition(isHighlighted, isToday, isEffectDay);
    const initial = getCellInitial(isToday);

    return (
        <CalendarCell
            isToday={isToday}
            isEffectDay={isEffectDay}
            isHighlighted={isHighlighted}
            id={effectAnchor}
            initial={initial}
            animate={animation}
            transition={transition}
        >
            <CellDayNum>{date.date()}</CellDayNum>
            <div>
                <Badge
                    isCountUpDay={isCountUpDay}
                    shouldEmphasize={isEffectDay}
                >
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
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
    month,
    config,
    today,
    styles,
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
}

const EffectsVerticalBar: React.FC<EffectsVerticalBarProps> = ({
    today,
    config,
    colors,
    styles,
    effectsTitle = "이벤트 누적 달성 효과",
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
    const todayCount = getCountForDate(today, config);
    const anchorPrefix = config.anchorPrefix || "effect-day-";

    const effectDays: { count: number; effect: string; day: Dayjs | null }[] =
        useMemo(
            () =>
                config.effectData.map((e) => ({
                    ...e,
                    day: getDayForEffectCount(e.count, config),
                })),
            [config]
        );

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
    colors,
    today,
    infoTexts,
    pageTitle,
    effectsTitle,
}) => {
    const styles = useMemo(() => createCalendarStyles(colors), [colors]);
    const { PageWrap, MainLayout, LeftCol, RightCol, InfoSection } = styles;

    const monthList = getMonthList(config.eventStartDate, config.eventEndDate);
    const todayDate = today || dayjs();

    const defaultPageTitle =
        pageTitle ||
        `전체 이벤트 달력 (시작: ${config.eventStartDate.format(
            "YYYY.MM.DD (dd)"
        )} ~ ${config.eventEndDate.format("YYYY.MM.DD (dd)")})`;

    return (
        <PageWrap>
            <h3
                style={{
                    fontSize: "1.16rem",
                    marginBottom: 8,
                    lineHeight: 1.33,
                }}
            >
                {defaultPageTitle}
            </h3>
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
                <RightCol>
                    <EffectsVerticalBar
                        today={todayDate}
                        config={config}
                        colors={colors}
                        styles={styles}
                        effectsTitle={effectsTitle}
                    />
                </RightCol>
            </MainLayout>
        </PageWrap>
    );
};
