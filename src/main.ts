import { c, fs, flags, path } from "./deps.ts";

import * as util from "./util/util.ts";

const args = flags.parse(Deno.args);
interface Module {
	name: string;
	description: string;
	init?: (opts?: util.Opts) => void;
	onFiles?: Array<{
		files: string[] | RegExp | ((arg0: string) => boolean);
		fn: (opts: util.Opts, entry: fs.WalkEntry) => void;
	}>;
}

// Declare main data
const modules: {
	[key: string]: {
		init?: Module["init"];
		fns: Array<() => void>;
	};
} = {};

for (const moduleName of [
	"bake",
	"basalt",
	"bash",
	"deno",
	"editorconfig",
	"git",
	"glue",
	"license",
	"prettier",
	"shellcheck",
]) {
	modules[moduleName] = {
		fns: [],
	};
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
	  --fix=no|prompt|yes

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
			// TODO: fix
			"**/bower_components/**",
			"**/node_modules/**",
			"**/jspm_packages/**",
			"**/web_modules/**",
			"**/.next/**",
			"**/.nuxt/**",
			"**/.yarn/**",
			"**/.dynamodb/**",
			"**/.fusebox/**",
			"**/.serverless/**",
			"**/out/**",
			"**/dist/**",
			"**/.cache/**",
			"**/.hidden/**",
			".hidden",
			"**/vendor/**",
			"**/third_party/**",
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
			modules[moduleName].init = module.init;

			if (module.onFiles) {
				const add = (trigger: typeof module.onFiles[0], moduleName: string) => {
					modules[moduleName].fns.push(async () => {
						console.log(
							`${c.underline("File")} ./${path.relative(
								Deno.cwd(),
								entry.path
							)}`
						);
						await trigger.fn(opts, entry);
					});
				};

				for (const trigger of module.onFiles) {
					if (Array.isArray(trigger.files)) {
						for (const file of trigger.files) {
							if (file === entry.name) {
								add(trigger, moduleName);
							}
						}
					} else if (trigger.files instanceof RegExp) {
						if (trigger.files.test(entry.name)) {
							add(trigger, moduleName);
						}
					} else if (
						typeof trigger.files === "function" &&
						trigger.files !== null
					) {
						if (trigger.files(entry.path)) {
							add(trigger, moduleName);
						}
					}
				}
			}
		}
	}
}

// Run modules
{
	for (const [mName, { fns, init }] of Object.entries(modules)) {
		console.log(`Module ${c.underline(c.magenta(mName))}`);

		if (typeof init === "function" && init !== null) {
			await init(opts);
		}

		for (const fn of fns) {
			await fn();
		}
		console.log();
	}
}
