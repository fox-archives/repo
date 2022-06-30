import { flags, fs, path, Input, Confirm, Select } from "../deps.ts";

import * as projectUtils from "../util/projectUtils.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";
import * as types from "../types.ts";

type InitContext = types.Context & { git: NonNullable<types.Context["git"]> };

export async function foxInit() {
	const foxxyConfigGlobal = await helper.getFoxConfigGlobal();

	if (await util.pathExists("foxxy.toml")) {
		console.log(
			"A project has already been initialized here. No action needed"
		);
		return;
	}

	const bakeDefaults = {
		run: ":",
	};

	const ctx = await getInitContext(foxxyConfigGlobal);
	switch (ctx.ecosystem) {
		case "nodejs":
			await initNodejs(ctx);
			await initBake({
				...bakeDefaults,
				run: "node ./index.js",
			});
			break;
		case "deno":
			await initDeno(ctx);
			await initBake({
				...bakeDefaults,
				run: "deno run ./main.ts",
			});
			break;
		case "golang":
			await initGolang(ctx);
			await initBake({
				...bakeDefaults,
				run: "go run .",
			});
			break;
		default: // TODO
			console.log("Not accounted for: ", ctx.ecosystem);
			break;
	}

	await initReadme(ctx);
	await initGit(ctx);
	if (await util.pathExists(path.join(ctx.dir, ".git"))) {
		await initGithub(ctx);
	}

	if (await Confirm.prompt("Run linter and autofix?")) {
		helper.performLint(ctx, { fix: true });
	}
}

async function initNodejs(_ctx: InitContext) {
	await util.writeButDoNotOverride("package.json", "{}");
	await util.writeButDoNotOverride(
		"index.js",
		`import * as foxtrot from '@hyperupcall/foxtrot-nodejs'\n\nfoxtrot.woof()\n`
	);
	await util.exec({
		cmd: ["pnpm", "install", "@hyperupcall/foxtrot-nodejs"],
	});
}

async function initDeno(_ctx: InitContext) {
	await util.writeButDoNotOverride("deno.jsonc", "{}\n");
	await util.writeButDoNotOverride("main.ts", `console.log("Hello, World!")\n`);
}

async function initGolang(ctx: InitContext) {
	await util.exec({
		cmd: ["go", "mod", "init", `github.com/${ctx.git.owner}/${ctx.git.repo}`],
	});
	await util.writeButDoNotOverride(
		"main.go",
		`package main

import foxtrot "github.com/hyperupcall/foxtrot-go"

func main() {
foxtrot.Woof()\n}\n`
	);
	await util.exec({
		cmd: ["go", "get", "github.com/hyperupcall/foxtrot-go"],
	});
}

async function initBake(tasks: Record<string, string>) {
	const bakefileShContents = ((): string => {
		let bakefileShContents = "# shellcheck shell=bash\n\n";

		for (const [taskName, taskContent] of Object.entries(tasks)) {
			bakefileShContents += `task.${taskName}() {\n\t`;
			bakefileShContents += taskContent.split("\n").join("\t\n");
			bakefileShContents += `\n}\n\n`;
		}
		bakefileShContents += "\n";
		return bakefileShContents;
	})();
	await util.writeButDoNotOverride("Bakefile.sh", bakefileShContents);
	await util.exec({ cmd: ["bake"] }, { allowFailure: true });
}

async function initReadme(ctx: InitContext) {
	await util.writeButDoNotOverride("README.md", `# ${ctx.git.repo}\n`);
}

async function initGit(ctx: InitContext) {
	if (
		!(await util.pathExists(".git")) &&
		(await Confirm.prompt("Initialize Git?"))
	) {
		await util.exec({
			cmd: ["git", "init", "-b", "main"],
		});
		await util.exec({
			cmd: [
				"git",
				"remote",
				"add",
				"origin",
				`git@${ctx.git.site}:${ctx.git.owner}/${ctx.git.repo}`,
			],
		});

		await util.exec({ cmd: ["git", "add", "-A"] });
		await util.exec({
			cmd: ["git", "commit", "-m", "chore: Initial commit"],
		});
	}
}

async function initGithub(ctx: InitContext) {
	const value = await Select.prompt({
		message: "Create GitHub repository?",
		options: [
			{ name: "Public", value: "public" },
			{ name: "Private", value: "private" },
			{ name: "Neither", value: "none" },
		],
	});
	if (value === "none") {
		return;
	}

	await util.exec({
		cmd: [
			"gh",
			"repo",
			"create",
			ctx.git.repo,
			"--disable-wiki",
			value === "public" ? "--public" : "--private",
			"--push",
			"--remote",
			"origin",
			"--source",
			".",
		],
	});
}

async function getInitContext(
	foxxyConfigGlobal: types.FoxConfigGlobal
): Promise<InitContext> {
	const isDirEmpty = async (dir: string): Promise<boolean> => {
		return (await util.arrayFromAsync(Deno.readDir(dir))).length === 0;
	};

	const projectDir = Deno.cwd();
	let projectEcosystem: types.ProjectEcosystem;
	let projectForm: types.ProjectForm;
	let projectRepo = path.basename(projectDir);

	if (await isDirEmpty(projectDir)) {
		projectEcosystem = util.validateZod<types.ProjectEcosystem>(
			types.ProjectEcosystemSchema,
			await Input.prompt({ message: "Project Ecosystem", minLength: 2 })
		);

		projectForm = util.validateZod<types.ProjectForm>(
			types.ProjectFormSchema,
			await Input.prompt({ message: "Project Form", minLength: 2 })
		);

		projectRepo = await Input.prompt({
			message: "Repository Name",
			minLength: 2,
		});
		if (!projectRepo) {
			util.die("Repository name cannot be empty");
		}
	} else {
		let foxxyConfig: types.FoxConfigProject = {};
		try {
			foxxyConfig = await helper.getFoxConfigLocal();
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);
			if (!(err instanceof Deno.errors.NotFound)) {
				throw err;
			}
		}

		projectEcosystem = await projectUtils.determineEcosystem(projectDir);
		projectForm = await projectUtils.determineForm(
			foxxyConfig,
			projectEcosystem
		);
	}

	return {
		dir: projectDir,
		git: {
			site: foxxyConfigGlobal.defaults.vcsSite,
			owner: foxxyConfigGlobal.defaults.vcsOwner,
			repo: projectRepo,
		},
		ecosystem: projectEcosystem,
		form: projectForm,
		...foxxyConfigGlobal,
	};
}
