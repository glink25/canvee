import path from "path";
import resolve from "@rollup/plugin-node-resolve"; // 依赖引用插件
import commonjs from "@rollup/plugin-commonjs"; // commonjs模块转换插件
import ts from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";

const getPath = (_path) => path.resolve(__dirname, _path);

const extensions = [".js", ".ts"];
// ts
const tsPlugin = ts({
  tsconfig: getPath("./tsconfig.json"), // 导入本地ts配置
  extensions,
});
const createCommonConfig = (name, outputName) => ({
  plugins: [
    resolve(extensions),
    commonjs(),
    json(),

    babel({
      exclude: [
        "node_modules/**",
        "packages/components/spine/spine-runtime/**",
      ],
      babelHelpers: "runtime",
    }),
    tsPlugin,
  ],
  output: {
    name: "canvee",
    file: `dist/cdn/${outputName ?? name}.esm.js`, // es6模块
    format: "es",
    plugins: [
      getBabelOutputPlugin({
        presets: ["@babel/preset-env"],
      }),
    ],
  },
});

const inputs = ["core", "components", "extensions", "utils"];
const totalConfig = {
  input: "./packages/index.ts",
  ...createCommonConfig("index"),
};
const splitConfigs = inputs.map((name) => {
  return {
    input: `./packages/${name}/index.ts`,
    ...createCommonConfig(name, name === "core" ? "index" : name),
  };
});

export default splitConfigs;
