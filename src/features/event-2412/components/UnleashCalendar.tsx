import React from "react";
import { Badge, Button, Calendar, Typography } from "antd";
import dayjs from "dayjs";
import CheckableTag from "antd/es/tag/CheckableTag";

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

export const UnleashCalendar = () => {
    const [selected, setSelected] = React.useState<any[]>([]);
    console.log("selected : ", selected);
    return (
        <>
            <div className="w-[70%] m-auto">
                <Calendar
                    headerRender={(args) => <Header {...args} />}
                    cellRender={(
                        current,
                        { originNode, today, range, type }
                    ) => {
                        // console.log("current : ", current);
                        // console.log("type : ", type);
                        return (
                            <>
                                {dayjs(current).weekday() === 4 && (
                                    <Badge color="green" text="start" />
                                )}
                                {selected?.find((s) => s.isSame(current)) && (
                                    <Badge color="blue" text="selected" />
                                )}
                            </>
                        );
                    }}
                    onSelect={(value, type) => {
                        setSelected([]);
                        let a = value.clone();
                        console.log("a : ", a);
                        while (a.weekday() !== 4) {
                            const currentA = a.clone();
                            setSelected((prev) => {
                                return [...prev, currentA];
                            });
                            a = a.subtract(1, "day");
                        }

                        let b = value.clone();
                        while (b.weekday() !== 4) {
                            const currentA = b.clone();
                            setSelected((prev) => {
                                return [...prev, currentA];
                            });
                            b = b.add(1, "day");
                        }

                        // const a = dayjs(value).subtract(1, "week").weekday(4);
                        // console.log("a : ", a);
                        return;
                    }}
                />
            </div>
        </>
    );
};

const Header = ({ value, type, onChange, onTypeChange }: any) => {
    return (
        <div style={{ padding: 10 }}>
            <div className="flex flex-row items-center justify-between">
                <Typography.Title level={4}>
                    {value.format("YYYY년 MM월")}
                </Typography.Title>
                <div className="flex flex-row gap-3">
                    <Button
                        onClick={() =>
                            onChange(value.clone().subtract(1, "month"))
                        }
                    >
                        {value.subtract(1, "month").format("YYYY년 MM월")}
                    </Button>
                    <Button
                        onClick={() => onChange(value.clone().add(1, "month"))}
                    >
                        {value.add(1, "month").format("YYYY년 MM월")}
                    </Button>
                </div>
            </div>
        </div>
    );
};
