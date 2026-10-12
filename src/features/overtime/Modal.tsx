import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { fastTransition } from "@/config/motion";

/** 화면 중앙 모달. 바깥 클릭 / ESC 로 닫힌다 (브라우저 confirm() 대신 직접 그린다) */
export function Modal({
    open,
    onClose,
    labelledBy,
    role = "dialog",
    className = "max-w-sm",
    children,
}: {
    open: boolean;
    onClose: () => void;
    labelledBy?: string;
    role?: "dialog" | "alertdialog";
    className?: string;
    children: React.ReactNode;
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={fastTransition}
                    onClick={onClose}
                >
                    <motion.div
                        role={role}
                        aria-modal="true"
                        aria-labelledby={labelledBy}
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={fastTransition}
                        onClick={(e) => e.stopPropagation()}
                        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-line/10 bg-surface p-5 shadow-2xl shadow-black/50 ${className}`}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
