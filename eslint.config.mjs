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
  ...compat.extends(
    "next/core-web-vitals", 
    "next/typescript",
    "prettier" // Add prettier to ensure ESLint doesn't conflict with Prettier
  ),

  // Add rules for detecting unused variables
  {
    rules: {
      // Warn about unused variables and parameters
      "no-unused-vars": ["warn", { 
        vars: "all", 
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      
      // TypeScript specific unused variable rule (preferred over no-unused-vars for TS files)
      "@typescript-eslint/no-unused-vars": ["warn", { 
        vars: "all", 
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_"
      }],
      
      // Integrate prettier with ESLint
      "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    }
  },
  
  // Plugin for Prettier integration
  {
    plugins: {
      prettier: prettierPlugin,
    },
  }
];

export default eslintConfig;
