module.exports = {
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  env: {
    es6: true,
    browser: true,
  },
  plugins: ["prettier", "jest"],
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  rules: {},
  globals: {},
};
