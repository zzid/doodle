import { create } from "zustand";
import { persist } from "zustand/middleware";
import { omit } from "lodash-es";
import dayjs from "dayjs";
import {
    CHAMPION_BURING_COIN_SHOP,
    COIN_SHOP_STORE_STORAGE_KEY,
} from "../data";

const initialState = {
    totalCoins: null,
    usedCoins: null,
    lastUpdated: null,
    purchasePlan: null,
};

const useCoinShopStore = create<any>()(
    persist(
        (set, get) => ({
            totalCoins: null,
            usedCoins: null,
            lastUpdated: null,
            purchasePlan: null,
            actions: {
                setTotalCoins: (totalCoins: number) => {
                    set((state: any) => {
                        return {
                            ...state,
                            totalCoins,
                        };
                    });
                },
                setPurchasePlan: (purchasePlan: any) => {
                    set((state: any) => {
                        const sum = Object.entries(purchasePlan).reduce(
                            (acc: number, [name, v]: any) =>
                                acc + v * CHAMPION_BURING_COIN_SHOP[name].cost,
                            0
                        );
                        console.log(sum);
                        return {
                            ...state,
                            usedCoins: sum,
                            purchasePlan,
                            lastUpdated: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        };
                    });
                },
                setToInitialState: () => {
                    set((state: any) => {
                        return {
                            ...state,
                            ...initialState,
                        };
                    });
                },
            },
        }),
        {
            name: COIN_SHOP_STORE_STORAGE_KEY,
            partialize: (state) => omit(state, "actions"),
        }
    )
);

export const useCoinShopDataActions = () =>
    useCoinShopStore((state) => state.actions);
export const useCoinShopData = () =>
    useCoinShopStore((state) => omit(state, "actions"));
