import { flags, c, fs, path } from "../deps.ts";

import { foxModules } from "../modules/index.ts";

import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as project from "../util/project.ts";

export async function foxLint(args: flags.Args) {
	const foxConfig = await util.getFoxConfig();

	const ecosystem = await project.determineEcosystem(".");
	if (!ecosystem) {
		util.die("Failed to automatically calculate 'ecosystem'");
	}
	console.log(`Ecosystem: ${ecosystem}`);

	const form = await project.determineForm(foxConfig, ecosystem);
	if (!form) {
		util.die("Failed to automatically calculate 'form'");
	}
	console.log(`Form: ${form}`);

	type ModuleOptions = Record<string, unknown>;

	type FoxModule = {
		name: string;
		activateOn: {
			ecosystem: string;
			form: string;
		};
		match?: Map<string, (opts: ModuleOptions, entry: fs.WalkEntry) => void>;
		triggers?: {
			onInitial: (opts: ModuleOptions) => void;
		};
	};

	const moduleList = [];
	for (const module of foxModules as FoxModule[]) {
		if (
			(module.activateOn?.ecosystem === "ALL" ||
				module.activateOn?.ecosystem === ecosystem) &&
			(module.activateOn?.form === "ALL" || module.activateOn?.form === form)
		) {
			moduleList.push(module);
		}
	}

	const foxOptions = {};

	for (const module of moduleList) {
		if (module.triggers?.onInitial) {
			console.log(`Executing: ${module.name}::onInitial()`);
			await module.triggers.onInitial(foxOptions);
		}
	}
	// FIXME: use path.joinGlobs to autofilter
	for await (const entry of fs.walk(".", {
		skip: [/node_modules/g],
	})) {
		for (const module of moduleList) {
			if (!module.match) continue;

			for (const [glob, fn] of module.match) {
				if (entry.path.match(path.globToRegExp(glob))) {
					console.log(`Executing: ${module.name}::${glob}`);
					await fn(foxOptions, entry);
				}
			}
		}
	}

	// 			"**/bower_components/**",
	// 			"**/node_modules/**",
	// 			"**/jspm_packages/**",
	// 			"**/web_modules/**",
	// 			"**/.next/**",
	// 			"**/.nuxt/**",
	// 			"**/.yarn/**",
	// 			"**/.dynamodb/**",
	// 			"**/.fusebox/**",
	// 			"**/.serverless/**",
	// 			"**/out/**",
	// 			"**/dist/**",
	// 			"**/.cache/**",
	// 			"**/.hidden/**",
	// 			".hidden",
	// 			"**/vendor/**",
	// 			"**/third_party/**",
}
