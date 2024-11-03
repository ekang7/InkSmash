/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true, // Ignores config files in parent directories
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "prettier"
  ], // an array of strings where each additional configuration extends the preceding configurations
  // Reference for typescript-eslint: https://typescript-eslint.io/linting/configs
  // prettier/@typescript-eslint extension is no longer needed. https://stackoverflow.com/questions/65675771/eslint-couldnt-find-the-config-prettier-typescript-eslint-after-relocating
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // https://typescript-eslint.io/rules/no-unused-vars/
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-misused-promises": "off",
  },
};
