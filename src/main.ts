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

	await helper.cdToProjectRoot();
	const info = await helper.getContextInfo();
	const ctx: types.Context = {
		dir: Deno.cwd(),
		owner: "hyperupcall",
		repo: info.repo,
		github_token: info.github_token,
	};

	const subcommand = args._[0];
	switch (subcommand) {
		case "init":
			await foxInit(ctx, args);
			break;
		case "lint":
			await foxLint(ctx, args);
			break;
		case "docs":
			await foxDocs(ctx, args);
			break;
		case "release":
			await foxRelease(ctx, args);
			break;
		default:
			util.showHelp();
			util.die("Subcommand not found");
	}
}
