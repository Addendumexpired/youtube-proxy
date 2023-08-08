
const {createProxyMiddleware} = require("http-proxy-middleware");

module.exports = (req, res) => {
  let target = "https://github.com/";
  // 代理目标地址
  // 这里使用 backend 主要用于区分 vercel serverless 的 api 路径
  //   if (
  //     req.url.startsWith("/api") ||
  //     req.url.startsWith("/auth") ||
  //     req.url.startsWith("/banner") ||
  //     req.url.startsWith("/CollegeTask")
  //   ) {
  //     target = "http://106.15.2.32:6969";
  //   }



  proxy(req, res, (err) => {
    if (err) {
      console.error("Error proxying request:", err);
      return;
    }

    if (res.getHeader("content-type") && res.getHeader("content-type").includes("text/html")) {
      const originalWrite = res.write;
      const originalEnd = res.end;
      let body = "";

      res.write = (chunk, encoding) => {
        body += chunk.toString();
        originalWrite.call(res, chunk, encoding);
      };

      res.end = (chunk, encoding) => {
        if (chunk) {
          body += chunk.toString();
        }

        body = body.replace(/raw\.githubusercontent\.com/g, "raw.yttrium.eu.org");
        res.setHeader("content-length", Buffer.byteLength(body));
        originalEnd.call(res, body, encoding);
      };
    }
  });
};





  // 创建代理对象并转发请求
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // 通过路径重写，去除请求路径中的 `/backend`
      // 例如 /backend/user/login 将被转发到 http://backend-api.com/user/login
      //   "^/backend/": "/",
    },
  })(req, res);
};
