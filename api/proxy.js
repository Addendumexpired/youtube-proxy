const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  let target = "https://github.com/";

  // 创建代理对象
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    // 在这里可以添加其他代理配置
  });

  // 使用代理对象处理请求
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
