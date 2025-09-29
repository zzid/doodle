import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button, Tag } from "antd";
import { HOLIDAYS } from "@/data";
const DIFF_THRESHOLD = 7;
const EVENT: any[] = [
    // { start: "2025-03-20", end: "2025-04-16", title: "champion challenge" },
];

export const MapleCalendarPage = () => {
    const [stat, setStat] = useState(null);
    const [totalCellCount, setTotalCellCount] = React.useState(35);
    const [page, setPage] = React.useState(0);
    const today = dayjs();
    const startOfMonth = today.startOf("month");
    useEffect(() => {
        setStat(maker());
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

    const diff = DIFF_THRESHOLD - today.weekday();
    const maker = () => {
        return HOLIDAYS.reduce((result: any, { date, amount }) => {
            if (!result[getDayString(dayjs(date).weekday())]) {
                result[getDayString(dayjs(date).weekday())] = +amount;
            } else {
                result[getDayString(dayjs(date).weekday())] += +amount;
            }
            return result;
        }, {});
    };
    return (
        <>
            <div className="w-full flex flex-row gap-5 m-5">
                <Button onClick={() => setPage(0)}>cur</Button>
                <Button onClick={() => setPage((prev) => prev - 1)}>
                    Prev
                </Button>
                <Button onClick={() => setPage((prev) => prev + 1)}>
                    Next
                </Button>
            </div>
            <div className={`grid grid-cols-7 w-fit m-10 divide-y-2`}>
                {Array(7)
                    .fill(0)
                    .map((_, i) => (
                        <div className="border-none py-1 px-3 text-neutral-600">
                            {getDayString(i)}
                        </div>
                    ))}
                {Array(totalCellCount)
                    .fill(0)
                    .map((_, t) => {
                        const i = diff + t + totalCellCount * page;
                        // const i = t + totalCellCount * page;
                        const cur = today.add(i, "day");
                        const isSaturday = cur.weekday() === 6;
                        const isSunday = cur.weekday() === 0;
                        const isThursday = cur.weekday() === 4;
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
                            "w-[150px] h-[130px] p-1 overflow-clip hover:bg-neutral-200/30 hover:scale-105",
                            !!isHoliday ? "bg-yellow-200/30" : "",
                            // isSaturday ? "bg-blue-200/30" : "",
                            // isSunday ? "bg-red-200/30" : "",
                            // isToday ? "bg-green-200/30" : "",
                            // isStartOfMonth ? "bg-neutral-200/90" : "",
                        ];
                        return (
                            <div
                                key={i}
                                className={cn.join(" ")}
                                //     `w-[150px] h-[130px] p-1 overflow-clip
                                // ${isSaturday ? "bg-blue-200/30" : ""}
                                // ${isSunday ? "bg-red-200/30" : ""}
                                // ${isToday ? "bg-green-200/30" : ""}
                                // ${isStartOfMonth ? "bg-neutral-200/90" : ""}
                                // hover:bg-neutral-200/30
                                // hover:scale-105
                                // `
                                // }
                            >
                                <div className="text-[13px] text-neutral-500 text-bold">
                                    {cur.format("YYYY-MM-DD")}
                                 </div>
                                {!!isHoliday && <Tag>{isHoliday?.amount}</Tag>}
                                {event && (
                                    <Tag className="max-w-[100px] overflow-clip whitespace-nowrap text-ellipsis">
                                        {event?.title}
                                    </Tag>
                                )}
                                {/* {isThursday && (
                                    <span className="font-bold">Start</span>
                                )} */}
                            </div>
                        );
                    })}
            </div>
            <div>
                {stat && (
                    <div className="p-10">
                        {Object.entries(stat).map(([key, v]: any) => (
                            <div className="w-1/3 flex flex-row ">
                                <div className="w-1/3">{key}</div>
                                <div className="w-2/3">{v}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};
