import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title,
    CategoryScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Title,
    CategoryScale
);

type Props = {
    minY?: number;
    maxY?: number;
};

const DEFAULT_CASH_RATE = 1450; // 현거래 시세 (1억메소당 1450원)
const TOTAL_KRW = 1500000; // 150만원까지 계산
const RANGE_MESO_START = 1900;
const RANGE_MESO = 300; // 메소 시세 범위 (1900 ~ 2500)
// 메소 시세: 1900 ~ 2500 (1억메소 당 거래가) (x축)
const mesoMarketValues = Array.from(
    { length: RANGE_MESO + 1 },
    (_, i) => RANGE_MESO_START + i
);

// 1. 10000원으로 몇 억메소 살 수 있는지 (10000 / 메소시세)
const getMesoBought = (money: number, marketPrice: number) => {
    return money / marketPrice;
};

// 2. 산 메소를 현거래시세로 팔 경우 현금 환전액 (1억메소 * 현거래시세)
const getCashBySell = (meso: number, cashRate: number) => {
    return meso * cashRate;
};

// 3. 차익 계산 (10000 - 현금화한 금액), 단 "원" 단위는 절삭
const getProfit = (money: number, marketPrice: number, cashRate: number) => {
    const mesoAmount = getMesoBought(money, marketPrice); // 몇 억메소
    const cash = getCashBySell(mesoAmount, cashRate);
    return Math.trunc(money - cash); // 차액, 소숫점 절삭
};

// 4. 총합: 150만원 전체 환전 시 차익, "원" 단위 절삭
const getTotalProfit = (
    totalMoney: number,
    marketPrice: number,
    cashRate: number
) => {
    // 비율이 10000원과 동일하니, 차액 * (총금액 / 10000)
    const profitPerUnit = getProfit(10000, marketPrice, cashRate);
    return Math.trunc((totalMoney / 10000) * profitPerUnit);
};

// -- Chart 옵션(상수) --
const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top" as const,
            labels: {
                color: "#e6e7ed",
            },
        },
        title: {
            display: true,
            text: "3개월 mvp 가격(10000원/150만원 기준, 억당 시세 <CASH_RATE>원)",
            color: "#FFFFff",
            font: {
                size: 17,
                weight: "bold",
            },
        },
        tooltip: {
            backgroundColor: "rgba(22,24,44,0.97)",
            borderColor: "#00dbc4",
            borderWidth: 1,
            titleColor: "#e6e7ed",
            bodyColor: "#e6e7ed",
            callbacks: {
                label: function (context: any) {
                    if (context.dataset.label?.includes("구매 가능")) {
                        return `메포 시세: ${
                            context.label
                        } → ${context.parsed.y.toFixed(2)} 억메소`;
                    } else if (context.dataset.label?.includes("mvp 가격")) {
                        return `메포 시세: ${
                            context.label
                        } → 3개월 mvp 가격: ${Math.trunc(
                            context.parsed.y
                        ).toLocaleString()}원`;
                    }
                    return `${context.parsed.y}`;
                },
            },
        },
    },
    scales: {
        x: {
            type: "linear" as const,
            min: RANGE_MESO_START,
            max: RANGE_MESO_START + RANGE_MESO,
            title: {
                display: true,
                text: "메포 시세 (1억메소 당 원)",
                color: "#a2aecd",
                font: { weight: "bold" },
            },
            ticks: {
                color: "#c1cbe6",
                callback: function (val: any) {
                    return val;
                },
            },
            grid: {
                color: "rgba(110,110,150,0.13)",
                borderColor: "#22263c",
                tickColor: "#393950",
            },
        },
        y1: {
            position: "left" as const,
            title: {
                display: true,
                text: "구매 가능한 억메소",
                color: "#e6e7ed",
            },
            grid: {
                drawOnChartArea: true,
                color: "rgba(110,110,150,0.12)",
                borderColor: "#444869",
                tickColor: "#393950",
            },
            ticks: {
                color: "#c1cbe6",
            },
        },
        y2: {
            position: "right" as const,
            title: {
                display: true,
                text: "3개월 mvp 가격 (원, 10000원 기준)",
                color: "#f07878",
            },
            grid: {
                drawOnChartArea: false,
                color: "rgba(110,110,150,0.09)",
                borderColor: "#f0787840",
                tickColor: "#393950",
            },
            ticks: {
                color: "#f07878",
                callback: function (val: any) {
                    return Math.trunc(val).toLocaleString();
                },
            },
        },
        y3: {
            position: "right" as const,
            title: {
                display: true,
                text: "3개월 mvp 가격 (원, 150만원 기준)",
                color: "#1ef688",
            },
            grid: {
                drawOnChartArea: false,
                color: "rgba(30,246,136,0.07)",
                borderColor: "#1ef68840",
                tickColor: "#1ef688",
            },
            ticks: {
                color: "#1ef688",
                callback: function (val: any) {
                    return Math.trunc(val).toLocaleString();
                },
            },
            offset: true,
        },
    },
};

