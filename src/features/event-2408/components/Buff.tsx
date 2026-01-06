import React, { useEffect, useState } from "react";

type TObj = { [key: string]: any };
const required = [1, 4, 7, 13, 20, 25];
const BUFF_ADVANTAGE: TObj = {
    보공: [5, 10, 20, 30, 35, 40],
    방무: [5, 10, 20, 30, 35, 40],
    벞지: [5, 10, 15, 20, 25, 30],
    크확: [5, 10, 15, 20, 25, 30],
    일몹뎀: [5, 10, 20, 30, 35, 40],
    경험치: [2.5, 5, 7.5, 10, 12.5, 15],
    올스텟: [10, 20, 30, 40, 50, 60],
    아케인: [10, 20, 30, 40, 50, 60],
    공마: [5, 10, 15, 20, 25, 30],
    hpMp: [500, 1000, 1500, 2000, 2500, 3000],
};

const BUFF_ADVANTAGE_UNIT: TObj = {
    보공: "%",
    방무: "%",
    벞지: "%",
    크확: "%",
    일몹뎀: "%",
    경험치: "%",
    올스텟: "",
    아케인: "",
    공마: "",
    hpMp: "",
};
const MAX_DAYS = 40;

const ADDITIONAL_ADVANTAGE: TObj = {
    보스_솔_에르다_증가: [10, 20, 40, 60, 80, 100],
    몬컬_확률_증가: [10, 20, 40, 60, 80, 100],
    현상금_포탈_경험치: [10, 20, 40, 60, 80, 100],
    몬스터_파크_경험치: [5, 10, 20, 30, 40, 50],
    "아케인_일퀘_경험치/심볼": [
        "5% / 1개",
        "10% / 2개",
        "20% / 3개",
        "30% / 4개",
        "40%/ 50개",
        "50% / 6개",
    ],
    "그란디스_일퀘_경험치/심볼": [
        "5% / 1개",
        "10% / 2개",
        "20% / 3개",
        "30% / 4개",
        "40%/ 50개",
        "50% / 6개",
    ],
    유니온_주간퀘_코인: [100, 150, 200, 250, 300, 400],
};

function clsx(...args: (string | boolean | undefined)[]) {
    return args.filter(Boolean).join(" ");
}

