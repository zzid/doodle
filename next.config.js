// 게임 유틸은 /private/* 아래로 옮겼다. 예전 주소 북마크용 리다이렉트.
const MOVED_TO_PRIVATE = [
    "symbol",
    "mvp",
    "exp-coupon",
    "calendar",
    "maple-calendar",
    "mepo",
    "event-2412",
    "event-2408",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async redirects() {
        return MOVED_TO_PRIVATE.map((p) => ({
            source: `/${p}/:rest*`,
            destination: `/private/${p}/:rest*`,
            permanent: false,
        }));
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "@": require("path").resolve(__dirname, "./src"),
        };
        return config;
    },
};

module.exports = nextConfig;
