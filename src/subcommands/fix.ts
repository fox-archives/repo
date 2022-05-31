import { flags, c, fs, path } from "../deps.ts";
import { FixModule } from "../types.ts";
import { ModuleObjects } from "../modules/index.ts";

import * as util from "../util/util.ts";

export const moduleNames = [
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
];

export async function subcommandFix(args: flags.Args) {
	// Declare main data
	const modules: {
		[key: string]: {
			init?: FixModule["init"];
			fns: Array<() => void>;
		};
	} = {};

	for (const moduleName of moduleNames) {
		modules[moduleName] = {
			fns: [],
		};
	}

	const opts: util.Opts = {
		fix: "prompt",
	};

	if (args._.length === 0) {
		console.log("No modules specified, none ran");
		Deno.exit(0);
	}

	if (args.fix !== "no" || args.fix !== "yes") {
		opts.fix = args.fix;
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

				const module: FixModule = ModuleObjects[moduleName];
				modules[moduleName].init = module.init;

				if (module.onFiles) {
					const add = (
						trigger: typeof module.onFiles[0],
						moduleName: string
					) => {
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
}
