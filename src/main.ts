import { flags } from "./deps.ts";

import * as util from "./util/util.ts";
import { subcommandInit } from "./subcommands/init.ts";
import { subcommandFix } from "./subcommands/fix.ts";
import { subcommandRelease } from "./subcommands/release.ts";

const args = flags.parse(Deno.args);
switch (args._[0]) {
	case "init":
		if (args.h || args.help) {
			util.showHelp();
			Deno.exit(0);
		}

		await subcommandInit(args);
		break;
	case "fix":
		if (args.h || args.help) {
			util.showHelp();
			Deno.exit(0);
		}

		await subcommandFix(args);
		break;
	case "release":
		if (args.h || args.help) {
			util.showHelp();
			Deno.exit(0);
		}

		await subcommandRelease(args);
		break;
	default:
		if (args.h || args.help) {
			util.showHelp();
			Deno.exit(0);
		}

		util.showHelp();
		console.error("Error: Subcommand not found. Exiting");
		Deno.exit(1);
}
