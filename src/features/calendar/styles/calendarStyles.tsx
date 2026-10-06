import React, { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { CalendarColors } from "../types";
import "./calendar.css";

/**
 * 캘린더 표현 컴포넌트 묶음.
 *
 * 예전에는 emotion styled 로 만들었지만, 사이트 스타일링을 Tailwind 로 통일하면서
 * 전부 일반 컴포넌트 + Tailwind 클래스로 옮겼다.
 * 단, colors 는 런타임에 교체 가능한 API(심볼 페이지가 인디고 팔레트로 덮어씀)라
 * 값을 클래스로 굳힐 수 없어 --cal-* CSS 변수로 전달하고,
 * hover/outline 처럼 유틸로 못 쓰는 부분만 calendar.css 가 그 변수를 읽는다.
 */

type Div = React.HTMLAttributes<HTMLDivElement>;

const cx = (...parts: (string | false | undefined)[]) =>
    parts.filter(Boolean).join(" ");

export const createCalendarStyles = (colors: CalendarColors) => {
    const PageWrap = ({ className, style, ...props }: Div) => (
        <div
            {...props}
            style={{ color: colors.pageText, ...style }}
            className={cx(
                "mx-auto max-w-[1080px] p-6 max-[600px]:p-2.5",
                className
            )}
        />
    );

    const MainLayout = ({ className, ...props }: Div) => (
        <div
            {...props}
            className={cx(
                "flex items-start gap-11 max-[900px]:flex-col max-[900px]:gap-[22px] max-[600px]:gap-2.5",
                className
            )}
        />
    );

    const LeftCol = ({ className, ...props }: Div) => (
        <div
            {...props}
            className={cx(
                "min-w-[320px] flex-[3_1_0] max-[600px]:w-full max-[600px]:min-w-0",
                className
            )}
        />
    );

    const RightCol = ({ className, ...props }: Div) => (
        <div
            {...props}
            className={cx(
                "sticky top-5 mt-6 min-w-[300px] flex-[2_1_0]",
                "max-[900px]:static max-[900px]:mt-8",
                "max-[600px]:mt-4 max-[600px]:w-full max-[600px]:min-w-0",
                className
            )}
        />
    );

    const EffectsBarWrap = ({ className, ...props }: Div) => (
        <div
            {...props}
            className={cx(
                "flex w-full flex-col items-center max-[600px]:items-stretch",
                className
            )}
        />
    );

    const EffectsTitle = ({ className, style, ...props }: Div) => (
        <div
            {...props}
            style={{ color: colors.effectTitle, ...style }}
            className={cx(
                "mb-3 text-center text-[1.07rem] font-semibold tracking-[-1px]",
                "max-[600px]:mb-[7px] max-[600px]:text-base",
                className
            )}
        />
    );

    type EffectBoxProps = HTMLMotionProps<"a"> & {
        achieved?: boolean;
        highlighted?: boolean;
    };

    const EffectBoxStyled = forwardRef<HTMLAnchorElement, EffectBoxProps>(
        ({ achieved, highlighted, className, style, ...props }, ref) => (
            <motion.a
                ref={ref}
                {...props}
                style={
                    {
                        borderColor: achieved
                            ? colors.effectBoxBorderAchieved
                            : colors.effectBoxBorderNormal,
                        color: colors.effectBoxText,
                        fontWeight: highlighted ? 700 : 500,
                        "--cal-bg": highlighted
                            ? colors.effectBoxBgHighlight
                            : achieved
                            ? colors.effectBoxBgAchieved
                            : colors.effectBoxBgNormal,
                        "--cal-shadow": highlighted
                            ? colors.effectBoxBoxShadowHighlight
                            : "none",
                        "--cal-hover-shadow": colors.effectBoxHoverShadow,
                        "--cal-outline": highlighted
                            ? `2.5px solid ${colors.effectBoxOutline}`
                            : "none",
                        "--cal-outline-offset": highlighted ? "0.5px" : "0",
                        ...style,
                    } as React.CSSProperties
                }
                className={cx(
                    "cal-effect-box relative flex min-w-[64px] items-center gap-2.5 rounded-[9px]",
                    "border-[1.5px] px-4 py-2.5 pl-3 no-underline",
                    "max-[600px]:min-w-[40px] max-[600px]:gap-[7px] max-[600px]:px-3 max-[600px]:py-2 max-[600px]:pl-[9px] max-[600px]:text-[0.99rem]",
                    className
                )}
            />
        )
    );
    EffectBoxStyled.displayName = "EffectBoxStyled";

    const EffectCount = ({ className, style, ...props }: Div) => (
        <div
            {...props}
            style={{
                color: colors.effectCount,
                textShadow: colors.effectCountShadow,
                ...style,
            }}
            className={cx(
                "mr-0.5 text-[1.18rem] font-bold max-[600px]:text-[1.05rem]",
                className
            )}
        />
    );

    const EffectDesc = ({ className, ...props }: Div) => (
        <div
            {...props}
            className={cx(
                "break-keep text-[0.97rem] font-medium leading-[1.3] max-[600px]:text-[0.9rem]",
                className
            )}
        />
    );

    const EffectsColumn = ({ className, ...props }: Div) => (
        <div
            {...props}
            className={cx(
                "flex w-full flex-col items-stretch justify-start gap-2.5 py-1.5 pb-2.5 text-[11px]",
                "max-[600px]:gap-[3px] max-[600px]:py-0.5 max-[600px]:pb-[5px]",
                className
            )}
        />
    );

    const MonthTitle = ({ className, ...props }: Div) => (
        <div
            {...props}
            className={cx(
                "mb-[0.4em] text-[1.12rem] font-semibold tracking-[-1px]",
                "max-[600px]:mb-[0.2em] max-[600px]:text-[1.01rem]",
                className
            )}
        />
    );

    const DayOfWeekRow = ({ className, style, ...props }: Div) => (
        <div
            {...props}
            style={{
                borderBottom: `1px solid ${colors.dayWeekBorderBottom}`,
                ...style,
            }}
            className={cx(
                "mb-[3px] grid grid-cols-7 gap-[5px] font-medium",
                "max-[600px]:gap-[2.5px] max-[600px]:text-[0.99rem]",
                className
            )}
        />
    );

    const WeekdayCell = ({
        idx,
        className,
        style,
        ...props
    }: Div & { idx: number }) => (
        <div
            {...props}
            style={{
                color:
                    idx === 0
                        ? colors.weekdayThu
                        : idx === 6
                        ? colors.weekdayWed
                        : colors.weekdayOther,
                ...style,
            }}
            className={cx("text-center", className)}
        />
    );

    const CalendarGrid = ({ className, ...props }: Div) => (
        <div
            {...props}
            className={cx(
                "grid grid-cols-7 gap-[5px] max-[600px]:gap-[2.5px]",
                className
            )}
        />
    );

    type CellProps = HTMLMotionProps<"div"> & {
        isToday: boolean;
        isEffectDay?: boolean;
        isHighlighted?: boolean;
    };

    const CalendarCell = ({
        isToday,
        isEffectDay,
        isHighlighted,
        className,
        style,
        ...props
    }: CellProps) => (
        <motion.div
            {...props}
            style={
                {
                    borderColor: isEffectDay
                        ? colors.cellBorderEffect
                        : colors.cellBorderNormal,
                    "--cal-bg": isHighlighted
                        ? colors.cellHighlight
                        : isEffectDay
                        ? colors.cellBgEffect
                        : isToday
                        ? colors.cellBgToday
                        : colors.cellBgNormal,
                    "--cal-shadow": isHighlighted
                        ? colors.cellHighlightShadow
                        : isToday
                        ? colors.cellShadowToday
                        : isEffectDay
                        ? colors.cellShadowEffect
                        : colors.cellShadowNone,
                    "--cal-hover-bg": isHighlighted
                        ? colors.cellHighlight
                        : isToday
                        ? colors.cellHoverBgToday
                        : isEffectDay
                        ? colors.cellHoverBgEffect
                        : colors.cellHoverBgNormal,
                    "--cal-hover-shadow": isHighlighted
                        ? colors.cellHighlightShadow
                        : colors.cellHoverShadow,
                    ...style,
                } as React.CSSProperties
            }
            className={cx(
                "cal-cell relative min-h-[70px] rounded-lg border-[1.3px] p-2.5 opacity-100",
                "max-[600px]:min-h-[40px] max-[600px]:rounded-[5px] max-[600px]:p-1.5",
                className
            )}
        />
    );

    const CellDayNum = ({ className, style, ...props }: Div) => (
        <div
            {...props}
            style={{ color: colors.cellDayNum, ...style }}
            className={cx(
                "text-[15px] font-semibold max-[600px]:text-[13px]",
                className
            )}
        />
    );

    const Badge = ({
        isCountUpDay,
        shouldEmphasize,
        className,
        style,
        ...props
    }: React.HTMLAttributes<HTMLSpanElement> & {
        isCountUpDay: boolean;
        shouldEmphasize?: boolean;
    }) => (
        <span
            {...props}
            style={{
                color: shouldEmphasize
                    ? colors.badgeEmphasize
                    : isCountUpDay
                    ? colors.badgeCountUp
                    : colors.badgeNormal,
                background: shouldEmphasize
                    ? colors.badgeBgEmphasize
                    : isCountUpDay
                    ? colors.badgeBgCountUp
                    : colors.badgeBgNormal,
                ...style,
            }}
            className={cx(
                "mt-0.5 inline-block rounded-xl px-[7px] py-0 text-[10px] font-semibold",
                "max-[600px]:mt-px max-[600px]:px-1.5 max-[600px]:text-[9px]",
                className
            )}
        />
    );

    const InfoSection = ({ className, style, ...props }: Div) => (
        <div
            {...props}
            style={{ color: colors.infoSection, ...style }}
            className={cx(
                "mt-6 text-[13px] max-[600px]:mt-3 max-[600px]:text-[11px]",
                className
            )}
        />
    );

    return {
        PageWrap,
        MainLayout,
        LeftCol,
        RightCol,
        EffectsBarWrap,
        EffectsTitle,
        EffectBoxStyled,
        EffectCount,
        EffectDesc,
        EffectsColumn,
        MonthTitle,
        DayOfWeekRow,
        WeekdayCell,
        CalendarGrid,
        CalendarCell,
        CellDayNum,
        Badge,
        InfoSection,
    };
};
