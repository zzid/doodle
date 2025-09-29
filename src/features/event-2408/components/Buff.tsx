import React, { useEffect, useState } from "react";
import { Button, Tag } from "antd";

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

    return (
        <>
            {shouldGoNextWeek ? (
                <div>
                    <Button
                        onClick={() => {
                            setShouldGoNextWeek(false);
                            setWeek((prev) => prev + 1);
                            setPointAndDay("+");
                        }}
                    >
                        Go Next Week
                    </Button>
                </div>
            ) : (
                <div className="flex gap-3">
                    <Button onClick={() => setPointAndDay("-")}>{"<"}</Button>
                    <Button
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
                    </Button>
                </div>
            )}

            <div>
                <div className="grid grid-cols-5 grid-flow-row gap-3 my-5 border-2 rounded-xl p-5">
                    {Object.entries(curBuffAdvantage).map(([k, v]) => {
                        return (
                            <div>
                                <span className="font-bold text-[17px]">
                                    [ {k} ]
                                </span>{" "}
                                <span className="text-red-500 font-bold">
                                    {BUFF_ADVANTAGE[k][v] ?? 0}
                                    {BUFF_ADVANTAGE_UNIT[k]}
                                </span>{" "}
                                ({v})
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-row items-center">
                    <div className="border-2 rounded-full p-[3px] text-yellow-900 bg-sky-300 border-blue-400 w-6 h-6 flex flex-row items-center justify-center font-bold my-1 mr-2">
                        <span className="translate-y-[-2px]">p</span>
                    </div>
                    <div className="border-2 px-2 rounded font-bold">
                        {point}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-5 grid-flow-row gap-1">
                {Object.keys(curBuffAdvantage).map((key: string) => {
                    const cur = curBuffAdvantage[key];
                    const req = required[curBuffAdvantage[key]];
                    return (
                        <div className="flex flex-row gap-3 items-center p-3 border-2 rounded-md">
                            <div className="text-[18px]">
                                {key.slice(0, 1)} : {curBuffAdvantage[key]}
                            </div>
                            <div className="flex flex-row gap-3">
                                {/* <Button
                                    disabled={
                                        cur <= 0 || cur >= required.length
                                    }
                                    onClick={() => {
                                        setCurBuffAdvantage((prev) => {
                                            return {
                                                ...prev,
                                                [key]: prev[key] - 1,
                                            };
                                        });
                                    }}
                                >
                                    -
                                </Button> */}
                                <Button
                                    disabled={point < req}
                                    type="primary"
                                    onClick={() => {
                                        setCurBuffAdvantage((prev) => {
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
                                    + (<span className="font-bold">{req}p</span>
                                    )
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="grid grid-cols-5 grid-flow-row gap-2">
                {histories.map((history, idx) => {
                    console.log("histories : ", histories);
                    console.log("history : ", history);
                    return (
                        <div>
                            <h4 className="font-bold">
                                {"< "}Day {idx + 1}
                                {" >"}
                            </h4>
                            <div>
                                {history.map((d: string) => (
                                    <Tag>{d}</Tag>
                                ))}
                                {/* {idx === histories.length - 1 && !history.length
                                    ? diff.map((d) => <div>{d}</div>)
                                    : history.map((d: string) => (
                                          <div>{d}</div>
                                      ))} */}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="grid grid-cols-5 grid-flow-row">
                {Array(MAX_DAYS)
                    .fill(0)
                    .map((_, idx) => {
                        return (
                            <div
                                key={`day-box-${idx}`}
                                className={`border-2 p-5 ${
                                    idx + 1 === day ? "bg-green-300" : ""
                                } relative`}
                            >
                                <div className="absolute top-0 left-2">
                                    {idx + 1}
                                </div>
                                {/* {histories?.[idx + 1]?.map((d: string) => (
                                    <Tag>{d}</Tag>
                                ))} */}
                            </div>
                        );
                    })}
            </div>
        </>
    );
};
