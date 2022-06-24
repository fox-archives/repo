import { flags, fs, path, Input, Confirm, Select } from "../deps.ts";

import * as projectUtils from "../util/projectUtils.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";
import * as types from "../types.ts";

export async function foxInit() {
	const foxxyConfigGlobal = await helper.getFoxConfigGlobal();

	const ctx = await (async (): Promise<
		types.Context & { git: NonNullable<types.Context["git"]> }
	> => {
		const isDirEmpty = async (dir: string): Promise<boolean> => {
			return (await util.arrayFromAsync(Deno.readDir(dir))).length === 0;
		};

		const projectDir = Deno.cwd();
		let projectEcosystem: types.ProjectEcosystem;
		let projectForm: types.ProjectForm;

		if (await isDirEmpty(projectDir)) {
			projectEcosystem = util.validateZod<types.ProjectEcosystem>(
				types.ProjectEcosystemSchema,
				await Input.prompt({ message: "Project Ecosystem", minLength: 2 })
			);

			projectForm = util.validateZod<types.ProjectForm>(
				types.ProjectFormSchema,
				await Input.prompt({ message: "Project Form", minLength: 2 })
			);
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

		// Repo
		const projectRepo = await Input.prompt({
			message: "Repository Name",
			minLength: 2,
		});
		if (!projectRepo) {
			util.die("Repository name cannot be empty");
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
	})();

	const bake: { run?: string; update?: string; docs: string } = {
		run: ":",
		update: "foxxy update",
		docs: "foxxy docs",
	};

	// projectEcosystem
	switch (ctx.ecosystem) {
		case "node":
		case "nodejs": {
			// Ecosystem
			await util.writeButDoNotOverride("package.json", "{}");
			await util.writeButDoNotOverride(
				"index.js",
				`import * as ft from '@hyperupcall/foxtrot-nodejs'\n\nft.woof()\n`
			);
			await util.exec({
				cmd: ["pnpm", "install", "@hyperupcall/foxtrot-nodejs"],
			});

			// General
			bake.run = "node ./index.js";
			break;
		}
		case "deno":
			// Ecosystem
			await util.writeButDoNotOverride("deno.jsonc", "{}\n");
			await util.writeButDoNotOverride(
				"main.ts",
				`console.log("Hello, World!")\n`
			);

			// General
			bake.run = "deno run ./main.ts";
			break;
		case "go":
		case "golang":
			// Ecosystem
			await util.exec({
				cmd: [
					"go",
					"mod",
					"init",
					`github.com/${ctx.git.owner}/${ctx.git.repo}`,
				],
			});
			await util.writeButDoNotOverride(
				"main.go",
				`package main

import ft "github.com/hyperupcall/foxtrot-go"

func main() {
	ft.Woof()\n}\n`
			);
			await util.exec({
				cmd: ["go", "get", "github.com/hyperupcall/foxtrot-go"],
			});

			// General
			bake.run = "go run .";
			break;
		default:
			util.die("Specified project ecosystem not supported");
	}

	// General
	const bakefileShContents = ((): string => {
		let bakefileShContents = "# shellcheck shell=bash\n\n";

		for (const [taskName, taskContent] of Object.entries(bake)) {
			bakefileShContents += `task.${taskName}() {\n\t`;
			bakefileShContents += taskContent.split("\n").join("\t\n");
			bakefileShContents += `\n}\n`;
		}
		bakefileShContents += "\n";
		return bakefileShContents;
	})();
	await util.writeButDoNotOverride("Bakefile.sh", bakefileShContents);
	await util.exec({ cmd: ["bake"] }, { allowFailure: true });

	await util.writeButDoNotOverride("README.md", `# ${ctx.git.repo}\n`);

	// Run Linter
	if (await Confirm.prompt("Run linter?")) {
		helper.performLint(ctx, { fix: true });
	}

	// Initialize Git
	if (!util.pathExists(".git") && (await Confirm.prompt("Initialize Git?"))) {
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

	// Initialize GitHub
	const value = await Select.prompt({
		message: "Create GitHub repository?",
		options: [
			{ name: "Public", value: "public" },
			{ name: "Private", value: "private" },
			{ name: "Neither", value: "none" },
		],
	});
	if (value !== "none") {
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
			],
		});
	}
}
