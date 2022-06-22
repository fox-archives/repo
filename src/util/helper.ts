import { fs, path } from "../deps.ts";

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

	const notices: types.Notice | [] = [];
	for (const module of moduleList) {
		if (module.triggers?.onInitial) {
			console.log(`Executing: ${module.name}::onInitial()`);
			await module.triggers.onInitial(args, notices);
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
					await fn(args, entry, notices);
				}
			}
		}
	}

	if (notices.length > 0) {
		console.log("NOTICES");
		console.log(notices);
	}
}

export async function getContext(): Promise<types.Context> {
	await cdToProjectRoot();

	const foxConfigGlobal = await getFoxConfigGlobal();
	const foxConfigLocal = await getFoxConfigLocal();
	const gitRemoteInfo = await util.getGitRemoteInfo();

	const projectDir = Deno.cwd();
	const projectEcosystem = await projectUtils.determineEcosystem(projectDir);
	const projectForm = await projectUtils.determineForm(
		foxConfigLocal,
		projectEcosystem
	);

	return {
		dir: projectDir,
		git: gitRemoteInfo,
		ecosystem: projectEcosystem,
		form: projectForm,
		person: foxConfigGlobal.person,
		github_token: foxConfigGlobal.github_token,
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
			if (await fs.exists(potentialFile)) {
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
	const json = await util.readConfig(".", "fox");
	return util.validateAjv<types.FoxConfigProject>(
		types.FoxConfigProjectSchema,
		json
	);
}

export async function getFoxConfigGlobal(): Promise<types.FoxConfigGlobal> {
	// FIXME: Throw expressions once landed or xdg library
	const foxConfigDir = path.join(
		Deno.env.get("XDG_CONFIG_HOME") ||
			path.join(Deno.env.get("HOME") || "/WINDOWS_NOT_SUPPORTED", ".config"),
		"foxxy"
	);

	const json = await util.readConfig(foxConfigDir, "config");
	return util.validateAjv<types.FoxConfigGlobal>(
		types.FoxConfigGlobalSchema,
		json
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
