import { c, fs, flags, path } from "./deps.ts";

import * as util from "./util/util.ts";

const args = flags.parse(Deno.args);
interface Module {
	name: string;
	description: string;
	init?: (opts?: util.Opts) => void;
	onFiles?: Array<{
		files: string[];
		fn: (opts: util.Opts, entry: fs.WalkEntry) => void;
	}>;
}

// Declare main data
const modules: {
	[key: string]: Array<() => void>;
} = {};
for (const module of [
	"bake",
	"basalt",
	"deno",
	"editorconfig",
	"git",
	"glue",
	"prettier",
	"shellcheck",
]) {
	modules[module] = [];
}

// Argument parsing
const opts: util.Opts = {
	fix: "prompt",
};
{
	if (args.h || args.help) {
		console.log(`foxomate

	Summary: My linter / checker

	Usage: foxomate [flags] [modules ...]

	Flags:
	  --help
	  --fix=no|prompt|auto

	Modules:
	${Object.keys(modules)
		.map((item) => `  - ${item}\n`)
		.join("")}`);
		Deno.exit(0);
	}

	if (args._.length === 0) {
		console.log("No modules specified, none ran");
		Deno.exit(0);
	}

	if (args.fix !== "no" || args.fix !== "yes") {
		opts.fix = args.fix;
	}
}

// Add functions to each module queue
{
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
		for (const moduleName of Object.keys(modules)) {
			const shouldRunModule = (cmd: string) => {
				return args._[0] === "all" || args._.includes(cmd);
			};

			if (!shouldRunModule(moduleName)) {
				continue;
			}
			const module: Module = await import(`./modules/${moduleName}.ts`);
			if (module.init && modules[moduleName].length === 0) {
				modules[moduleName].push(async () => {
					console.log(
						`${c.magenta("Running init for module")}Running init for module ${
							module.name
						}`
					);

					if (!module.init) return;
					await module.init(opts);
				});
			}

			if (module.onFiles) {
				for (const trigger of module.onFiles) {
					for (const file of trigger.files) {
						if (file === entry.name) {
							modules[moduleName].push(async () => {
								console.log(`File ./${path.relative(Deno.cwd(), entry.path)}`);
								await trigger.fn(opts, entry);
							});
						}
					}
				}
			}
		}
	}
}

// Run modules
{
	for (const [moduleName, module] of Object.entries(modules)) {
		if (module.length === 0) continue;

		console.log(`Module ${c.underline(c.magenta(moduleName))}`);
		for (const fn of module) {
			await fn();
		}
		console.log();
	}
}
