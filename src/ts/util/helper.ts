import { fs, path, c, toml } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "./util.ts";
import * as projectUtils from "./projectUtils.ts";
import { foxLinterModules } from "../linters/index.ts";
import { Notices } from "./Notices.ts";

export async function performLint(ctx: types.Context, args: types.foxLintArgs) {
	const moduleList = [];
	for (const module of foxLinterModules) {
		if (
			(module.activateOn.ecosystem === "any" ||
				module.activateOn.ecosystem === ctx.ecosystem) &&
			(module.activateOn.form === "any" || module.activateOn.form === ctx.form)
		) {
			moduleList.push(module);
		}
	}

	for (const module of moduleList) {
		if (module.triggers?.onInitial) {
			console.log(`Executing: ${module.name}::onInitial()`);
			await module.triggers.onInitial(args);
		}
	}

	// FIXME: use path.joinGlobs to autofilter
	for await (const entry of fs.walk(ctx.dir, {
		skip: [
			/(?:bower_components|node_modules|jspm_packages|web_modules|.next|.nuxt|.yarn|out|dist|.cache|.hidden|vendor|third_party)/g,
		],
	})) {
		for (const module of moduleList) {
			if (!module.match) continue;

			for (const [glob, fn] of module.match) {
				if (entry.path.match(path.globToRegExp(glob))) {
					console.log(`Executing: ${module.name}::${glob}`);
					await fn(args, entry);
				}
			}
		}
	}

	Notices.printAll();
}

export async function getContext(): Promise<types.Context> {
	await cdToProjectRoot();

	const foxxoStateGlobal = await getFoxStateGlobal();
	const foxxoConfigGlobal = await getFoxConfigGlobal();
	const foxxoConfigLocal = await getFoxConfigLocal();
	const vcsInfo = await util.getVcsInfo();

	const projectDir = Deno.cwd();
	const projectEcosystem = await projectUtils.determineEcosystem(projectDir);
	const projectForm = await projectUtils.determineForm(
		foxxoConfigLocal,
		projectEcosystem
	);

	return {
		dir: projectDir,
		git: vcsInfo,
		ecosystem: projectEcosystem,
		form: projectForm,
		person: foxxoConfigGlobal.person,
		github_token: foxxoStateGlobal.github_token,
	};
}

export async function cdToProjectRoot() {
	const cdUntilFileOrDir = async (
		dir: string,
		name: string
	): Promise<string | undefined> => {
		let potentialFile;
		do {
			potentialFile = path.join(dir, name);
			if (await util.pathExists(potentialFile)) {
				return dir;
			}
			dir = path.dirname(dir);
		} while (dir !== "/");
	};

	for (const rel of ["foxxy.toml", "foxxo.toml", ".git"]) {
		const dir = await cdUntilFileOrDir(Deno.cwd(), rel);
		if (dir) {
			return dir;
		}
	}

	util.dieWithHints("Failed to find project root", [
		"Have you initialized the project with 'foxxo init'?",
	]);
}

/**
 * @description Detects and reads in any local Foxxo configuration. If the schema is out of
 * date or the old JSON configuration file is found, convert it to the newer one
 */
