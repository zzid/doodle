import React from "react";
import { Outlet } from "react-router-dom";
import { css } from "@emotion/react";

export const DefaultLayout = () => {
    return (
        <div
            style={{
                margin: 0,
                padding: 0,
                minHeight: "100vh",
                minWidth: "100vw",
                backgroundColor: "#181a20",
                backgroundImage: `
                    /* 
                        Draws a grid with a light line every 20px, and a stronger line every 100px (every 5 boxes).
                    */
                    repeating-linear-gradient(
                        to right,
                        rgba(255,255,255,0.0) 0,
                        rgba(255,255,255,0.1) 1px, 
                        transparent 2px,
                        transparent 20px
                    ),
                    repeating-linear-gradient(
                        to right,
                        rgba(255,255,255,0.0) 0,
                        rgba(255,255,255,0.25) 1px,
                        transparent 1px,
                        transparent 100px
                    ),
                    repeating-linear-gradient(
                        to bottom,
                        rgba(255,255,255,0.0) 0,
                        rgba(255,255,255,0.1) 1px,
                        transparent 2px,
                        transparent 20px
                    ),
                    repeating-linear-gradient(
                        to bottom,
                        rgba(255,255,255,0.0) 0,
                        rgba(255,255,255,0.25) 1px,
                        transparent 1px,
                        transparent 100px
                    )
                `,
                backgroundSize: "40px 40px",
                boxSizing: "border-box",
                // border: "8px solid #fff",
                position: "relative",
            }}
        >
            <Outlet />
        </div>
    );
};
