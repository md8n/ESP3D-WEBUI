import html from "bun-plugin-html";
import { platform } from "bun-utilities/os";
import { minifySync } from "@swc/html";

const cleanDist = () => {
	console.log("No file delete function in bun yet. So no `cleanDist`");

	console.log(Bun.env.npm_lifecycle_script);
	console.log(import.meta.dir);
};

const pathDiv = (path: string) => path.replaceAll("\\", platform() !== "windows" ? "/" : "\\\\");

const limitedLanguageImports = async (fileContents: string, inclLang: string[] = ["en"]) => {
	const langUtilsFile = [];
	/** This shgould correspond exactly with `language_list in `langUtils.js` */
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
		if (inclLang.includes(lang[0])) {
			const absPath = pathDiv(`${import.meta.dir}\\www\\js\\language\\${lang[0]}.json`);
			langUtilsFile.push(`import ${lang[1]} from "${absPath}" with {type: "json"};`);
		}
	}
	// Add in the original file
	langUtilsFile.push(fileContents);

	return langUtilsFile.join("\n");
};

/** Change all import filepaths to their absolute version */
const absolutifyImports = async (fileContents: string) => {
	const regexImp = /}\s*from\s*['"](?<imppath>.*)['"]\;/gm;
	const impResults = [...fileContents.matchAll(regexImp)];
	if (!impResults.length) {
		// Leave the file as-is - and move on
		return fileContents;
	}

	let fcAbsImp = fileContents;
	const repPath = `${import.meta.dir}\\www\\js\\`;
	for (let ix = 0; ix < impResults.length; ix++) {
		const ir = impResults[ix];
		const impFilePath = pathDiv(ir[1].replace("./", repPath));
		fcAbsImp = fcAbsImp.replace(ir[1], impFilePath);
	}
	return fcAbsImp;
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
		const regexHTML = /\<div\s+id\s*=\s*['"](?<htmlpath>.*\.html)['"]\s*class.*loadhtml.*><\/div>/gm;
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
				const regexSVG = /\<img\s+src\s*=\s*['"](?<svgpath>.*\.svg)['"].*><\/img>/gim;
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
		minify: false,
		plugins: [
			html({
				inline: true,
				keepOriginalPaths: false,
				async preprocessor(processor) {
					const files = processor.getFiles();

					// CSS also gets processed, but it falls right through this loop unaffected

					//  Process JS / TS before the HTML
					for (const file of files) {
						if (![".js", ".ts"].includes(file.extension)) {
							continue;
						}
						console.log(`Processing JS/TS file '${file.path}'`);
						if (file.path.endsWith("langUtils.js")) {
							const fcLang = await limitedLanguageImports(await file.content);
							processor.writeFile(file.path, fcLang);
						} else {
							const fcAbsImp = await absolutifyImports(await file.content);
							processor.writeFile(file.path, fcAbsImp);
						}
					}

					for (const file of files) {
						if (file.extension !== ".html") {
							// Now we're only processing html files
							continue;
						}
						console.log(`Processing HTML file '${file.path}'`);
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
	// const { code, map } = minifySync(data, {
	// 		// filename?: string;
	// 		// iframeSrcdoc?: boolean;
	// 		scriptingEnabled: true,
	// 		// forceSetHtml5Doctype?: boolean;
	// 		collapseWhitespaces: "all",
	// 		removeEmptyMetadataElements: true,
	// 		removeComments: true,
	// 		// preserveComments?: string[],
	// 		minifyConditionalComments: true,
	// 		removeEmptyAttributes: true,
	// 		removeRedundantAttributes: "all",
	// 		collapseBooleanAttributes: true,
	// 		normalizeAttributes: true,
	// 		minifyJson: true,
	// 		// TODO improve me after typing `@swc/css`
	// 		minifyJs: true,
	// 		minifyCss: true,
	// 		// minifyAdditionalScriptsContent?: [string, MinifierType][];
	// 		// minifyAdditionalAttributes?: [string, MinifierType][];
	// 		// sortSpaceSeparatedAttributeValues?: boolean;
	// 		// // sortAttributes?: boolean;
	// 		// tagOmission?: boolean;
	// 		// selfClosingVoidElements?: boolean;
	// 		// quotes?: boolean;
	// });
	const compressed = Bun.gzipSync(data, { level: 9 });
	Bun.write("./dist/index.html.gz", compressed);
};

console.log("Running the build");
cleanDist();
await build();
await compress();
