import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import weekday from "dayjs/plugin/weekday";
import isSmaeOfAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import dayjs from "dayjs";
import { ThemeProvider } from "@emotion/react";

dayjs.extend(weekday);
dayjs.extend(isSmaeOfAfter);
dayjs.extend(isSameOrBefore);

const theme = {
    colors: {
        primary: "#2563eb",
        secondary: "#60a5fa",
        tertiary: "#93c5fd",
        quaternary: "#bfdbfe",
        quinary: "#dbeafe",
        senary: "#eff6ff",
        septenary: "#f3f4f6",
        octonary: "#f9fafb",
    },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider
            theme={
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? {
                          ...theme,
                          colors: {
                              ...theme.colors,
                              primary: "#60a5fa",
                              secondary: "#2563eb",
                              tertiary: "#1e293b",
                              quaternary: "#334155",
                              quinary: "#475569",
                              senary: "#64748b",
                              septenary: "#94a3b8",
                              octonary: "#f1f5f9",
                              background: "#0f172a",
                              text: "#f1f5f9",
                          },
                      }
                    : theme
            }
        >
            <RouterProvider
                router={createBrowserRouter(routes, {
                    basename:
                        process.env.NODE_ENV === "production" ? "/doodle" : "/",
                })}
            />
        </ThemeProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
