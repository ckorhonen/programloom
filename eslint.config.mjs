import babelParser from "@babel/eslint-parser";
import syntaxJsx from "@babel/plugin-syntax-jsx";
import syntaxTypescript from "@babel/plugin-syntax-typescript";

export default [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      "node_modules/**",
      "data/**",
      "artifacts/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*"],
    ignores: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        sourceType: "module",
        babelOptions: {
          babelrc: false,
          configFile: false,
          plugins: [[syntaxTypescript, { isTSX: true }], syntaxJsx],
        },
      },
    },
    rules: {
      "no-console": "warn",
      "no-unused-vars": "off",
    },
  },
];
