import { flags } from "./deps.ts";

import * as util from "./util/util.ts";
import * as cmd from "./subcommands/index.ts";

const args = flags.parse(Deno.args);
if ("h" in args || "help" in args) {
	util.showHelp();
	Deno.exit(0);
}
switch (args._[0]) {
	case "init":
		await cmd.foxInit(args);
		break;
	case "lint":
		await cmd.foxLint(args);
		break;
	case "release":
		await cmd.foxRelease(args);
		break;
	default:
		util.showHelp();
		util.die("Subcommand not found");
}
