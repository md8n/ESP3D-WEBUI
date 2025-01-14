import EEPROMFake from "./EEPROMDummyResponse.json" with { type: "json" };

const server = Bun.serve({
	port: 3000,
	static: {
		// serve a file by buffering it in memory
		"/index.html": new Response(await Bun.file("./www/index.html").bytes(), {
			headers: { "Content-Type": "text/html" },
		}),
		"/favicon.ico": new Response(await Bun.file("./favicon.ico").bytes(), {
			headers: { "Content-Type": "image/x-icon" },
		}),
	},
	async fetch(req) {
		const url = new URL(req.url);

		// Request (0 KB) {
		//   method: "GET",
		//   url: "http://localhost:3000/command?plain=%5BESP800%5D&PAGEID=",
		//   headers: Headers {
		//     "host": "localhost:3000",
		//     "connection": "keep-alive",
		//     "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
		//     "dnt": "1",
		//     "accept": "*/*",
		//     "sec-fetch-mode": "cors",
		//     "sec-fetch-dest": "empty",
		//     "referer": "http://localhost:3000/index.html",
		//     "accept-encoding": "gzip, deflate, br, zstd",
		//     "accept-language": "en-AU,en;q=0.9,en-US;q=0.8",
		//     "sec-ch-ua-platform": "\"Windows\"",
		//     "sec-ch-ua": "\"Microsoft Edge\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
		//     "sec-ch-ua-mobile": "?0",
		//     "sec-fetch-site": "same-origin",
		//     "sec-gpc": "1",
		//   }
		// }

		// URL {
		//   href: "http://localhost:3000/command?plain=%5BESP800%5D&PAGEID=",
		//   origin: "http://localhost:3000",
		//   protocol: "http:",
		//   username: "",
		//   password: "",
		//   host: "localhost:3000",
		//   hostname: "localhost",
		//   port: "3000",
		//   pathname: "/command",
		//   hash: "",
		//   search: "?plain=%5BESP800%5D&PAGEID=",
		//   searchParams: URLSearchParams {
		//     "plain": "[ESP800]",
		//     "PAGEID": "",
		//   },
		//   toJSON: [Function: toJSON],
		//   toString: [Function: toString],
		// }

		const fileExists = async (path: string) => {
			const checkFile = Bun.file(path);
			return (await checkFile.exists()) ? await checkFile.bytes() : null;
		};

		const sendFile = async (path: string, contentType = "text/plain") => {
			const checkFile = await fileExists(path);
			if (checkFile) {
				return new Response(checkFile, { headers: { "Content-Type": contentType } });
			}
			const errText = `404 requesting '${url.pathname}' translated to '${path}`;
			console.error(errText);
			// Note that the following statusText is unlikely to show up in the browser's dev/debug window
			return new Response(null, { status: 404, statusText: errText });
		};

		if (url.pathname === "/command") {
			// Set up some dummy responses for local testing

			const searchParams = url.searchParams;
			const plain = searchParams.get("plain");
			const commandText = searchParams.get("commandText");

			if (plain) {
				switch (plain) {
					case "[ESP800]": {
						const body =
							"FW version: FakeFluidNC v0.654 # FW target:grbl-embedded  # FW HW:Direct SD  # primary sd:/sd # secondary sd:none  # authentication:no # webcommunication: Sync: 81:192.168.1.100 # hostname:maslow # axis:3";
						return new Response(body, { status: 200 });
					}
					case "[ESP400]": {
            const body = JSON.stringify(EEPROMFake);
						return new Response(body, { status: 200 });
          }
					default:
						console.info(url);
						break;
				}
			}
			if (commandText) {
				switch (commandText) {
					case "$Report/Interval=50": {
						const body = "Error";
						return new Response(body, { status: 200 });
					}
					default:
						console.info(url);
            return new Response("", { status: 200 });
				}
			}
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
				return new Response(langUtilsFile.join("\n"), { headers: { "Content-Type": "text/javascript" } });
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
			".css": "text/css",
		};
		for (const [fileExt, mimeType] of Object.entries(regSendFiles)) {
			if (checkFileBase.endsWith(fileExt)) {
				return sendFile(checkFileBase, mimeType);
			}
		}

		if (checkFileBase.includes("/js/")) {
			let checkFileName = `${checkFileBase}.js`;
			let checkFile = fileExists(checkFileName);
			if (!checkFile) {
				checkFileName = `${checkFileBase}.ts`;
				checkFile = fileExists(checkFileName);
			}
			if (checkFile) {
				return new Response(await checkFile, { headers: { "Content-Type": "text/javascript" } });
			}
		}
		return new Response(null, { status: 404, statusText: `404 for your '${url.pathname}' request` });
	},
});

// FW version: FluidNC v0.87 (Maslow-Main-ec171155-dirty) # FW target:grbl-embedded  # FW HW:Direct SD  # primary sd:/sd # secondary sd:none  # authentication:no # webcommunication: Sync: 81:192.168.1.100 # hostname:maslow # axis:3

console.log(`Listening on http://localhost:${server.port} ...`);
