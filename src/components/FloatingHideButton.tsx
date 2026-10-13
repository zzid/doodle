import React from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * 화면 왼쪽 아래에 떠 있는 금액 가리기 버튼 (공통).
 * 페이지 안의 기존 가림 버튼과 같은 설정을 넘겨받아 쓴다 — 어느 쪽을 눌러도 함께 바뀐다.
 */
export function FloatingHideButton({ hidden, onToggle }: { hidden: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            aria-pressed={hidden}
            aria-label={hidden ? "금액 보이기" : "금액 가리기"}
            title={hidden ? "금액 보이기" : "금액 가리기"}
            className={`fixed bottom-5 left-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg shadow-black/40 backdrop-blur transition hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${
                hidden
                    ? "border-accent/50 bg-accent/20 text-accent"
                    : "border-line/10 bg-surface/80 text-muted hover:text-content"
            }`}
        >
            {hidden ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
    );
}
