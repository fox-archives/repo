import { Command } from "./deps.ts";

import { foxxyClean } from "../subcommands/clean.ts";
import { foxxyDocs } from "./subcommands/docs.ts";
import { foxxyInit } from "./subcommands/init.ts";
import { foxxyLint } from "./subcommands/lint.ts";
import { foxxyOpen } from "./subcommands/open.ts";
import { foxxyRelease } from "./subcommands/release.ts";

await new Command()
	.name("foxxy")
	.description("My task automator")
	.version("v0.1.0")
	.command("init", "Initializes")
	.action(async () => {
		await foxxyInit();
	})
	.reset()
	.command("lint", "Lints")
	.option("--fix", "Fix mistakes")
	.action(async (args) => {
		await foxxyLint(args);
	})
	.reset()
	.command("docs", "Generates documentation")
	.action(async () => {
		await foxxyDocs();
	})
	.reset()
	.command("release", "Releases")
	.action(async () => {
		await foxxyRelease();
	})
	.reset()
	.command("open", "Open project")
	.action(async () => {
		await foxxyOpen();
	})
	.reset()
	.command("clean", "Cleans projects")
	.action(async () => {
		await foxxyClean();
	})
	.reset()
	.action(function () {
		this.showHelp();
	})
	.parse(Deno.args);
