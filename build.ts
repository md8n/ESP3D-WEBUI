import html from "bun-plugin-html";

const cleanDist = () => {
	console.log("No file delete function in bun yet. So no `cleanDist`");
};

const loadAndReplaceHTML = async (filePath: string, fileContents: string) => {
	const fcLower = fileContents.toLowerCase();
	const hasLoadHTML = fcLower.includes("loadhtml");
	const hasSVG = fcLower.includes(".svg");
	console.log(`Processing '${filePath}'`);
	if (!hasLoadHTML && !hasSVG) {
		// Leave the file as-is - and move on
		console.log(`No 'loadhtml' or '.svg' in '${filePath}'`);
		return fileContents;
	}

	let fcProcessed = fileContents;

	if (hasLoadHTML) {
		console.log(`Processing '${filePath}' for included HTML files`);
		// Remove the script that does the html loading - we won't need it after bundling
		const regexScript = /\<script.*loadhtml.*>\<\/script>/gim;
		const fcNoLoad = fileContents.replace(regexScript, "");

		// Now find all of the places where the above script was used
		const regexHTML =
			/\<div\s+id\s*=\s*['"](?<htmlpath>.*\.html)['"]\s*class.*loadhtml.*><\/div>/gm;
		const loadHTMLResults = [...fcNoLoad.matchAll(regexHTML)];
		if (!loadHTMLResults.length) {
			// Leave the file as-is-ish - and move on
			return fcNoLoad;
		}

		// Finally replace the original `div` with the actual file
		let fcReplLoad = fcNoLoad;
		for (let ix = 0; ix < loadHTMLResults.length; ix++) {
			const lhr = loadHTMLResults[ix];
			const childFilePath = lhr[1].replace("./sub/", "./www/sub/");
			const hFile = Bun.file(childFilePath);
			const hText = await hFile.text();
			if (hText.includes(".svg")) {
				const regexSVG = /\<img\s+src\s*=\s*['"](?<svgpath>.*\.svg)['"].*><\/img>/gmi;
				const findSVGResults = [...hText.matchAll(regexSVG)];
				if (findSVGResults.length) {
					console.log(`found that svg in ${childFilePath}`);
					for (let jx = 0; jx < findSVGResults.length; jx++) {
						const svr = findSVGResults[jx];
						console.log(`it is ${svr[1]}`);
					}
				}
			}
			fcReplLoad = fcReplLoad.replace(lhr[0], hText);

			if (hText.includes("loadhtml")) {
				fcReplLoad = await loadAndReplaceHTML(childFilePath, fcReplLoad);
			}
		}

		fcProcessed = fcReplLoad;
	}

	return fcProcessed;
};

const build = async () => {
	await Bun.build({
		entrypoints: ["./www/index.html", "./js/app.js"],
		outdir: "./dist",
		target: "browser",
		format: "esm",
		splitting: false,
		naming: "[dir]/[name].[ext]",
		minify: false,
		plugins: [
			html({
				inline: true,
				keepOriginalPaths: true,
				async preprocessor(processor) {
					const files = processor.getFiles();

					for (const file of files) {
						// if (file.path.endsWith("app.js")) {
						// 	// Remove the loadHTML.js import
						// 	const fa = await file.content;
						// 	processor.writeFile(file.path, fa.replace('import { loadedHTML } from "./loadHTML.js";', 'let loadedHTML:any;'));
						// }
						if (file.extension === ".html") {
							const fc = await file.content;

							processor.writeFile(file.path, await loadAndReplaceHTML(file.path, fc));
						}
					}
				},
			}),
		],
	});
};

const compress = async () => {
	const indexFile = Bun.file("./dist/index.html");
	const data = await indexFile.arrayBuffer();
	const compressed = Bun.gzipSync(data, { level: 9 });
	Bun.write("./dist/index.html.gz", compressed);
};

console.log("Running the build");
cleanDist();
await build();
await compress();
