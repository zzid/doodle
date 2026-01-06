"use client";

import React, { useEffect, useState } from "react";
import { dayjs } from "@/lib/dayjs";
import { HOLIDAYS } from "@/data";
const DIFF_THRESHOLD = 7;
const EVENT: any[] = [
    // { start: "2025-03-20", end: "2025-04-16", title: "champion challenge" },
];

// Simple Tag component to replace antd's Tag
const Tag: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
    children,
    className,
}) => (
    <span
        className={
            `inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-800 mr-1 my-1` +
            (className ? " " + className : "")
        }
        style={{
            maxWidth: "100px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
        }}
    >
        {children}
    </span>
);

// Simple Button component to replace antd's Button
const SimpleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
    children,
    ...props
}) => (
    <button
        {...props}
        className="px-4 py-2 bg-blue-600 disabled:bg-blue-300 text-white rounded shadow hover:bg-blue-700 transition-all duration-150"
        type="button"
    >
        {children}
    </button>
);

export default function MapleCalendarPage() {
    const [stat, setStat] = useState<any>(null);
    const [totalCellCount, setTotalCellCount] = React.useState(35);
    const [page, setPage] = React.useState(0);
    const today = dayjs();
    const startOfMonth = today.startOf("month");
    useEffect(() => {
        setStat(maker());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getDayString = (dayNumber: number): string => {
        const num = (DIFF_THRESHOLD + dayNumber) % 7;
        switch (num) {
            case 4:
                return "Thursday";
            case 5:
                return "Friday";
            case 6:
                return "Saturday";
            case 0:
                return "Sunday";
            case 1:
                return "Monday";
            case 2:
                return "Tuesday";
            case 3:
                return "Wednesday";
            default:
                return "Invalid day";
        }
    };

    const diff = DIFF_THRESHOLD - today.day();
    const maker = () => {
        return HOLIDAYS.reduce((result: any, { date, amount }) => {
            if (!result[getDayString(dayjs(date).day())]) {
                result[getDayString(dayjs(date).day())] = +amount;
            } else {
                result[getDayString(dayjs(date).day())] += +amount;
            }
            return result;
        }, {});
    };
    return (
        <>
            <div className="w-full flex flex-row gap-5 m-5">
                <SimpleButton onClick={() => setPage(0)}>cur</SimpleButton>
                <SimpleButton onClick={() => setPage((prev) => prev - 1)}>
                    Prev
                </SimpleButton>
                <SimpleButton onClick={() => setPage((prev) => prev + 1)}>
                    Next
                </SimpleButton>
            </div>
            <div className={`grid grid-cols-7 w-fit m-10 divide-y-2`}>
                {Array(7)
                    .fill(0)
                    .map((_, i) => (
                        <div
                            key={i}
                            className="border-none py-1 px-3 text-neutral-600"
                        >
                            {getDayString(i)}
                        </div>
                    ))}
                {Array(totalCellCount)
                    .fill(0)
                    .map((_, t) => {
                        const i = diff + t + totalCellCount * page;
                        const cur = today.add(i, "day");
                        const isSaturday = cur.day() === 6;
                        const isSunday = cur.day() === 0;
                        const isThursday = cur.day() === 4;
                        const isToday = today
                            .add(i, "day")
                            .isSame(today, "day");

                        const isStartOfMonth = dayjs(cur)
                            .startOf("month")
                            .isSame(cur, "day");

                        const event = EVENT.find(
                            ({ start, end }) =>
                                cur.isSameOrAfter(start, "day") &&
                                cur.isSameOrBefore(end, "day")
                        );
                        const isHoliday = HOLIDAYS.find(({ date, amount }) =>
                            cur.isSame(date, "day")
                        );
                        const cn = [
                            "w-[150px] h-[130px] p-1 overflow-clip hover:bg-neutral-200/30 hover:scale-105 transition-all duration-100",
                            !!isHoliday ? "bg-yellow-200/30" : "",
                        ];
                        return (
                            <div key={i} className={cn.join(" ")}>
                                <div className="text-[13px] text-neutral-500 font-bold">
                                    {cur.format("YYYY-MM-DD")}
                                </div>
                                {!!isHoliday && <Tag>{isHoliday?.amount}</Tag>}
                                {event && <Tag>{event?.title}</Tag>}
                            </div>
                        );
                    })}
            </div>
            <div>
                {stat && (
                    <div className="p-10">
                        {Object.entries(stat).map(([key, v]: any, idx) => (
                            <div className="w-1/3 flex flex-row" key={idx}>
                                <div className="w-1/3">{key}</div>
                                <div className="w-2/3">{v}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
