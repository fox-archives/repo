import { fs, path, flags } from "./deps.ts";

import * as util from "./util/util.ts";

await main();
async function main() {
	const args = flags.parse(Deno.args);

	const modules = [
		"bake",
		"basalt",
		"deno",
		"editorconfig",
		"git",
		"glue",
		"prettier",
	];
	const shouldRunModule = (cmd: string) =>
		args._[0] === "all" || args._.includes(cmd);

	if (args.h || args.help) {
		console.info(`foxomate

Summary: My linter / checker

Usage: foxomate [flags] [modules ...]

Flags:
  --help
  --fix=no|prompt|auto

Modules:
${modules.map((item) => `  - ${item}\n`).join("")}`);
		Deno.exit(0);
	}

	if (args._.length === 0) {
		util.logInfo("No modules specified, none ran");
		Deno.exit(0);
	}

	const opts: util.Opts = {
		fix: "prompt",
	};

	if (args.fix === "no" || args.fix === "yes") {
		opts.fix = args.fix;
	}

	for (const runner of modules) {
		if (shouldRunModule(runner)) {
			util.logInfo(`Detected '${runner}'`);
		}
	}

	for await (const entry of fs.expandGlob("**/*", {
		exclude: [
			"bower_components",
			"node_modules",
			"jspm_packages",
			"web_modules",
			".next",
			".nuxt",
			".yarn",
			".dynamodb",
			".fusebox",
			".serverless",
			"out",
			"dist",
			".cache",
			"third_party",
		],
	})) {
		for (const runner of modules) {
			if (shouldRunModule(runner)) {
				const module = await import(`./modules/${runner}.ts`);

				runModule(opts, module, entry);
			}
		}
	}
}

async function runModule(opts: util.Opts, module: any, entry: fs.WalkEntry) {
	if (module.init) {
		module.init(opts);
	}

	for (const trigger of module.onFiles) {
		for (const file of trigger.files) {
			if (file === entry.name) {
				await trigger.fn(opts, entry);
			}
		}
	}
}
