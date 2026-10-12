import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PictureInPicture2 } from "lucide-react";
import { GhostButton } from "@/features/symbol/components/ui";

/**
 * 항상 위에 떠 있는 작은 창.
 *
 * - Chrome·Edge 데스크탑: Document Picture-in-Picture (다른 앱 위에 항상 표시)
 * - 그 외 데스크탑: 작은 팝업 창 (항상 위에 뜨지는 않음)
 * - 모바일: 지원하는 방법이 없어 버튼을 숨긴다
 */

declare global {
    interface Window {
        documentPictureInPicture?: {
            requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
            window: Window | null;
        };
    }
}

const SIZE = { width: 340, height: 196 };

/** 원래 문서의 스타일(Tailwind, 폰트)을 새 창에 복사 */
function copyStyles(target: Window) {
    for (const sheet of Array.from(document.styleSheets)) {
        try {
            const style = target.document.createElement("style");
            style.textContent = Array.from(sheet.cssRules)
                .map((r) => r.cssText)
                .join("\n");
            target.document.head.appendChild(style);
        } catch {
            // 다른 출처 스타일시트(폰트 CDN 등)는 cssRules 를 못 읽으니 링크로 붙인다
            if (sheet.href) {
                const link = target.document.createElement("link");
                link.rel = "stylesheet";
                link.href = sheet.href;
                target.document.head.appendChild(link);
            }
        }
    }
    target.document.documentElement.className = document.documentElement.className;
    target.document.body.className = "m-0 overflow-hidden bg-bg text-content antialiased";
}

export function useMiniWindow(title: string) {
    const [win, setWin] = useState<Window | null>(null);
    const [supported, setSupported] = useState(false);
    const isPip = typeof window !== "undefined" && "documentPictureInPicture" in window;

    useEffect(() => {
        const coarse = window.matchMedia("(pointer: coarse)").matches;
        setSupported(!coarse);
    }, []);

    const open = useCallback(async () => {
        if (win) {
            win.focus();
            return;
        }
        let w: Window | null = null;
        if (window.documentPictureInPicture) {
            w = await window.documentPictureInPicture.requestWindow(SIZE);
        } else {
            w = window.open(
                "",
                "doodle-earning-mini",
                `width=${SIZE.width},height=${SIZE.height},menubar=no,toolbar=no,location=no,status=no`
            );
            if (w) w.document.body.innerHTML = "";
        }
        if (!w) return;
        w.document.title = title;
        copyStyles(w);
        w.addEventListener("pagehide", () => setWin(null), { once: true });
        setWin(w);
    }, [win, title]);

    // 원래 페이지를 떠나면 미니 창도 닫는다
    useEffect(() => () => win?.close(), [win]);

    return { win, open, close: () => win?.close(), supported, isPip };
}

export function MiniWindowButton({
    active,
    isPip,
    onClick,
}: {
    active: boolean;
    isPip: boolean;
    onClick: () => void;
}) {
    return (
        <GhostButton
            onClick={onClick}
            title={isPip ? "다른 창 위에 항상 떠 있는 작은 창으로 보기" : "작은 팝업 창으로 보기"}
            className={`flex items-center gap-1.5 ${active ? "!border-accent/50 !bg-accent/15 !text-accent" : ""}`}
        >
            <PictureInPicture2 size={13} />
            {active ? "미니 창 닫기" : "미니 창으로 보기"}
        </GhostButton>
    );
}

export function MiniWindowPortal({ win, children }: { win: Window | null; children: React.ReactNode }) {
    if (!win) return null;
    return createPortal(children, win.document.body);
}
