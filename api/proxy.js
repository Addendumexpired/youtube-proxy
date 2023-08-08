const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (req, res) => {
  const target = "https://github.com/";
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
  });

  proxy(req, res, (err) => {
    if (err) {
      console.error("Error proxying request:", err);
      return;
    }

    if (res.getHeader("location")) {
      const locationHeader = res.getHeader("location");
      const newLocationHeader = locationHeader.replace(
        /raw\.githubusercontent\.com/g,
        "raw.yttrium.eu.org"
      );
      res.setHeader("location", newLocationHeader);
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
