"use client";

import React, { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { SiteHeader } from "@/components/SiteHeader";
import { EASE_OUT } from "@/config/motion";
import "@/styles/index.css";
import "@/dayjs/dayjs";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 다수 페이지가 dayjs() 기준으로 렌더링돼 서버/클라이언트 마크업이 달라진다.
    // 헤더는 정적이라 즉시 그리고, 본문만 마운트 후에 그려 hydration 불일치를 피한다.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <html lang="ko" className="dark">
            <body>
                {/* reducedMotion="user" → OS 의 "동작 줄이기" 설정을 전역으로 존중 */}
                <MotionConfig
                    reducedMotion="user"
                    transition={{ duration: 0.22, ease: EASE_OUT }}
                >
                    <div className="app-shell">
                        <SiteHeader />
                        <main>{mounted ? children : null}</main>
                    </div>
                </MotionConfig>
            </body>
        </html>
    );
}
