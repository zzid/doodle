const fs = require("fs");
const path = require("path");
const {
    getLoader,
    loaderByName,
    removePlugins,
    pluginByName,
} = require("@craco/craco");
const cracoBabelLoader = require("craco-babel-loader");
const { CracoAliasPlugin } = require("react-app-alias");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);
const useSourceMap = process.env.USE_SOURCE_MAP ?? true;

module.exports = {
    webpack: {
        configure: (webpackConfig, { env }) => {
            const isProd = env === "production";
            removePlugins(
                webpackConfig.resolve,
                pluginByName("ModuleScopePlugin")
            );

            const { isFound, match } = getLoader(
                webpackConfig,
                loaderByName("babel-loader")
            );

            if (isFound) {
                match.loader.include = undefined;
                match.loader.exclude = /node_modules/;
            }

            webpackConfig.devtool = useSourceMap ? "source-map" : false;

            return webpackConfig;
        },
    },
    babel: {
        presets: [
            ["@babel/preset-env", { loose: true }],
            ["@babel/preset-react", { runtime: "automatic" }],
            "@babel/preset-typescript",
        ],
        plugins: ["babel-plugin-styled-components"],
    },
    plugins: [
        {
            plugin: CracoAliasPlugin,
            options: {
                source: "tsconfig",
                baseUrl: "src",
                tsconfigPath: "./tsconfig.paths.json",
            },
        },
        {
            plugin: cracoBabelLoader,
            options: {
                includes: [
                    resolveApp("./src"),
                    resolveApp("../../packages/core"),
                    resolveApp("../../apps"),
                ],
            },
        },
    ],
};
