const native = require("eslint-config-universe/flat/native");

module.exports = [
  {
    ignores: ["build/**"],
  },
  ...native,
];
