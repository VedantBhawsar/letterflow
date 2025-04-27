import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierPlugin from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. Extended Configurations (Base rules from Next.js and Prettier)
  ...compat
    .extends("next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier")
    .map((config) => ({
      ...config,
      files: ["**/*.{ts,tsx,js,jsx}"],
      // Convert all rules to warnings
      rules: Object.fromEntries(
        Object.entries(config.rules || {}).map(([key, value]) => {
          // If the rule is an array with "error" as first element, replace with "warn"
          if (Array.isArray(value) && value[0] === "error") {
            return [key, ["warn", ...value.slice(1)]];
          }
          // If the rule is just "error", replace with "warn"
          return [key, value === "error" ? "warn" : value];
        })
      ),
    })),

  // 2. Plugin for Prettier Integration
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": ["warn", {}, { usePrettierrc: true }],
    },
  },

  // 3. Custom Rule Overrides for TypeScript files
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      // Convert remaining TS rules to warn
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/ban-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/no-inferrable-types": "warn",
      "@typescript-eslint/no-var-requires": "warn",
    },
  },

  // 4. Overrides for JS files
  {
    files: ["**/*.{js,jsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": [
        "warn",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },

  // 5. Global rule override to ensure all remaining rules are warnings
  {
    rules: {
      "react/react-in-jsx-scope": "warn",
      "react/display-name": "warn",
      "react/jsx-key": "warn",
      "react/jsx-no-target-blank": "warn",
      "react/no-unescaped-entities": "warn",

      // Import rules
      "import/no-anonymous-default-export": "warn",

      // Common core rules
      "no-console": "warn",
      "no-debugger": "warn",
      "no-alert": "warn",
      "no-duplicate-case": "warn",
      "no-duplicate-imports": "warn",
      "no-empty": "warn",
      "no-extra-boolean-cast": "warn",
    },
  },

  // 6. File/directory ignores
  {
    ignores: [
      ".next/",
      "node_modules/",
      "dist/",
      "out/",
      "build/",
      "public/",
      "*.config.js",
      "*.config.ts",
    ],
  },
];

export default eslintConfig;
