import tseslint from "typescript-eslint";

const eslintConfig = [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/dist/**"
    ]
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
    }
  }
];

export default eslintConfig;
