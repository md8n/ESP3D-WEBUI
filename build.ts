import html from "bun-plugin-html";

const cleanDist = () => {
	console.log("No file delete function in bun yet. So no `cleanDist`");
	
	console.log(Bun.env.npm_lifecycle_script);
}

const cleanLanguageImports = async (fileContents: string, inclLang: string[] = ["en"]) => {
	const regexRemoveIf = /\/\/\s*removeIf\s*\(\s*(?<removeDec>\S+)\s*\)/gmi;

	const removeIfResults = [...fileContents.matchAll(regexRemoveIf)];
	if (!removeIfResults.length) {
		return fileContents;
	}


	// Remove the (not) required stuff from the fileContents
	let fcRemoved = fileContents;
	for (let ix = 0; ix < removeIfResults.length; ix++) {
		const rir = removeIfResults[ix];
		console.log(`Found for removal '${rir[1]}'`);
	}
	return fcRemoved;
}

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
			let hText = await hFile.text();
			if (hText.includes(".svg")) {
				const regexSVG = /\<img\s+src\s*=\s*['"](?<svgpath>.*\.svg)['"].*><\/img>/gmi;
				const findSVGResults = [...hText.matchAll(regexSVG)];
				if (findSVGResults.length) {
					console.log(`found SVGs in ${childFilePath}`);
					for (let jx = 0; jx < findSVGResults.length; jx++) {
						const svr = findSVGResults[jx];
						const svgPath = svr[1].replace("../images/", "./www/images/");
						const svgFile = Bun.file(svgPath);
						const svgExists = await svgFile.exists();
						if (svgExists) {
							hText = hText.replace(svr[0], await svgFile.text());
						}
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
		minify: true,
		plugins: [
			html({
				inline: true,
				keepOriginalPaths: true,
				async preprocessor(processor) {
					const files = processor.getFiles();

					for (const file of files) {
						if (file.extension === ".html") {
							// We process html files last
							continue;
						}
						console.log(`Processing '${file.path}'`);
						if (file.path.endsWith("common.js")) {
							const fcRemoved = await cleanLanguageImports(await file.content);
							// processor.writeFile(file.path, fcRemoved);
						}
					}

					for (const file of files) {
						if (file.extension !== ".html") {
							// Now we're only processing html files
							continue;
						}
						console.log(`Processing '${file.path}'`);
						const fc = await file.content;
						processor.writeFile(file.path, await loadAndReplaceHTML(file.path, fc));
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
