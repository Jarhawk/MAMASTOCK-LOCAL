module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-hooks/recommended"],
  settings: { react: { version: "detect" } },
  env: { browser: true, es2021: true, node: true },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "react-hooks/rules-of-hooks": "off",
    "no-undef": "off",
    "no-unused-vars": "warn"
  },
  overrides: [
    {
      files: ["**/__tests__/**", "**/*.test.*", "**/*.spec.*"],
      env: { jest: true }
    }
  ]
};
