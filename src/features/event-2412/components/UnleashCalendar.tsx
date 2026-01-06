import React from "react";
import { dayjs, Dayjs } from "@/dayjs/dayjs";

const BOSS = {
    스우: { n: 10, h: 50 },
    데미안: { n: 10, h: 50 },
    루시드: { e: 15, n: 20, h: 65 },
    윌: { e: 15, n: 20, h: 65 },
    듄켈: { n: 25, h: 75 },
    더스크: { n: 25, h: 75 },
    진힐라: { n: 40, h: 90 },
    검은마법사: { h: 500 },
};
const REQUIRED = {
    반레온: 500,
    아카이럼: 500,
    매그너스: 500,
    스우: 800,
    데미안: 800,
    윌: 1000,
    루시드: 1000,
    진힐라: 1000,
};

const WEEKDAYS_KR = ["일", "월", "화", "수", "목", "금", "토"];

function getMonthMatrix(base: Dayjs) {
    // Start at first day of month, then go back to previous Sunday
    const first = base.startOf("month");
    const last = base.endOf("month");
    let start = first;
    if (first.day() !== 0) {
        start = first.subtract(first.day(), "day");
    }
    let cursor = start;
    const matrix: Dayjs[][] = [];
    while (cursor.isBefore(last) || cursor.isSame(last, "day")) {
        const week: Dayjs[] = [];
        for (let d = 0; d < 7; d++) {
            week.push(cursor);
            cursor = cursor.add(1, "day");
        }
        matrix.push(week);
        if (cursor.isAfter(last, "day") && cursor.day() === 0) break;
    }
    // Add extra week if the last day is not Saturday
    if (!matrix[matrix.length - 1][6].isSame(last, "day")) {
        const week: Dayjs[] = [];
        for (let d = 0; d < 7; d++) {
            week.push(cursor);
            cursor = cursor.add(1, "day");
        }
        matrix.push(week);
    }
    return matrix;
}

function isSameDay(a: Dayjs, b: Dayjs) {
    return a.isSame(b, "day");
}

export const UnleashCalendar = () => {
    const [selected, setSelected] = React.useState<Dayjs[]>([]);
    const [viewMonth, setViewMonth] = React.useState(dayjs());

    // Handle date cell click
    const handleDateSelect = (value: Dayjs) => {
        setSelected([]);
        let inSelected: Dayjs[] = [];

        // Back to previous Thursday (4)
        let a = value.clone();
        inSelected.push(a.clone());
        let cursor = a.clone().subtract(1, "day");
        while (cursor.day() !== 4) {
            inSelected.push(cursor.clone());
            cursor = cursor.subtract(1, "day");
        }
        inSelected.push(cursor.clone());

        // Forward to next Thursday
        cursor = a.clone().add(1, "day");
        while (cursor.day() !== 4) {
            inSelected.push(cursor.clone());
            cursor = cursor.add(1, "day");
        }
        inSelected.push(cursor.clone());

        setSelected(inSelected);
    };

    // Render calendar grid
    const monthMatrix = getMonthMatrix(viewMonth);

    return (
        <div className="w-[70%] m-auto">
            <Header value={viewMonth} onChange={setViewMonth} />

            <div className="border rounded-lg overflow-hidden shadow bg-white mt-3">
                <table className="min-w-full table-fixed">
                    <thead>
                        <tr>
                            {WEEKDAYS_KR.map((d, i) => (
                                <th
                                    key={d}
                                    className={
                                        "py-2 bg-gray-100 font-bold " +
                                        (i === 0
                                            ? "text-red-500"
                                            : i === 6
                                            ? "text-blue-500"
                                            : "text-gray-700")
                                    }
                                >
                                    {d}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {monthMatrix.map((week, wi) => (
                            <tr key={wi}>
                                {week.map((date, di) => {
                                    const isCurrentMonth =
                                        date.month() === viewMonth.month();
                                    const isToday = isSameDay(date, dayjs());
                                    const isSelected = selected.find((s) =>
                                        isSameDay(s, date)
                                    );
                                    const isStartDay = date.day() === 4;
                                    return (
                                        <td
                                            key={di}
                                            className={
                                                "h-20 text-center align-top transition cursor-pointer select-none " +
                                                (isCurrentMonth
                                                    ? "bg-white"
                                                    : "bg-gray-50 text-gray-400") +
                                                (isSelected
                                                    ? " border-2 border-blue-400"
                                                    : " border border-gray-200") +
                                                (isToday
                                                    ? " font-bold text-green-700"
                                                    : "")
                                            }
                                            onClick={() =>
                                                handleDateSelect(date)
                                            }
                                        >
                                            <div
                                                className="relative flex flex-col items-center"
                                                style={{ minHeight: 60 }}
                                            >
                                                <span>{date.date()}</span>
                                                {isStartDay && (
                                                    <span
                                                        className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-200 text-green-800"
                                                        style={{
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        start
                                                    </span>
                                                )}
                                                {isSelected && (
                                                    <span
                                                        className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-200 text-blue-800"
                                                        style={{
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        selected
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Header = ({
    value,
    onChange,
}: {
    value: Dayjs;
    onChange: (v: Dayjs) => void;
}) => {
    const prevMonth = value.clone().subtract(1, "month");
    const nextMonth = value.clone().add(1, "month");
    return (
        <div className="flex flex-row items-center justify-between p-4">
            <h2 className="text-2xl font-bold">
                {value.format("YYYY년 MM월")}
            </h2>
            <div className="flex flex-row gap-2">
                <button
                    className="rounded px-4 py-2 bg-gray-100 border hover:bg-gray-200 transition"
                    onClick={() => onChange(prevMonth)}
                >
                    {prevMonth.format("YYYY년 MM월")}
                </button>
                <button
                    className="rounded px-4 py-2 bg-gray-100 border hover:bg-gray-200 transition"
                    onClick={() => onChange(nextMonth)}
                >
                    {nextMonth.format("YYYY년 MM월")}
                </button>
            </div>
        </div>
    );
};
