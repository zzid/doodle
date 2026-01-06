/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Only use basePath for GitHub Pages deployment
    // For Vercel, leave basePath empty (deploy to root domain)
    basePath: process.env.GITHUB_PAGES === "true" ? "/doodle" : "",
    assetPrefix: process.env.GITHUB_PAGES === "true" ? "/doodle" : "",
    // For static export (GitHub Pages)
    // output: 'export',
    // images: {
    //   unoptimized: true,
    // },
    compiler: {
        emotion: true,
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
