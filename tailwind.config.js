/** @type {import('tailwindcss').Config} */

// 색상 토큰은 src/styles/index.css 의 CSS 변수가 단일 소스다.
// 여기서는 그 변수를 Tailwind 의 시맨틱 이름으로 노출하기만 한다.
// "R G B" 채널로 저장돼 있어 알파 수식어(bg-surface/70)도 그대로 동작한다.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

module.exports = {
    // 앱 셸이 항상 다크 배경이므로 OS 설정과 무관하게 다크 팔레트를 쓴다 (html.dark)
    darkMode: "class",
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: token("bg"),
                surface: token("surface"),
                raised: token("raised"),
                content: token("text"),
                muted: token("muted"),
                faint: token("faint"),
                accent: token("accent"),
                "accent-strong": token("accent-strong"),
                warn: token("warn"),
                good: token("good"),
                danger: token("danger"),
                line: token("line"),
            },
            transitionTimingFunction: {
                out: "var(--ease-out)",
            },
            transitionDuration: {
                fast: "var(--dur-fast)",
                base: "var(--dur-base)",
            },
            keyframes: {
                "fade-up": {
                    from: { opacity: "0", transform: "translateY(8px)" },
                    to: { opacity: "1", transform: "none" },
                },
            },
            animation: {
                "fade-up": "fade-up var(--dur-base) var(--ease-out) both",
            },
        },
    },
    plugins: [],
};
