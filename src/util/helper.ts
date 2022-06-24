import { fs, path, c, toml } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "./util.ts";
import * as projectUtils from "./projectUtils.ts";
import { foxLinterModules } from "../linters/index.ts";

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

	let notices: types.Notice[] = [];
	for (const module of moduleList) {
		if (module.triggers?.onInitial) {
			console.log(`Executing: ${module.name}::onInitial()`);
			const ns = await module.triggers.onInitial(args);
			if (ns) {
				notices = notices.concat(
					ns.map((item) => ({ ...item, moduleId: module.id }))
				);
			}
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
					const ns = await fn(args, entry);
					if (ns) {
						notices = notices.concat(
							ns.map((item) => ({ ...item, moduleId: module.id }))
						);
					}
				}
			}
		}
	}

	for (const notice of notices) {
		if (!notice.file) {
			console.log(`${c.underline(notice.name)}`);
		}
	}

	for (const notice of notices) {
		if (notice.file) {
		}
	}
	if (notices.length > 0) {
		console.log("NOTICES");
		console.log(notices);
	}
}

export async function getContext(): Promise<types.Context> {
	await cdToProjectRoot();

	const foxxyConfigGlobal = await getFoxConfigGlobal();
	const foxxyConfigLocal = await getFoxConfigLocal();
	const vcsInfo = await util.getVcsInfo();

	const projectDir = Deno.cwd();
	const projectEcosystem = await projectUtils.determineEcosystem(projectDir);
	const projectForm = await projectUtils.determineForm(
		foxxyConfigLocal,
		projectEcosystem
	);

	return {
		dir: projectDir,
		git: vcsInfo,
		ecosystem: projectEcosystem,
		form: projectForm,
		person: foxxyConfigGlobal.person,
		github_token: foxxyConfigGlobal.github_token,
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

	for (const rel of ["fox.json", ".git"]) {
		const dir = await cdUntilFileOrDir(Deno.cwd(), rel);
		if (dir) {
			return dir;
		}
	}

	util.die("Expected fox.json or git repository"); // FIXME
}

export async function getFoxConfigLocal(): Promise<types.FoxConfigProject> {
	// TODO: remove after all conversions
	{
		try {
			let foxJson = await Deno.readTextFile("./fox.json");
			if (foxJson.length === 0) {
				foxJson = "{}";
			}

			let cfg = JSON.parse(foxJson);
			const projectDir = Deno.cwd();
			const projectEcosystem = await projectUtils.determineEcosystem(
				projectDir
			);
			const projectForm = await projectUtils.determineForm(
				cfg,
				projectEcosystem
			);
			cfg = {
				ecosystem: projectEcosystem,
				form: projectForm,
				for: "me",
				status: "experimental",
				...cfg,
			};
			await Deno.writeTextFile(
				"./foxxy.toml",
				toml.stringify(cfg).replaceAll('"', "'")
			);
			await Deno.remove("./fox.json");
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}

		try {
			await Deno.rename("./fox.toml", "./foxxy.toml");
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}
	}

	const config = toml.parse(await Deno.readTextFile("./foxxy.toml"));
	return util.validateAjv<types.FoxConfigProject>(
		types.FoxConfigProjectSchema,
		config
	);
}

export async function getFoxConfigGlobal(): Promise<types.FoxConfigGlobal> {
	// TODO: library xdg library
	const foxConfigDir = path.join(
		Deno.env.get("XDG_CONFIG_HOME") ||
			path.join(Deno.env.get("HOME") || "/WINDOWS_NOT_SUPPORTED", ".config"),
		"foxxy"
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

		util.die("Failed to find configuration file");
	})();

	return util.validateAjv<types.FoxConfigGlobal>(
		types.FoxConfigGlobalSchema,
		config
	);
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
