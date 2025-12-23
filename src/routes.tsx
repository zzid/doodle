import React from "react";
import {
    ExpCouponPage,
    App,
    Event2408Page,
    MapleCalendarPage,
    HomePage,
} from "@/pages";
import { Event2412Page } from "./pages/Event2412Page";
import { SymbolPage } from "./pages/SymbolPage";
import { DefaultLayout } from "./layout";
import { MotionPage } from "./pages/MotionPage";
import { CalendarPage } from "./pages/Calendar";
export const routes = [
    {
        path: "*",
        element: (
            <>
                <h1>NotFound</h1>
            </>
        ),
    },
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "exp-coupon",
                element: <ExpCouponPage />,
            },
            {
                path: "event-2408",
                element: <Event2408Page />,
            },
            {
                path: "event-2412",
                element: <Event2412Page />,
            },
            {
                path: "maple-calendar",
                element: <MapleCalendarPage />,
            },
            {
                path: "symbol",
                element: <SymbolPage />,
            },
            {
                path: "motion",
                element: <MotionPage />,
            },
            {
                path: "calendar",
                element: <CalendarPage />,
            },
        ],
    },
];

// {
//     path: "*"
//     element: <Navigate to={"/main"} replace={true} />,
// },
// {
//     path: "/main",
//     element: <Main />,
// },
// {
//     path: "/weekend-study",
//     element: <WeekendStudy />,
// },