const MepoChart: React.FC<Props> = ({ minY, maxY }) => {
    // 현거래 시세(1억메소당) 상태 관리
    const [cashRate, setCashRate] = useState<number>(DEFAULT_CASH_RATE);

    // 데이터셋과 data, options 캐싱
    const data = useMemo(() => {
        const mesoBoughtDataset = {
            label: "10000원으로 구매 가능한 억메소",
            data: mesoMarketValues.map((x) => getMesoBought(10000, x)),
            borderColor: "rgba(30, 144, 255, 0.95)",
            backgroundColor: "rgba(30, 144, 255, 0.23)",
            yAxisID: "y1",
            tension: 0.2,
            pointRadius: 0,
        };

        // const profitDataset = {
        //     label: "10000원 환전 시 3개월 mvp 가격(원)",
        //     data: mesoMarketValues.map((x) => getProfit(10000, x, cashRate)),
        //     borderColor: "rgba(255, 84, 112, 0.96)",
        //     backgroundColor: "rgba(255, 84, 112, 0.22)",
        //     yAxisID: "y2",
        //     tension: 0.2,
        //     pointRadius: 0,
        // };

        const totalProfitDataset = {
            label: "150만원 환전 시 총 3개월 mvp 가격(원)",
            data: mesoMarketValues.map((x) =>
                getTotalProfit(TOTAL_KRW, x, cashRate)
            ),
            borderColor: "rgba(30, 246, 136, 0.95)",
            backgroundColor: "rgba(30, 246, 136, 0.22)",
            yAxisID: "y3",
            tension: 0.2,
            pointRadius: 0,
        };

        return {
            labels: mesoMarketValues,
            datasets: [
                mesoBoughtDataset,
                // profitDataset,
                totalProfitDataset,
            ],
        };
    }, [cashRate]);

    // y축 범위 적용
    const chartOptions = useMemo(() => {
        // 옵션 제목의 CASH_RATE 값을 동적으로 변경
        let titleText = options.plugins.title.text.replace(
            /<CASH_RATE>/g,
            cashRate.toString()
        );

        const baseOptions = {
            ...options,
            plugins: {
                ...options.plugins,
                title: {
                    ...options.plugins.title,
                    text: titleText,
                },
            },
        };

        if (typeof minY === "number" || typeof maxY === "number") {
            return {
                ...baseOptions,
                scales: {
                    ...baseOptions.scales,
                    y3: {
                        ...baseOptions.scales.y3,
                        min: minY,
                        max: maxY,
                    },
                },
            };
        }
        return baseOptions;
    }, [cashRate, minY, maxY]);

    return (
        <div
            style={{
                background: "rgba(31, 35, 48, 0.93)",
                borderRadius: "12px",
                padding: "16px 12px 10px 12px",
                color: "#e6e7ed",
                maxWidth: 900,
                margin: "0 auto",
                boxShadow: "0 2px 32px #000a",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            <style>
                {`
                @media (max-width: 600px) {
                    .mepo-chart-slider-row {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        gap: 8px !important;
                    }
                    .mepo-chart-slider-range {
                        width: 100% !important;
                        min-width: 0 !important;
                        margin-right: 0 !important;
                    }
                    .mepo-chart-slider-value {
                        font-size: 1em !important;
                        margin-top: 2px !important;
                    }
                    .mepo-chart-description {
                        font-size: 0.98rem !important;
                        margin: 1.0rem 0 0.5rem 0 !important;
                    }
                }
                `}
            </style>
            {/* 현거래 시세(1억메소당 원) 슬라이더 */}
            <div
                className="mepo-chart-slider-row"
                style={{
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 8,
                    flexWrap: "wrap",
                }}
            >
                <label
                    style={{
                        color: "#e7ffe7",
                        marginRight: 8,
                        fontWeight: 600,
                        minWidth: "auto",
                        fontSize: "0.98em",
                        whiteSpace: "nowrap",
                    }}
                >
                    현거래 시세
                </label>
                <input
                    className="mepo-chart-slider-range"
                    type="range"
                    min={1000}
                    max={2500}
                    step={10}
                    value={cashRate}
                    onChange={(e) => setCashRate(Number(e.target.value))}
                    style={{
                        verticalAlign: "middle",
                        width: 98,
                        minWidth: 80,
                        marginRight: 4,
                        accentColor: "#1ef688",
                        height: 4,
                        flexGrow: 0,
                    }}
                />
                <span
                    className="mepo-chart-slider-value"
                    style={{
                        fontWeight: 700,
                        color: "#1ef688",
                        fontVariantNumeric: "tabular-nums",
                        fontSize: "1em",
                        letterSpacing: "0.01em",
                        minWidth: 54,
                        whiteSpace: "nowrap",
                        textAlign: "right",
                        marginLeft: 4,
                        marginTop: -2,
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: "#172824c4",
                    }}
                >
                    {cashRate.toLocaleString()} 원
                </span>
            </div>
            <div
                style={{
                    width: "100%",
                    overflowX: "auto",
                }}
            >
                <Line
                    data={data}
                    options={
                        {
                            ...chartOptions,
                            interaction: {
                                mode: "index",
                                intersect: false,
                            },
                            maintainAspectRatio: false, // allow responsive height
                            responsive: true,
                        } as any
                    }
                    style={{
                        width: "100%",
                        minWidth: 0,
                        maxWidth: "100%",
                        height: "380px",
                    }}
                />
            </div>
            <div
                className="mepo-chart-description"
                style={{
                    fontSize: "1.02rem",
                    margin: "0.83rem 0 0.45rem 0",
                    color: "#e6e7ed",
                }}
            >
                <div>
                    <span
                        style={{
                            color: "#1e90ff",
                            fontWeight: 700,
                            letterSpacing: "0.01em",
                            filter: "drop-shadow(0 0 4px #12479773)",
                        }}
                    >
                        파란선
                    </span>
                    <span style={{ color: "#A1A5B3", fontWeight: 400 }}>
                        : 10000원으로 살 수 있는 억메소
                    </span>
                </div>
                <div>
                    <span
                        style={{
                            color: "#1ef688",
                            fontWeight: 700,
                            letterSpacing: "0.01em",
                            filter: "drop-shadow(0 0 4px #10725f70)",
                        }}
                    >
                        초록선
                    </span>
                    <span style={{ color: "#A1A5B3", fontWeight: 400 }}>
                        : 150만원 전액 환전시 3개월 mvp 가격
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MepoChart;
