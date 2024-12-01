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

const build = async () => {
	await Bun.build({
		entrypoints: ["./www/index.html"],
		outdir: "./dist",
		plugins: [html()],
	});
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
