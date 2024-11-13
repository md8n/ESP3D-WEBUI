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
        if (url.pathname === "/") return new Response("Home page!");
        if (url.pathname === "/blog") return new Response("Blog!");
        if (url.pathname.endsWith("js")) return new Response(await Bun.file(`./www/${url.pathname}`).bytes(), {
            headers: {
                "Content-Type": "text/javascript",
            },
        })
        return new Response("404!");
    },
  });
  
  console.log(`Listening on http://localhost:${server.port} ...`);