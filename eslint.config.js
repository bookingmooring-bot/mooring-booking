import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    // Deno edge functions, Node scripts, the MCP server and the Expo app have their own toolchains.
    ignores: ["dist", "dev-dist", "supabase/**", "scripts/**", "mcp-server/**", "MooringBookingApp/**", "*.config.{js,ts}"],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Legacy code uses `any` widely; keep visible as a warning, not a build blocker.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
