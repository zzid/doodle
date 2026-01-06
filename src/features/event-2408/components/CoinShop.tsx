import React, { useEffect, useState } from "react";
import {
    CHAMPION_BURING_COIN_SHOP,
    COIN_SHOP_STORE_STORAGE_KEY,
} from "../data";
import { useCoinShopData, useCoinShopDataActions } from "../stores";

// Simple modal for confirm, not perfect but simple enough
function ConfirmDialog({
    open,
    onConfirm,
    onCancel,
    title,
    description,
}: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    description: string;
}) {
    if (!open) return null;
    return (
        <div className="fixed left-0 top-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded-lg shadow-lg min-w-[300px] p-7">
                <div className="font-bold text-lg mb-2">{title}</div>
                <div className="mb-6">{description}</div>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 font-bold"
                        onClick={onCancel}
                    >
                        No
                    </button>
                    <button
                        className="px-3 py-1 rounded bg-red-500 text-white font-bold hover:bg-red-400"
                        onClick={onConfirm}
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
}

export const CoinShop = () => {
    const { setPurchasePlan, setToInitialState } = useCoinShopDataActions();

    const coinShopData = useCoinShopData();
    const { totalCoins, usedCoins, purchasePlan } = coinShopData;

    // Local editable state for form
    const [localPlan, setLocalPlan] = useState<{ [key: string]: number }>({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [savedMessage, setSavedMessage] = useState<string>("");

    useEffect(() => {
        setLocalPlan({ ...(purchasePlan ?? {}) });
    }, [purchasePlan]);

    const DATA_SOURCE: any = Object.entries(
        CHAMPION_BURING_COIN_SHOP ?? {}
    ).map(([key, { cost, available }]) => {
        const bought = localPlan?.[key] ?? 0;
        return {
            key,
            name: key.replaceAll("_", " "),
            cost,
            available,
            bought,
            left: available - bought,
        };
    });

    // Save form
    const handleSave = (e?: React.FormEvent) => {
        e?.preventDefault();
        setPurchasePlan(localPlan);
        setSavedMessage("저장 되었습니다.");
        setTimeout(() => setSavedMessage(""), 1200);
    };

    // Reset current
    const handleReset = () => {
        setLocalPlan({});
    };

    // Reset all
    const handleResetToFirst = () => {
        setLocalPlan({});
        localStorage.removeItem(COIN_SHOP_STORE_STORAGE_KEY);
        setToInitialState();
        setShowConfirm(false);
    };

    const handleInput = (key: string, value: number, available: number) => {
        // Clamp input to [0, available]
        setLocalPlan((prev) => ({
            ...prev,
            [key]: Math.max(0, Math.min(value, available)),
        }));
    };

    if (!totalCoins) {
        return <SetTotalCoins />;
    }

    return (
        <form
            className="w-[1000px] m-auto mt-5"
            onSubmit={handleSave}
            onReset={(e) => {
                e.preventDefault();
                handleReset();
            }}
            autoComplete="off"
        >
            {showConfirm && (
                <ConfirmDialog
                    open={showConfirm}
                    title="모든 데이터 초기화"
                    description={
                        "작성한 모든 데이터가 초기화 됩니다. 정말 진행 하시겠습니까?"
                    }
                    onConfirm={handleResetToFirst}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            <div className="flex flex-row w-full justify-between items-center p-3 mb-1">
                <div className="flex flex-row gap-5 items-center">
                    <div>
                        <div className="text-3xl font-bold">
                            {(totalCoins - usedCoins).toLocaleString()} /{" "}
                            <span className="text-gray-500 font-normal text-2xl">
                                {totalCoins.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-3">
                    <button
                        type="submit"
                        className="bg-blue-400 text-white px-4 py-2 font-bold rounded hover:bg-blue-500 transition"
                    >
                        Save all
                    </button>
                    <button
                        type="reset"
                        className="bg-red-200 text-red-700 px-4 py-2 rounded font-bold border border-red-300 hover:bg-red-300 transition"
                    >
                        Reset all
                    </button>
                    <button
                        type="button"
                        className="bg-gray-200 text-gray-600 px-4 py-2 rounded font-bold border border-gray-400 hover:bg-gray-300 transition"
                        onClick={() => setShowConfirm(true)}
                    >
                        Reset To First
                    </button>
                </div>
            </div>
            {savedMessage && (
                <div className="mb-3 text-green-600 font-bold">
                    {savedMessage}
                </div>
            )}

            <div className="rounded-xl overflow-x-auto mb-10">
                <table className="min-w-full text-center border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-1">이름</th>
                            <th className="py-2 px-1">필요코인</th>
                            <th className="py-2 px-1">재고</th>
                            <th className="py-2 px-1">구매수량</th>
                            <th className="py-2 px-1">남은 재고</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DATA_SOURCE.map((row: any) => (
                            <tr
                                key={row.key}
                                className="border-b border-gray-100 hover:bg-gray-50"
                            >
                                <td className="py-2 px-1 font-medium">
                                    {row.name}
                                </td>
                                <td className="py-2 px-1 font-bold text-yellow-700">
                                    {row.cost}
                                </td>
                                <td className="py-2 px-1 font-bold text-slate-700">
                                    {row.available}
                                </td>
                                <td className="py-2 px-1">
                                    <div className="flex flex-row items-center gap-2 justify-center">
                                        <input
                                            name={row.key}
                                            type="number"
                                            className="w-20 border border-gray-300 rounded px-2 py-1 font-bold text-center"
                                            min={0}
                                            max={row.available}
                                            value={localPlan?.[row.key] ?? 0}
                                            onChange={(e) =>
                                                handleInput(
                                                    row.key,
                                                    Number(e.target.value),
                                                    row.available
                                                )
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="px-2 py-1 rounded text-xs font-bold bg-blue-200 text-blue-800 border border-blue-300 hover:bg-blue-300"
                                            onClick={() =>
                                                handleInput(
                                                    row.key,
                                                    row.available,
                                                    row.available
                                                )
                                            }
                                        >
                                            MAX
                                        </button>
                                        <button
                                            type="button"
                                            className="px-2 py-1 rounded text-xs font-bold bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300"
                                            onClick={() =>
                                                handleInput(
                                                    row.key,
                                                    0,
                                                    row.available
                                                )
                                            }
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </td>
                                <td className="py-2 px-1 font-bold text-green-700">
                                    {row.left}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-row divide-x gap-20 p-5 m-auto w-[90%]">
                <div className="w-[35%] divide-y gap-3">
                    {DATA_SOURCE.map((data: any) => {
                        const { key, name, cost, available } = data;
                        return (
                            <div className="w-full p-4" key={key}>
                                <div className="flex flex-row justify-between w-full mb-2">
                                    <div className="font-bold text-[1rem]">
                                        {name}
                                    </div>
                                    <div className="flex flex-row gap-1 items-center">
                                        <div className="relative bg-yellow-500 text-yellow-700 w-[15px] h-[15px] border-2 border-yellow-700 rounded-full p-2 font-bold text-[20px] flex items-center justify-center">
                                            <div className="absolute bottom-[-6px] left-[2px]">
                                                c
                                            </div>
                                        </div>
                                        <div className="font-bold text-black">
                                            {cost}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-row justify-between items-center">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="font-bold text-[13px] bg-blue-200 text-blue-800 rounded px-3 py-1 hover:bg-blue-300 transition"
                                            onClick={() => {
                                                handleInput(
                                                    `${key}`,
                                                    available,
                                                    available
                                                );
                                            }}
                                        >
                                            MAX
                                        </button>
                                        <button
                                            type="button"
                                            className="font-bold text-[13px] bg-gray-200 text-gray-800 rounded px-3 py-1 hover:bg-gray-300 transition"
                                            onClick={() => {
                                                handleInput(
                                                    `${key}`,
                                                    0,
                                                    available
                                                ); // or column.bought?
                                            }}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div>
                                        <span className="font-bold">
                                            <input
                                                type="number"
                                                name={`${key}`}
                                                min={0}
                                                max={available}
                                                className="w-[60px] border border-gray-300 rounded px-2 py-1 text-center font-bold"
                                                value={localPlan?.[key] ?? 0}
                                                onChange={(e) =>
                                                    handleInput(
                                                        key,
                                                        Number(e.target.value),
                                                        available
                                                    )
                                                }
                                            />
                                            &nbsp;/&nbsp;
                                        </span>
                                        <span className="font-bold text-neutral-700">
                                            {available}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div className="mt-3 p-4 flex flex-row justify-end">
                        <button
                            type="submit"
                            className="bg-blue-200 hover:bg-blue-300 transition text-blue-900 px-6 py-2 rounded font-bold"
                        >
                            계산
                        </button>
                    </div>
                </div>
                <div className="p-5 w-[50%]">
                    <Reciept localPlan={localPlan} />
                </div>
            </div>
        </form>
    );
};

const Reciept = ({ localPlan }: { localPlan?: { [key: string]: number } }) => {
    const coinShopData = useCoinShopData();
    const { totalCoins, usedCoins, purchasePlan } = coinShopData;

    // Calculated using localPlan if provided, else current store
    const plan = localPlan ?? purchasePlan ?? {};
    const totalUsed = Object.entries(plan ?? {}).reduce(
        (sum, [key, v]: any) =>
            sum +
            (typeof v === "number" ? v : 0) *
                (CHAMPION_BURING_COIN_SHOP[key]?.cost ?? 0),
        0
    );
    const leftCoin = totalCoins ? totalCoins - totalUsed : 0;

    return (
        <div>
            <div className="text-2xl mb-2 font-bold">계산서</div>
            {totalCoins && (
                <div className="divide-y p-5">
                    {Object.entries(plan).map(([key, v]: any) => {
                        if (!v || v <= 0) return null;
                        return (
                            <div
                                className="flex flex-row justify-between font-bold p-3"
                                key={key}
                            >
                                <div>
                                    {key.replaceAll("_", " ")} * {v}
                                </div>
                                <div className="text-sky-600 font-bold">
                                    {(
                                        v * CHAMPION_BURING_COIN_SHOP[key].cost
                                    )?.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                    <div className="flex flex-col items-end justify-end p-3 font-bold">
                        <div>
                            총{" "}
                            <span className="text-red-400">
                                {totalUsed?.toLocaleString()}
                            </span>
                        </div>
                        <div>
                            남은 코인{" "}
                            <span className="text-green-400">
                                {leftCoin?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SetTotalCoins = () => {
    const { setTotalCoins } = useCoinShopDataActions();
    const [value, setValue] = useState<number | undefined>();
    return (
        <form
            className="flex flex-col items-center justify-center mt-10"
            onSubmit={(e) => {
                e.preventDefault();
                if (typeof value === "number") {
                    setTotalCoins(value);
                }
            }}
        >
            <span className="font-bold text-[30px] my-3 block">
                First, Set Total
            </span>
            <input
                type="number"
                className="w-[300px] border border-gray-400 rounded px-5 py-3 text-lg font-bold text-center block my-2"
                max={60000}
                min={0}
                value={value ?? ""}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder="총 코인 수를 입력하세요"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded mt-3 font-bold text-lg hover:bg-blue-700 transition"
            >
                저장
            </button>
        </form>
    );
};
