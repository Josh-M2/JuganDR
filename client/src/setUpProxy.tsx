const { createProxyMiddleware } = require("http-proxy-middleware");
import { Express } from "express";

module.exports = function (app: Express) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
    })
  );
};
