module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb-base", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": 1,
    "max-classes-per-file": ["error", 5],
    "import/no-unresolved": [0, { commonjs: true }],
    "no-undef": ["off", { typeof: true }],
    "import/extensions": ["off"],
    "no-unused-expressions": ["error", { allowShortCircuit: true }],
    "no-param-reassign": ["off"],
    "no-unused-vars": ["off"],
    "no-case-declarations": "off",
    "class-methods-use-this": "off",
    "no-shadow": ["off"],
    "@typescript-eslint/no-shadow": ["error"],
    "no-plusplus": ["error", { allowForLoopAfterthoughts: true }],
  },
};
