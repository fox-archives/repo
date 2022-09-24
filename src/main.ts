import { Command } from "./deps.ts";

import { foxxoClean } from "../subcommands/clean.ts";
import { foxxoDocs } from "./subcommands/docs.ts";
import { foxxoInit } from "./subcommands/init.ts";
import { foxxoLint } from "./subcommands/lint.ts";
import { foxxoOpen } from "./subcommands/open.ts";
import { foxxoRelease } from "./subcommands/release.ts";

await new Command()
	.name("foxxo")
	.description("My task automator")
	.version("v0.1.0")
	.command("init", "Initializes")
	.action(async () => {
		await foxxoInit();
	})
	.reset()
	.command("lint", "Lints")
	.option("--fix", "Fix mistakes")
	.action(async (args) => {
		await foxxoLint(args);
	})
	.reset()
	.command("docs", "Generates documentation")
	.action(async () => {
		await foxxoDocs();
	})
	.reset()
	.command("release", "Releases")
	.action(async () => {
		await foxxoRelease();
	})
	.reset()
	.command("open", "Open project")
	.action(async () => {
		await foxxoOpen();
	})
	.reset()
	.command("clean", "Cleans projects")
	.action(async () => {
		await foxxoClean();
	})
	.reset()
	.action(function () {
		this.showHelp();
	})
	.parse(Deno.args);
