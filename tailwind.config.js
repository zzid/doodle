/** @type {import('tailwindcss').Config} */
module.exports = {
    // 앱 셸이 항상 다크 배경이므로 OS 설정과 무관하게 다크 팔레트를 쓴다 (html.dark)
    darkMode: "class",
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
