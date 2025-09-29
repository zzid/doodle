import React, { useEffect, useState } from "react";
import {
    Form,
    Button,
    Table,
    InputNumber,
    message,
    Typography,
    Popconfirm,
} from "antd";
import {
    CHAMPION_BURING_COIN_SHOP,
    COIN_SHOP_STORE_STORAGE_KEY,
} from "../data";
import { useCoinShopData, useCoinShopDataActions } from "../stores";

export const CoinShop = () => {
    const [form] = Form.useForm();
    const { setPurchasePlan, setToInitialState } = useCoinShopDataActions();

    const coinShopData = useCoinShopData();
    const { totalCoins, usedCoins, purchasePlan } = coinShopData;

    useEffect(() => {
        Object.entries(purchasePlan ?? {}).forEach(([k, v]: any) => {
            console.log("k : ", k);
            console.log("v : ", v);
            form.setFieldValue(`${k}`, v ?? 0);
        });
    }, []);

    const COLUMNS: any = [
        { title: "이름", dataIndex: "name" },
        { title: "필요코인", dataIndex: "cost" },
        { title: "재고", dataIndex: "available" },
        {
            title: "구매수량",
            dataIndex: "bought",
            // render: (_1: any, column: any, _2: any) => (
            //     // <Bought column={column} />
            // ),
        },
        {
            title: "남은 재고",
            dataIndex: "left",
            className: "font-bold",
        },
    ].map((c) => ({ ...c, key: c.dataIndex, align: "center" }));

    const DATA_SOURCE: any = Object.entries(
        CHAMPION_BURING_COIN_SHOP ?? {}
    ).map(([key, { cost, available }]) => {
        const bought = purchasePlan?.[key] ?? 0;
        return {
            key,
            name: key.replaceAll("_", " "),
            cost,
            available,
            bought,
            left: available - bought,
        };
    });

    const onEnter = async () => {
        try {
            const formData = await form.validateFields();
            console.log("formData : ", formData);
            setPurchasePlan(formData);
            return message.success("저장 되었습니다.");
        } catch (e) {
            console.error(e);
        }
    };
    const onResetToFirst = () => {
        form.resetFields();
        localStorage.removeItem(COIN_SHOP_STORE_STORAGE_KEY);
        return setToInitialState();
    };
    console.log("coinShopData : ", coinShopData);

    if (!totalCoins) {
        return <SetTotalCoins />;
    }
    return (
        <Form
            form={form}
            className="w-[1000px]"
            onFinish={onEnter}
            onReset={() => form.resetFields()}
        >
            <div className="flex flex-row w-full justify-between align-center p-3">
                <div className="flex flex-row gap-5">
                    <div>
                        <Typography.Title level={3}>
                            {(totalCoins - usedCoins).toLocaleString()} /{" "}
                            <span className="text-gray-500">
                                {totalCoins.toLocaleString()}
                            </span>
                        </Typography.Title>
                    </div>
                </div>
                <div className="flex flex-row gap-3">
                    <Button type="primary" htmlType="submit" ghost>
                        Save all
                    </Button>
                    <Button danger htmlType="reset">
                        Reset all
                    </Button>
                    <Popconfirm
                        title={"모든 데이터 초기화"}
                        description={
                            "작성한 모든 데이터가 초기화 됩니다. 정말 진행 하시겠습니까?"
                        }
                        onConfirm={onResetToFirst}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>Reset To First</Button>
                    </Popconfirm>
                </div>
            </div>
            <Table
                pagination={false}
                dataSource={DATA_SOURCE}
                columns={COLUMNS}
            />

            {/* <div className="border-2 border-solid rounded-lg w-[300px] h-[500px]">
                asdf
            </div> */}
            {/* CARD */}
            <div className="flex flex-row divide-x gap-20 p-5 m-auto w-[90%]">
                <div className="w-[35%] divide-y gap-3">
                    {DATA_SOURCE.map((data: any) => {
                        const { key, name, cost, available } = data;
                        console.log("key : ", purchasePlan?.[key]);
                        return (
                            <>
                                <div className="w-full p-4">
                                    <div className="flex flex-row justify-between w-full mb-2">
                                        <div className="font-bold text-[1rem]">
                                            {name}
                                        </div>
                                        <div className="flex flex-row gap-1 items-center">
                                            <div className="relative bg-yellow-500 text-yellow-700 w-[15px] h-[15px] border-2 border-yellow-700 rounded-full p-2 font-bold text-[20px]">
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
                                            <Button
                                                size="small"
                                                type="primary"
                                                className="font-bold text-[13px]"
                                                onClick={() => {
                                                    form.setFieldValue(
                                                        `${key}`,
                                                        available
                                                    );
                                                }}
                                            >
                                                MAX
                                            </Button>
                                            <Button
                                                className="text-[13px]"
                                                size="small"
                                                onClick={() => {
                                                    form.setFieldValue(
                                                        `${key}`,
                                                        0 // or column.bought?
                                                    );
                                                }}
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                        <div>
                                            <span className="font-bold">
                                                <Form.Item
                                                    name={`${key}`}
                                                    initialValue={0}
                                                    noStyle
                                                >
                                                    <InputNumber
                                                        className="w-[60px]"
                                                        max={available}
                                                        min={0}
                                                        type="number"
                                                    />
                                                </Form.Item>
                                                &nbsp;/&nbsp;
                                            </span>
                                            <span className="font-bold text-neutral-700">
                                                {available}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })}
                    <div className="mt-3 p-4 flex flex-row justify-end">
                        <Button type="primary" ghost htmlType="submit">
                            계산
                        </Button>
                    </div>
                </div>
                <div className="p-5 w-[50%]">
                    <Reciept />
                </div>
            </div>
        </Form>
    );
};

const Reciept = () => {
    const coinShopData = useCoinShopData();
    const { totalCoins, usedCoins, purchasePlan } = coinShopData;

    return (
        <>
            <Typography.Title level={3}>계산서</Typography.Title>
            {purchasePlan && totalCoins && usedCoins && (
                <div className="divide-y p-5">
                    {Object.entries(purchasePlan ?? {}).map(([key, v]: any) => {
                        return (
                            <React.Fragment key={key}>
                                <div className="flex flex-row justify-between font-bold p-3">
                                    <div>
                                        {key.replaceAll("_", " ")} * {v}
                                    </div>
                                    <div className="text-sky-600 font-bold">
                                        {(
                                            v *
                                            CHAMPION_BURING_COIN_SHOP[key].cost
                                        )?.toLocaleString()}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                    <div className="flex flex-col items-end justify-end p-3 font-bold">
                        <div>
                            총{" "}
                            <span className="text-red-400">
                                {usedCoins?.toLocaleString()}
                            </span>
                        </div>
                        <div>
                            남은 코인{" "}
                            <span className="text-green-400">
                                {(totalCoins - usedCoins)?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const Bought = ({ column }: any) => {
    const { purchasePlan } = useCoinShopData();
    const formInstance = Form.useFormInstance();
    const pp = purchasePlan?.[column.key] ?? 0;
    useEffect(() => {
        formInstance.setFieldValue(`${column.key}`, pp);
    }, []);
    return (
        <div className="flex flex-row items-center justify-center gap-2">
            <Form.Item name={`${column.key}`} noStyle>
                <InputNumber
                    className="w-[110px]"
                    max={pp + column.left}
                    min={0}
                    type="number"
                />
            </Form.Item>
            <div className="flex flex-col justify-center items-center gap-1">
                <Button
                    className="font-bold"
                    size="small"
                    type="primary"
                    onClick={() => {
                        formInstance.setFieldValue(
                            `${column.key}`,
                            column.left
                        );
                    }}
                >
                    M
                </Button>
                <Button
                    className="font-bold"
                    size="small"
                    onClick={() => {
                        formInstance.setFieldValue(
                            `${column.key}`,
                            0 // or column.bought?
                        );
                    }}
                >
                    R
                </Button>
            </div>
        </div>
    );
};

const SetTotalCoins = () => {
    const [form] = Form.useForm();
    const { setTotalCoins } = useCoinShopDataActions();
    const onFinish = async () => {
        try {
            const formData = await form.validateFields();
            setTotalCoins(formData.totalCoins);
        } catch (e) {
            console.error(e);
        }
    };
    return (
        <Form form={form} onFinish={onFinish}>
            <span className="font-bold text-[30px] my-3 block">
                First, Set Total
            </span>
            <Form.Item name={"totalCoins"}>
                <InputNumber className="w-[300px]" max={60000} min={0} />
            </Form.Item>
        </Form>
    );
};
