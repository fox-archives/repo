import { fs, toml } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export default {
	id: "basalt",
	name: "Basalt",
	activateOn: {
		ecosystem: "ALL",
		form: "ALL",
	},
	match: new Map([
		[
			"basalt.toml",
			async (opts: types.ModuleOptions, entry: fs.WalkEntry) => {
				const basaltToml = toml.parse(await Deno.readTextFile(entry.path));

				// const pkg = basaltToml.package as Record<string, any>;
				// if (!pkg) {
				// 	util.logMissingProperty("package");
				// 	return;
				// }

				// if (!pkg.type) {
				// 	util.logMissingProperty("package.type");
				// }
				// util.ensureNotEmpty("package.type", pkg.type);

				// if (!pkg.name) {
				// 	util.logMissingProperty("package.name");
				// }
				// util.ensureNotEmpty("package.type", pkg.name);

				// if (!pkg.slug) {
				// 	util.logMissingProperty("package.slug");
				// }
				// util.ensureNotEmpty("package.type", pkg.slug);

				// if (!pkg.version) {
				// 	util.logMissingProperty("package.version");
				// }
				// util.ensureNotEmpty("package.type", pkg.version);

				// if (!pkg.authors) {
				// 	util.logMissingProperty("package.authors");
				// }
				// util.ensureNotEmpty("package.type", pkg.authors);

				// if (!pkg.description) {
				// 	util.logMissingProperty("package.description");
				// }
				// util.ensureNotEmpty("package.type", pkg.description);
			},
		],
	]),
};
