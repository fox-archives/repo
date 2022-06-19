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
	.action(async (obj) => {
		console.log("init", obj);
		await foxInit();
	})
	.reset()
	.command("lint", "Lints")
	.option("--fix", "Fix mistakes")
	.action(async (obj) => {
		console.log("lints", obj);
		await foxLint(obj);
	})
	.reset()
	.command("docs", "Generate documentation")
	.action(async (obj) => {
		console.log("docs", obj);
		await foxDocs();
	})
	.reset()
	.command("release", "Releases")
	.action(async (obj) => {
		console.log("docs", obj);
		await foxRelease();
	})
	.reset()
	.action(function () {
		this.showHelp();
	})
	.parse(Deno.args);