export const Buff = () => {
    const [day, setDay] = useState(0);
    const [week, setWeek] = useState(0);
    const [shouldGoNextWeek, setShouldGoNextWeek] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [point, setPoint] = useState(0);
    const [histories, setHistories] = useState<any[]>([]);
    const [diff, setDiff] = useState<String[]>([]);
    const [curBuffAdvantage, setCurBuffAdvantage] = useState<TObj>(
        Object.keys(BUFF_ADVANTAGE).reduce((obj: TObj, key: string) => {
            obj[key] = 0;
            return obj;
        }, {})
    );
    const [curAdditionalAdvantage, setCurAdditionalAdvantage] = useState<TObj>(
        Object.keys(ADDITIONAL_ADVANTAGE).reduce((obj: TObj, key: string) => {
            obj[key] = 0;
            return obj;
        }, {})
    );

    useEffect(() => {
        if (day > 0 && day % 5 === 0) {
            setShouldGoNextWeek(true);
        }
    }, [day]);

    useEffect(() => {
        if (week >= 8) {
            setIsEnded(true);
        }
    }, [week]);

    const setPointAndDay = (dir: "+" | "-") => {
        if (dir === "+") {
            setPoint((prev) => prev + 5);
            setDay((prev) => prev + 1);
        } else {
            setPoint((prev) => prev - 5);
            setDay((prev) => prev - 1);
        }
    };

    // Simple custom button component with minimal styling
    const SimpleButton = ({
        children,
        onClick,
        disabled,
        style,
        className = "",
    }: any) => (
        <button
            className={clsx(
                "px-4 py-1 rounded font-bold active:scale-95 transition-transform border border-blue-400",
                disabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-200 hover:bg-blue-300 text-blue-800 cursor-pointer",
                className
            )}
            onClick={onClick}
            disabled={disabled}
            style={style}
            type="button"
        >
            {children}
        </button>
    );

    // Simple tag/pill component
    const SimpleTag = ({ children }: any) => (
        <span
            style={{
                display: "inline-block",
                padding: "0.2em 0.7em",
                margin: "0.1em",
                borderRadius: "13px",
                background: "#edf2fa",
                color: "#1961ad",
                fontWeight: 600,
                fontSize: "0.95em",
            }}
        >
            {children}
        </span>
    );

    return (
        <>
            {shouldGoNextWeek ? (
                <div>
                    <SimpleButton
                        onClick={() => {
                            setShouldGoNextWeek(false);
                            setWeek((prev: number) => prev + 1);
                            setPointAndDay("+");
                        }}
                    >
                        Go Next Week
                    </SimpleButton>
                </div>
            ) : (
                <div
                    className="flex gap-3"
                    style={{ display: "flex", gap: 12 }}
                >
                    <SimpleButton onClick={() => setPointAndDay("-")}>
                        {"<"}
                    </SimpleButton>
                    <SimpleButton
                        onClick={() => {
                            setPointAndDay("+");
                            setHistories((prev) => {
                                const next = [...prev];
                                next.push(!!Object.keys(diff) ? diff : []);
                                setDiff([]);
                                return next;
                            });
                        }}
                    >
                        {">"}
                    </SimpleButton>
                </div>
            )}

            <div>
                <div
                    className="grid grid-cols-5 grid-flow-row gap-3 my-5 border-2 rounded-xl p-5"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                        gap: 12,
                        margin: "20px 0",
                        border: "2px solid #7fbdeb",
                        borderRadius: "18px",
                        padding: "24px",
                    }}
                >
                    {Object.entries(curBuffAdvantage).map(([k, v]) => (
                        <div key={k}>
                            <span
                                className="font-bold text-[17px]"
                                style={{ fontWeight: 700, fontSize: 17 }}
                            >
                                [ {k} ]
                            </span>{" "}
                            <span
                                className="text-red-500 font-bold"
                                style={{ color: "#e23e4b", fontWeight: 700 }}
                            >
                                {BUFF_ADVANTAGE[k][v] ?? 0}
                                {BUFF_ADVANTAGE_UNIT[k]}
                            </span>{" "}
                            ({v})
                        </div>
                    ))}
                </div>
                <div
                    className="flex flex-row items-center"
                    style={{ display: "flex", alignItems: "center" }}
                >
                    <div
                        className="border-2 rounded-full p-[3px] text-yellow-900 bg-sky-300 border-blue-400 w-6 h-6 flex flex-row items-center justify-center font-bold my-1 mr-2"
                        style={{
                            border: "2px solid #7fbdeb",
                            borderRadius: "100%",
                            padding: 3,
                            color: "#a25d00",
                            background: "#bae6fd",
                            width: 24,
                            height: 24,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            margin: "4px 8px 4px 0px",
                        }}
                    >
                        <span
                            className="translate-y-[-2px]"
                            style={{ position: "relative", top: -2 }}
                        >
                            p
                        </span>
                    </div>
                    <div
                        className="border-2 px-2 rounded font-bold"
                        style={{
                            border: "2px solid #aaa",
                            borderRadius: "8px",
                            padding: "0 10px",
                            fontWeight: 700,
                            fontSize: "16px",
                        }}
                    >
                        {point}
                    </div>
                </div>
            </div>
            <div
                className="grid grid-cols-5 grid-flow-row gap-1"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                    gap: 6,
                    marginTop: 12,
                    marginBottom: 16,
                }}
            >
                {Object.keys(curBuffAdvantage).map((key: string) => {
                    const cur = curBuffAdvantage[key];
                    const req = required[curBuffAdvantage[key]];
                    return (
                        <div
                            key={key}
                            className="flex flex-row gap-3 items-center p-3 border-2 rounded-md"
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 12,
                                padding: "12px",
                                border: "2px solid #b2c6e4",
                                borderRadius: "10px",
                            }}
                        >
                            <div
                                className="text-[18px]"
                                style={{ fontSize: 18, marginRight: 8 }}
                            >
                                {key.slice(0, 1)} : {curBuffAdvantage[key]}
                            </div>
                            <div
                                className="flex flex-row gap-3"
                                style={{ display: "flex", gap: 10 }}
                            >
                                {/* minus button logic could be uncommented and built if needed */}
                                <SimpleButton
                                    disabled={point < req}
                                    style={{
                                        background:
                                            point < req ? "#e5e7eb" : "#f6d6db",
                                        color: point < req ? "#999" : "#cf4656",
                                    }}
                                    onClick={() => {
                                        setCurBuffAdvantage((prev: TObj) => {
                                            return {
                                                ...prev,
                                                [key]: prev[key] + 1,
                                            };
                                        });
                                        setDiff((prev) => [
                                            ...prev,
                                            `${key} : ${
                                                curBuffAdvantage[key]
                                            } -> ${curBuffAdvantage[key] + 1}`,
                                        ]);
                                        setPoint((prev) => prev - req);
                                    }}
                                >
                                    + (
                                    <span
                                        className="font-bold"
                                        style={{ fontWeight: 700 }}
                                    >
                                        {req}p
                                    </span>
                                    )
                                </SimpleButton>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div
                className="grid grid-cols-5 grid-flow-row gap-2"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                    gap: 8,
                    marginBottom: 24,
                }}
            >
                {histories.map((history, idx) => {
                    // console.log("histories : ", histories);
                    // console.log("history : ", history);
                    return (
                        <div key={idx}>
                            <h4
                                className="font-bold"
                                style={{ fontWeight: 700, marginBottom: 5 }}
                            >
                                {"< "}Day {idx + 1}
                                {" >"}
                            </h4>
                            <div>
                                {history.map((d: string, di: number) => (
                                    <SimpleTag key={di}>{d}</SimpleTag>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div
                className="grid grid-cols-5 grid-flow-row"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                    gap: 4,
                }}
            >
                {Array(MAX_DAYS)
                    .fill(0)
                    .map((_, idx) => {
                        return (
                            <div
                                key={`day-box-${idx}`}
                                className={clsx(
                                    "border-2 p-5 relative",
                                    idx + 1 === day ? "bg-green-300" : ""
                                )}
                                style={{
                                    border: "2px solid #adc7f1",
                                    padding: 22,
                                    background:
                                        idx + 1 === day ? "#6ee7b7" : undefined,
                                    position: "relative",
                                    borderRadius: 10,
                                    minHeight: 32,
                                }}
                            >
                                <div
                                    className="absolute top-0 left-2"
                                    style={{
                                        position: "absolute",
                                        top: 2,
                                        left: 10,
                                        fontWeight: 500,
                                        color: "#374151",
                                    }}
                                >
                                    {idx + 1}
                                </div>
                                {/* Could display tags/labels here for each day if wanted */}
                            </div>
                        );
                    })}
            </div>
        </>
    );
};
