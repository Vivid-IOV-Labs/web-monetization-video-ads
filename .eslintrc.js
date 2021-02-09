module.exports = {
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
  env: {
    es6: true,
    browser: true,
    "jest/globals": true,
  },
  plugins: ["prettier", "jest"],
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:jest/recommended",
  ],
  rules: {},
  globals: {},
};
