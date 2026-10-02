import React, { useState } from "react";
import styled from "@emotion/styled";
import { NORMAL_EXP_COUPON, ADVANCED_EXP_COUPON } from "../data";
import { css } from "@emotion/react";

const AdvancedBarWrapper = styled.div`
    position: relative;
    display: inline-block;
`;

const AdvBarTooltip = styled.div`
    visibility: hidden;
    background-color: rgba(0, 0, 0, 0.8);
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 4px 8px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 12px;
    pointer-events: none;
    transition: visibility 0.1s, opacity 0.1s;
    opacity: 0;

    ${AdvancedBarWrapper}:hover & {
        visibility: visible !important;
        opacity: 1 !important;
    }
`;
const Bar = styled.div<{ isActive: boolean; height: number }>`
    width: 10px;
    background-color: ${({ isActive }) => (isActive ? "skyblue" : "#a0a0a0")};
    position: relative;
    font-size: 5px;
    cursor: pointer;
    transition: background-color 0.1s;
    height: ${({ height }) => height}px;
    &:hover {
        background-color: #00ffd5 !important;
    }
`;

const AdvancedBar = styled.div<{ isActive: boolean; height: number }>`
    color: orange;
    font-weight: bold;
    font-size: 10px;
    width: 20px;
    background-color: ${({ isActive }) => (isActive ? "skyblue" : "#a0a0a0")};
    position: relative;
    font-size: 5px;
    cursor: pointer;
    transition: background-color 0.1s;
    height: ${({ height }) => height}px;
    &:hover {
        background-color: #00ffd5 !important;
    }
`;

const Result = styled.div`
    position: absolute;
    top: 20%;
    left: 50%;
    width: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transform: translate(-50%, 0);
`;

const Wrapper = styled.div`
    width: 100vw;
    min-height: 100vh;
    position: relative;
`;

const Row = styled.div<{ asAdvanced?: boolean }>`
    margin: 50px auto;
    width: 80%;
    height: 80%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: flex-end;
    ${(props) => props.asAdvanced && "flex-direction: row;"}
`;

const BarLabel = styled.div<{ advanced?: boolean }>`
    color: white;
    font-weight: bold;
    font-size: ${({ advanced }) => (advanced ? "10px" : "6px")};
    position: absolute;
    bottom: -30px;
    left: -2px;
`;

export const ExpCoupon = () => {
    const [from, setFrom] = useState<number>(0);
    const [to, setTo] = useState<number>(0);
    const [sum, setSum] = useState<number>(0);

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
            setSum(
                NORMAL_EXP_COUPON.slice(idx, from - 200).reduce(
                    (sum, v) => sum + v,
                    0
                )
            );
            return;
        }

        setSum(
            NORMAL_EXP_COUPON.slice(from - 200, idx).reduce(
                (sum, v) => sum + v,
                0
            )
        );
        return setTo(idx + 200);
    };

    return (
        <Wrapper>
            <Row>
                {NORMAL_EXP_COUPON.slice(0, 50).map((v, idx) => {
                    const isActive =
                        (!!to && idx >= from - 200 && idx <= to - 200) ||
                        idx === from - 200 ||
                        idx === to - 200;
                    return (
                        <Bar
                            key={idx}
                            isActive={isActive}
                            height={v * 0.05}
                            onClick={() => onClick(idx)}
                        >
                            {v}
                            <BarLabel>{`${200 + idx} -> ${
                                200 + idx + 1
                            }`}</BarLabel>
                        </Bar>
                    );
                })}
            </Row>
            <Result>
                <div>{!!from && !!to && `${from} ~ ${to + 1}`}</div>
                <div>sum: {sum.toLocaleString()}</div>
            </Result>

            <Row asAdvanced>
                {ADVANCED_EXP_COUPON.map(({ level, required: v }, idx) => {
                    const isActive =
                        (!!to && idx >= from - 200 && idx <= to - 200) ||
                        idx === from - 200 ||
                        idx === to - 200;
                    return (
                        <AdvancedBarWrapper key={level}>
                            <AdvancedBar isActive={isActive} height={v * 0.001}>
                                <BarLabel advanced>{`${level} -> ${
                                    level + 1
                                }`}</BarLabel>
                            </AdvancedBar>
                            <AdvBarTooltip>
                                {`필요 경험치: ${v.toLocaleString()}`}
                            </AdvBarTooltip>
                        </AdvancedBarWrapper>
                    );
                })}
            </Row>
        </Wrapper>
    );
};
