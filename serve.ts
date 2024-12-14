const server = Bun.serve({
  port: 3000,
  static: {
    // serve a file by buffering it in memory
    "/index.html": new Response(await Bun.file("./www/index.html").bytes(), {
      headers: {
        "Content-Type": "text/html",
      },
    }),
    "/favicon.ico": new Response(await Bun.file("./favicon.ico").bytes(), {
      headers: {
        "Content-Type": "image/x-icon",
      },
    }),
  },
  async fetch(req) {
    const url = new URL(req.url);
    const fileExists = async (path: string) => {
      const checkFile = Bun.file(path);
      return (await checkFile.exists()) ? await checkFile.bytes() : null;
    }
    const sendFile = async (path: string, contentType = "text/plain") => {
      const checkFile = await fileExists(path);
      if (checkFile) {
        return new Response(checkFile, {headers: {"Content-Type": contentType}});
      }
      const errText = `404 requesting '${url.pathname}' translated to '${path}`;
      console.error(errText);
      // Note that the following statusText is unlikely to show up in the browser's dev/debug window
      return new Response(null, { status: 404, statusText: errText});
    }
    const checkFileBase = `./www${url.pathname}`;
    if (checkFileBase.endsWith(".html")) return sendFile(checkFileBase, "text/html");
    if (checkFileBase.endsWith(".svg")) {
      console.log(`Want SVG at '${checkFileBase}`);
      return sendFile(checkFileBase, "text/svg+xml");
    }
    if (checkFileBase.endsWith(".js")) return sendFile(checkFileBase, "text/javascript");
    if (checkFileBase.endsWith(".json")) return sendFile(checkFileBase, "application/json");
    if (checkFileBase.endsWith(".css")) return sendFile(checkFileBase, "text/css");
    if (checkFileBase.includes("/js/")) {
      let checkFileName = `${checkFileBase}.js`;
      let checkFile = fileExists(checkFileName);
      if (!checkFile) {
        checkFileName = `${checkFileBase}.ts`;
        checkFile = fileExists(checkFileName);
      }
      if (checkFile) {
        return new Response(await checkFile, {
          headers: {
            "Content-Type": "text/javascript",
          },
        });
      }
    }
    return new Response(null, { status: 404, statusText: `404 for your '${url.pathname}' request` });
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);