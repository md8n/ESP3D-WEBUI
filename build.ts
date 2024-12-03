import { $ } from "bun";
import html from "bun-plugin-html";

const cleanDist = () => {
	console.log("No file delete function in bun yet. So no `cleanDist`");
};

const lint = async () => {
	for await (const line of $`bunx biome lint --write "./www/js/**/app.js"`.lines()) {
		console.log(line);
	}
};

const loadAndReplaceHTML = async (fileContents: string) => {
	if (!fileContents.toLowerCase().includes("loadhtml")) {
		// Leave the file as-is - and move on
		return fileContents;
	}

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
		const hFile = Bun.file(lhr[1].replace("./sub/", "./www/sub/"));
		const hText = await hFile.text();
		fcReplLoad = fcReplLoad.replace(lhr[0], hText);

		if (hText.includes("loadhtml")) {
			fcReplLoad = await loadAndReplaceHTML(fcReplLoad);
		}
	}

	return fcReplLoad;
};

const build = async () => {
	await Bun.build({
		entrypoints: [
			"./www/index.html",
			"./js/common.js",
			"./js/updatedlg.js",
			"./js/translate.js",
			"./js/UIdisableddlg.js",
			"./js/tablet.js",
			"./js/app.js",
		],
		outdir: "./dist",
		target: "browser",
		format: "esm",
		splitting: true,
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

							processor.writeFile(file.path, await loadAndReplaceHTML(fc));
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

// A collection of various functions as per the old gulp package build functionality
// var packageSeries = gulp.series(
// 	clean,
// 	lint,
// 	Copy,
// 	concatApp,
// 	includehtml,
// 	includehtml,
// 	replaceVersion,
// 	replaceSVG,
// 	clearlang,
// 	minifyApp,
// 	smoosh,
// 	compress,
// 	clean2,
// );

console.log("Running the build");
cleanDist();
// await lint();
await build();
await compress();
