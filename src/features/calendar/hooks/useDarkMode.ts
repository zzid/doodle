import { useEffect, useState } from "react";

/**
 * Hook to detect if the user prefers dark mode
 * Checks both system preference and document class
 */
export function useDarkMode(): boolean {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check if document has dark class
        const checkDarkClass = () => {
            return document.documentElement.classList.contains("dark");
        };

        // Check system preference
        const checkSystemPreference = () => {
            if (window.matchMedia) {
                return window.matchMedia("(prefers-color-scheme: dark)").matches;
            }
            return false;
        };

        // Initial check
        setIsDark(checkDarkClass() || checkSystemPreference());

        // Listen for system preference changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            setIsDark(checkDarkClass() || mediaQuery.matches);
        };

        // Listen for class changes on document
        const observer = new MutationObserver(() => {
            setIsDark(checkDarkClass() || mediaQuery.matches);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
            observer.disconnect();
        };
    }, []);

    return isDark;
}

