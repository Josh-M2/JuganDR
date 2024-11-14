const { override } = require("customize-cra");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = override((config) => {
  if (process.env.REACT_APP_NODE_ENV === "production") {
    console.log("Webpack config in production mode:", config);
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
