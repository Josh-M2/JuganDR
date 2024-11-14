const { override } = require("customize-cra");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = override((config) => {
  if (process.env.NODE_ENV === "production") {
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ];
  }
  return config;
});
