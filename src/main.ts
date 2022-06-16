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
	if ("h" in args || "help" in args || args._.length === 0) {
		util.showHelp();
		Deno.exit(0);
	}

	const subcommand = args._[0];
	switch (subcommand) {
		case "init": {
			await foxInit(args);
			break;
		}
		case "lint": {
			await foxLint(args);
			break;
		}
		case "docs": {
			await foxDocs(args);
			break;
		}
		case "release": {
			await foxRelease(args);
			break;
		}
		default:
			util.showHelp();
			util.die("Subcommand not found");
	}
}