export async function getFoxConfigLocal(): Promise<types.FoxConfigProject> {
	{
		let cfg = {};

		// TODO: remove backwards compatibility once all files have been converted to new format/schema
		// Read original fox.json if it exists
		try {
			let foxJson = await Deno.readTextFile("./fox.json");
			if (foxJson.length === 0) {
				foxJson = "{}";
			}
			cfg = JSON.parse(foxJson);
			await Deno.remove("./fox.json");
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}

		// Rename to new config filename if it exists
		try {
			await Deno.rename("./fox.toml", "./foxxy.toml");
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}
		try {
			await Deno.rename("./foxxy.toml", "./foxxo.toml");
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}

		const projectDir = Deno.cwd();
		const projectEcosystem = await projectUtils.determineEcosystem(projectDir);
		const projectForm = await projectUtils.determineForm(cfg, projectEcosystem);
		const projectDefaults = {
			ecosystem: projectEcosystem,
			form: projectForm,
			for: "me",
			status: "experimental",
		};

		// If no existing Foxxo config file, create default
		if (!(await util.pathExists("./foxxo.toml"))) {
			cfg = {
				project: {
					...projectDefaults,
					...cfg,
				},
				discovery: {
					categories: [],
					tags: [],
				},
			};
			await Deno.writeTextFile(
				"./foxxo.toml",
				toml.stringify(cfg).replaceAll('"', "'").trim()
			);
		}

		// Update to Schema v2
		{
			const config: {
				ecosystem?: types.ProjectEcosystem;
				form?: types.ProjectForm;
				for?: types.ProjectFor;
				status?: types.ProjectStatus;
				project?: Record<string, unknown>;
			} = toml.parse(await Deno.readTextFile("./foxxo.toml"));
			if (!config.project) {
				if (config.ecosystem) projectDefaults.ecosystem = config.ecosystem;
				if (config.form) projectDefaults.form = config.form;
				if (config.for) projectDefaults.for = config.for;
				if (config.status) projectDefaults.status = config.status;

				await Deno.writeTextFile(
					"./foxxo.toml",
					toml
						.stringify({
							project: projectDefaults,
							discovery: {
								categories: [],
								tags: [],
							},
						})
						.replaceAll('"', "'")
						.trim()
				);
			}
		}
	}

	const config = toml.parse(await Deno.readTextFile("./foxxo.toml"));

	const foxConfigProjectSchema = JSON.parse(
		await Deno.readTextFile(
			path.join(
				path.dirname(path.fromFileUrl(import.meta.url)),
				"../schemas/foxxoProject.schema.json"
			)
		)
	);
	delete foxConfigProjectSchema.$schema; // TODO

	return util.validateAjv<types.FoxConfigProject>(
		foxConfigProjectSchema,
		config
	);
}

export async function getFoxConfigGlobal(): Promise<types.FoxConfigGlobal> {
	// TODO: library xdg library
	const foxConfigDir = path.join(
		Deno.env.get("XDG_CONFIG_HOME") ||
			path.join(Deno.env.get("HOME") || "/WINDOWS_NOT_SUPPORTED", ".config"),
		"foxxo"
	);

	const config = await (async (): Promise<Record<string, unknown>> => {
		try {
			return toml.parse(
				await Deno.readTextFile(path.join(foxConfigDir, "./config.toml"))
			);
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}

		try {
			return JSON.parse(
				await Deno.readTextFile(path.join(foxConfigDir, "./config.json"))
			);
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}

		util.die("Failed to find global configuration file");
	})();

	const foxConfigGlobalSchema = JSON.parse(
		await Deno.readTextFile(
			path.join(
				path.dirname(path.fromFileUrl(import.meta.url)),
				"../schemas/foxxoGlobalConfig.schema.json"
			)
		)
	);
	delete foxConfigGlobalSchema.$schema; // TODO
	return util.validateAjv<types.FoxConfigGlobal>(foxConfigGlobalSchema, config);
}

export async function getFoxStateGlobal(): Promise<types.FoxStateGlobal> {
	// TODO: library xdg library
	const foxConfigDir = path.join(
		Deno.env.get("XDG_STATE_HOME") ||
			path.join(
				Deno.env.get("HOME") || "/WINDOWS_NOT_SUPPORTED",
				".local/state"
			),
		"foxxo"
	);

	const config = await (async () => {
		try {
			return JSON.parse(
				await Deno.readTextFile(path.join(foxConfigDir, "./state.json"))
			);
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}
	})();

	const foxStateGlobalSchema = JSON.parse(
		await Deno.readTextFile(
			path.join(
				path.dirname(path.fromFileUrl(import.meta.url)),
				"../schemas/foxxoGlobalState.schema.json"
			)
		)
	);
	delete foxStateGlobalSchema.$schema; // TODO

	return util.validateAjv<types.FoxStateGlobal>(foxStateGlobalSchema, config);
}

export async function incrementVersion(oldVersion: string): Promise<string> {
	console.log(`Old version: ${oldVersion}`);
	const newVersion = await prompt("New version?");
	console.log(`You chose: ${newVersion}`);

	if (!newVersion) {
		// FIXME
		console.error("Failed to get input. Exiting");
		Deno.exit(1);
	}

	return newVersion;
}
