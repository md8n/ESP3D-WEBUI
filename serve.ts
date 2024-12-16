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

    // Handle the special files
    if (checkFileBase.endsWith("langUtils.js")) {
      // The language utilities JS file, that brings all the translated languages together
      // We'll be adding all of the required imports to this, for it to have all languages

      const checkFile = Bun.file(checkFileBase);
      if (await checkFile.exists()) {
        const langUtilsFile = [];
        /** This shgould correspiond exactly with `language_list in `langUtils.js` */
        const language_list = [
          ["de", "germantrans"],
          ["en", "englishtrans"],
          ["es", "spanishtrans"],
          ["fr", "frenchtrans"],
          ["it", "italiantrans"],
          ["ja", "japanesetrans"],
          ["hu", "hungariantrans"],
          ["pl", "polishtrans"],
          ["ptbr", "ptbrtrans"],
          ["ru", "russiantrans"],
          ["tr", "turkishtrans"],
          ["uk", "ukrtrans"],
          ["zh_CN", "zh_CN_trans"],
        ];
        for (let ix = 0; ix < language_list.length; ix++) {
          const lang = language_list[ix];
          langUtilsFile.push(`import ${lang[1]} from "./language/${lang[0]}.json" with {type: "json"};`);
        }
        // Add in the original file
        langUtilsFile.push(await checkFile.text());
        return new Response(langUtilsFile.join("\n"), {headers: {"Content-Type": "text/javascript"}});
      }
    }

    if (checkFileBase.endsWith(".svg")) {
      console.log(`Want SVG at '${checkFileBase}`);
      return sendFile(checkFileBase, "text/svg+xml");
    }

    // Handle the regular file and mime types to send
    const regSendFiles = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".json": "application/json",
      ".css": "text/css"
    }
    for (const [fileExt, mimeType] of Object.entries(regSendFiles)) {
      if (checkFileBase.endsWith(fileExt)) return sendFile(checkFileBase, mimeType);
    }

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