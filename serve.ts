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
    const sendFile = async (path: string, contentType: string = "text/plain") => {
      const checkFile = await fileExists(path);
      if (checkFile) {
        return new Response(checkFile, {headers: {"Content-Type": contentType}});
      }
      // Note that the following statusText is unlikely to show up in the browser's dev/debug window
      return new Response(null, { status: 404, statusText: `404 requesting '${url.pathname}' translated to '${path}`});
    }
    if (url.pathname.endsWith(".html")) return sendFile(`./www${url.pathname}`, "text/html");
    if (url.pathname.endsWith(".js")) return sendFile(`./www${url.pathname}`, "text/javascript");
    if (url.pathname.endsWith(".css")) return sendFile(`./www${url.pathname}`, "text/css");
    if (url.pathname.includes("/js/")) {
      const checkFileBase = `./www${url.pathname}`;
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