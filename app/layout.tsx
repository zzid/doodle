"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeProvider } from "@emotion/react";
import "@/styles/index.css";
import "@/dayjs/dayjs";
// 앱 셸이 항상 다크 배경이므로 OS 설정과 무관하게 다크 팔레트 하나만 사용한다.
const theme = {
    colors: {
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
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <html lang="ko" className="dark">
            <body>
                <ThemeProvider theme={theme}>
                    <div
                        style={{
                            margin: 0,
                            padding: 0,
                            minHeight: "100vh",
                            minWidth: "100vw",
                            backgroundColor: "#181a20",
                            backgroundImage: `
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
                            position: "relative",
                        }}
                    >
                        {/* Sticky header */}
                        <header
                            style={{
                                position: "sticky",
                                top: 0,
                                zIndex: 50,
                                background: "rgba(24,26,32,0.9)", // slightly transparent for effect
                                backdropFilter: "blur(8px)",
                                borderBottom:
                                    "1px solid rgba(255,255,255,0.07)",
                                display: "flex",
                                alignItems: "center",
                                height: "56px",
                                padding: "0 1rem",
                                gap: "1rem",
                            }}
                        >
                            {/* empty right space for symmetry */}
                            <span style={{ width: 64, display: "block" }} />
                            <div
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    fontSize: "1.2rem",
                                    fontWeight: 700,
                                    color: "#f1f5f9",
                                    letterSpacing: "0.02em",
                                    textShadow: "0 1px 3px rgba(24,26,32,0.12)",
                                    lineHeight: "1",
                                }}
                            >
                                zzid's Doodle
                            </div>
                            <Link
                                href="/"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    background: "rgba(96,165,250,0.15)",
                                    borderRadius: "6px",
                                    padding: "6px 12px",
                                    color: "#60a5fa",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    fontSize: "1rem",
                                    marginRight: 10,
                                    marginBottom: 20,
                                }}
                                aria-label="홈으로"
                            >
                                <span
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M3 10L10 3L17 10"
                                            stroke="#60a5fa"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M5 10V17H15V10"
                                            stroke="#60a5fa"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </Link>
                        </header>
                        {/* End sticky header */}
                        {mounted ? children : null}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
