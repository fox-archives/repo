import { fs, asserts } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export { module };
const module: types.FoxModule = {
	id: "bash",
	name: "Bash",
	activateOn: {
		ecosystem: "any",
		form: "any",
	},
};

// import { fs } from "../deps.ts";
// import { toml } from "../deps.ts";

// import * as util from "../util/util.ts";

// export const name = "Shell";
// export const description = "Lints shell files";
// export const onFiles = [
// 	{
// 		files: (fullPath: string) => /(?:\.(?:bash|sh)|bin\/[^.]*)$/.test(fullPath),
// 		async fn(opts: util.Opts, entry: fs.WalkEntry) {
// 			const text = await Deno.readTextFile(entry.path);

// 			for (const line of text.split("\n")) {
// 				if (line.includes("Error") && !line.includes(">&2")) {
// 					util.logInfo(`Line '${line}' has string 'Error', but not '>&2'`);
// 				}

// 				if (
// 					line.includes('eval "$(basalt-package-init)"') &&
// 					!line.includes("|| exit")
// 				) {
// 					util.logInfo(
// 						`Line '${line} has string 'eval "$(basalt-package-init)"', but not '|| exit'`
// 					);
// 				}

// 				if (line.includes("basalt.package-init") && !line.includes("|| exit")) {
// 					util.logInfo(
// 						`Line '${line} has string 'basalt.package-init', but not '|| exit'`
// 					);
// 				}

// 				if (line.includes("basalt.package-load") && line.includes("|| exit")) {
// 					util.logInfo(`Line '${line} has unecessarily has '|| exit'`);
// 				}
// 			}
// 		},
// 	},
// ];
