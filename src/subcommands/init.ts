import { flags, fs, path } from "../deps.ts";

import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";
import * as types from "../types.ts";

export async function foxInit(args: flags.Args) {
	const foxConfig = await helper.getGlobalFoxConfig();

	const ctx: types.Context = await (async () => {
		// Ecosystem
		const projectEcosystem = util.validateZod<types.ProjectEcosystem>(
			types.ProjectEcosystemSchema,
			prompt("Project Ecosystem:") ||
				util.die("Failed to specify project ecosystem")
		);

		// Form
		const projectForm = util.validateZod<types.ProjectForm>(
			types.ProjectFormSchema,
			prompt("Project Form:") || util.die("Failed to specify project form")
		);

		// Dir
		const projectDir = prompt("Project Directory:");
		if (!projectDir) {
			util.die("Failed to specify project directory");
		}
		try {
			Deno.chdir(projectDir);
		} catch (unknownError: unknown) {
			const err = util.assertInstanceOfError(unknownError);

			if (err instanceof Deno.errors.NotFound) {
				await Deno.mkdir(projectDir, { recursive: true });
				Deno.chdir(projectDir);
			} else {
				throw err;
			}
		}
		if ((await util.arrayFromAsync(Deno.readDir("."))).length !== 0) {
			util.die("Specified project directory must be empty");
		}

		// Repo
		const projectRepo = prompt("Repository Name:");
		if (!projectRepo) {
			util.die("Repository name cannot be empty");
		}

		return {
			ecosystem: projectEcosystem,
			form: projectForm,
			dir: path.join(Deno.cwd(), projectDir),
			repo: projectRepo,
			...foxConfig,
		};
	})();

	const bake: { run?: string; update?: string } = {
		run: ":",
		update: "foxxy update",
	};

	// projectEcosystem
	switch (ctx.ecosystem) {
		case "node":
		case "nodejs": {
			// Ecosystem
			const packageJson = {
				name: ctx.repo,
				version: "0.1.0",
				main: "index.js",
				author: "Edwin Kofler <edwin@kofler.dev> (https://edwinkofler.com)",
				license: "NOT LICENSED", // TODO
				type: "module",
			};
			await Deno.writeTextFile(
				"package.json",
				`${JSON.stringify(packageJson, null, "\t")}\n`
			);
			await Deno.writeTextFile(
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
			await Deno.writeTextFile("deno.jsonc", "{}\n");
			await Deno.writeTextFile("main.ts", `console.log("Hello, World!")\n`);

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
					`github.com/${ctx.owner.username}/${ctx.repo}`,
				],
			});
			await Deno.writeTextFile(
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
	let bakefileShContents = "# shellcheck shell=bash\n\n";
	for (const [taskName, taskContent] of Object.entries(bake)) {
		bakefileShContents += `task.${taskName}() {\n\t`;
		bakefileShContents += taskContent.split("\n").join("\t\n");
		bakefileShContents += `\n}\n`;
	}
	bakefileShContents += "\n";
	await Deno.writeTextFile("Bakefile.sh", bakefileShContents);
	await util.exec({ cmd: ["bake"] }, { allowFailure: true });

	await Deno.writeTextFile("README.md", `# ${ctx.repo}\n`);

	// Run foxLint
	if (util.saysYesTo("Run linter?")) {
		helper.performLint(ctx);
	}

	// Initialize Git
	if (util.saysYesTo("Initialize Git?")) {
		await util.exec({
			cmd: ["git", "init", "--object-format", "sha256", "-b", "main"],
		});
		await util.exec({
			cmd: [
				"git",
				"remote",
				"add",
				"origin",
				`git@github.com:${ctx.owner.username}/${ctx.repo}`,
			],
		});

		await util.exec({ cmd: ["git", "add", "-A"] });
		await util.exec({ cmd: ["git", "commit", "-m", "chore: Initial commit"] });
	}

	// Initialize GitHub
	if (util.saysYesTo("Hook up GitHub")) {
		await util.exec({
			cmd: [
				"gh",
				"repo",
				"create",
				ctx.repo,
				"--disable-wiki",
				"--public",
				"--push",
				"--remote",
				"origin",
			],
		});
	}
}
