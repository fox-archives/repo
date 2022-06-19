import { Command } from "./deps.ts";

import { foxInit } from "./subcommands/init.ts";
import { foxLint } from "./subcommands/lint.ts";
import { foxDocs } from "./subcommands/docs.ts";
import { foxRelease } from "./subcommands/release.ts";

await new Command()
	.name("foxxy")
	.description("My task automator")
	.version("v0.1.0")
	.command("init", "Initializes")
	.action(async () => {
		await foxInit();
	})
	.reset()
	.command("lint", "Lints")
	.option("--fix", "Fix mistakes")
	.action(async (args) => {
		await foxLint(args);
	})
	.reset()
	.command("docs", "Generate documentation")
	.action(async () => {
		await foxDocs();
	})
	.reset()
	.command("release", "Releases")
	.action(async () => {
		await foxRelease();
	})
	.reset()
	.action(function () {
		this.showHelp();
	})
	.parse(Deno.args);
