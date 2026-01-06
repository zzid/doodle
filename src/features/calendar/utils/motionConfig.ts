import { CalendarColors } from "../types";

export const getCellAnimation = (
    isHighlighted: boolean,
    isToday: boolean,
    isEffectDay: boolean,
    colors: CalendarColors
) => {
    if (isHighlighted) {
        return {
            scale: [1, 1.05, 1],
            boxShadow: [
                colors.cellHighlightShadow,
                "0 0 0 14px #ffcb7f22",
                colors.cellHighlightShadow,
            ],
            background: [
                colors.cellHighlight,
                "#fff8b0",
                colors.cellHighlight,
            ],
        };
    }

    if (isToday) {
        return {
            boxShadow: [
                "0 0 0 0px #fcffb8",
                "0 0 0 8px #ffe16e44",
                "0 0 0 0px #fcffb8",
            ],
        };
    }

    if (isEffectDay) {
        return {
            boxShadow: [
                "0 0 0 0px #ffe3a259",
                "0 0 0 7px #ffe6a477",
                "0 0 0 0px #ffe3a259",
            ],
        };
    }

    return {};
};

export const getCellTransition = (
    isHighlighted: boolean,
    isToday: boolean,
    isEffectDay: boolean
) => {
    if (isHighlighted) {
        return {
            duration: 1.3,
            repeat: 0,
            ease: "easeInOut" as const,
        };
    }

    if (isToday || isEffectDay) {
        return {
            duration: 1.6,
            repeat: Infinity,
            repeatType: "mirror" as const,
            ease: "easeInOut" as const,
        };
    }

    return {};
};

export const getCellInitial = (isToday: boolean) => {
    return isToday
        ? { scale: 1, boxShadow: "0 0 0 0px #faf3ae88" }
        : false;
};

export const getMonthAnimation = () => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.55, ease: "easeOut" as const },
});

