import React, { useState } from "react";

export const ExpCoupon = () => {
    const [from, setFrom] = useState<number>(0);
    const [to, setTo] = useState<number>(0);
    const [sum, setSum] = useState<number>(0);
    const arr = [
        299, 326, 355, 386, 422, 461, 503, 549, 600, 657, 428, 465, 503, 546,
        593, 753, 804, 856, 914, 974, 1242, 1300, 1364, 1429, 1501, 1911, 2003,
        2104, 2207, 2315, 2836, 2871, 2896, 2932, 2964, 3781, 3826, 3877, 3922,
        3970, 5070, 5065, 5126, 5263, 5269, 6734, 6822, 6912, 7005, 7100, 10088,
        10229, 10374, 10523, 10675, 10831, 10990, 11154, 11302, 11473, 34418,
        34762, 35110, 35461, 35815, 46560, 47025, 47496, 47971, 48450, 107559,
        108635, 109721, 110818, 111927, 226091, 248700, 273570, 300927, 331020,
        668660, 735526, 809078, 889986, 978984, 1977548, 2175303, 2392833,
        2632116, 2895328, 5848562, 6433418, 7076760, 7784436, 8562880, 17297016,
        19026718, 20929390, 23022329, 34533493,
    ];
    const onClick = (idx: number) => {
        if (!!to) {
            setFrom(0);
            setTo(0);
            setSum(0);
            return setFrom(idx + 200);
        }
        if (!from) {
            return setFrom(idx + 200);
        }

        if (idx + 200 <= from) {
            setTo(from);
            setFrom(idx + 200);
            setSum(arr.slice(idx, from - 200).reduce((sum, v) => sum + v, 0));
            return;
        }

        setSum(arr.slice(from - 200, idx).reduce((sum, v) => sum + v, 0));
        return setTo(idx + 200);
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
            }}
        >
            <div
                style={{
                    margin: "50px auto",
                    width: "80%",
                    height: "80%",
                    display: "flex",
                    flexDirection: "row",
                    gap: 5,
                    alignItems: "flex-end",
                }}
            >
                {arr.slice(0, 50).map((v, idx) => {
                    return (
                        <div
                            className="bar"
                            style={{
                                height: v * 0.05,
                                ...((!!to &&
                                    idx >= from - 200 &&
                                    idx <= to - 200) ||
                                idx === from - 200 ||
                                idx === to - 200
                                    ? { backgroundColor: "skyblue" }
                                    : {}),
                            }}
                            onClick={() => onClick(idx)}
                        >
                            {v}
                            <div
                                style={{
                                    position: "absolute",
                                    fontSize: 5,
                                    bottom: -30,
                                    left: -2,
                                }}
                            >{`${200 + idx} -> ${200 + idx + 1}`}</div>
                        </div>
                    );
                })}
            </div>
            <div className="result">
                <div>{!!from && !!to && `${from} ~ ${to + 1}`}</div>
                <div>sum: {sum.toLocaleString()}</div>
            </div>
        </div>
    );
};
