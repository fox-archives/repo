import { flags } from "./deps.ts";

import * as types from "./types.ts";
import * as util from "./util/util.ts";
import * as helper from "./util/helper.ts";
import { foxInit } from "./subcommands/init.ts";
import { foxLint } from "./subcommands/lint.ts";
import { foxDocs } from "./subcommands/docs.ts";
import { foxRelease } from "./subcommands/release.ts";

await main();
async function main() {
	const args = flags.parse(Deno.args);
	if ("h" in args || "help" in args) {
		util.showHelp();
		Deno.exit(0);
	}

	const subcommand = args._[0];
	switch (subcommand) {
		case "init": {
			await foxInit();
			break;
		}
		case "lint": {
			const f = util.validateFlags(args);

			await foxLint(f);
			break;
		}
		case "docs": {
			await foxDocs();
			break;
		}
		case "release": {
			await foxRelease();
			break;
		}
		case "":
			util.showHelp();
			util.die("Must supply a subcommand");
			break;
		default:
			util.showHelp();
			util.die("Subcommand not found");
	}
}
