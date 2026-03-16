import js from "@eslint/js";

export default [
  {
    ignores: ["dist/", "coverage/", "node_modules/", "*.config.js", ".angular/"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    }
  }
];
