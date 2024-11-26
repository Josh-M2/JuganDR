const { whenProd } = require("@craco/craco");

module.exports = {
  babel: {
    plugins: whenProd(
      () => [["transform-remove-console", { exclude: ["error", "warn"] }]],
      []
    ),
  },
};
