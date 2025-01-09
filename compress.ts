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

console.log("Performing the compress");
await compress();
