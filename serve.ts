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
    if (url.pathname.endsWith(".html")) return new Response(await Bun.file(`./www${url.pathname}`).bytes(), {
      headers: {
        "Content-Type": "text/html",
      },
    });
    if (url.pathname.endsWith(".js")) return new Response(await Bun.file(`./www${url.pathname}`).bytes(), {
      headers: {
        "Content-Type": "text/javascript",
      },
    });
    if (url.pathname.startsWith("/js/")) {
      const checkFileName = `./www${url.pathname}`;
      let checkFile = Bun.file(`${checkFileName}.js`);
      let checkFileExists = await checkFile.exists();
      if (!checkFileExists) {
        checkFile = Bun.file(`${checkFileName}.ts`);
        checkFileExists = await checkFile.exists();
      }
      if (checkFileExists) {
        return new Response(await checkFile.bytes(), {
          headers: {
            "Content-Type": "text/javascript",
          },
        });
      }
    }
    return new Response(`404 for your '${url.pathname}' request`);
  },
});

console.log(`Listening on http://localhost:${server.port} ...`);