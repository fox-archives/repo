import { flags, fs, path } from "../deps.ts";

import * as util from "../util/util.ts";
import * as types from "../types.ts";

export async function foxInit(ctx: types.Context, args: flags.Args) {
	const projectDir = String(args._[1] || "");
	const projectType = String(args._[2] || "");

	if (!projectDir) {
		util.die("Failed to specify project directory");
	}
	if (!/(?:(?:-|[[:alnum:]])+|\.)/.test(projectDir)) {
		util.die("Failed to match directory regex");
	}
	if (!projectType) {
		console.log(`Failed to specify project type`);
		Deno.exit(1);
	}

	// projectDir
	try {
		Deno.chdir(projectDir);
	} catch (err: unknown) {
		if (!(err instanceof Error)) {
			util.die("Unexpected");
		}

		if (err instanceof Deno.errors.NotFound) {
			await Deno.mkdir(projectDir, { recursive: true });
			Deno.chdir(projectDir);
		} else {
			throw err;
		}
	}

	if ((await util.arrayFromAsync(Deno.readDir("."))).length !== 0) {
		util.die("Project dir must be empty");
	}

	const username = "hyperupcall";
	const repoName = path.basename(Deno.cwd());

	// projectType
	// Create a file that identifies what type the project is, and create a simple hello world
	switch (projectType) {
		case "node":
		case "nodejs":
			await Deno.writeTextFile("package.json", "{}\n");
			await Deno.writeTextFile("index.ts", `console.log("Hello, World!")`);
			break;
		case "deno":
			await Deno.writeTextFile("deno.jsonc", "{}\n");
			await Deno.writeTextFile("main.ts", `console.log("Hello, World!")`);
			break;
		case "go":
		case "golang":
			util.exec({
				cmd: ["go", "mod", "init", `github.com/${username}/${repoName}`],
			});
			await Deno.writeTextFile(
				"main.go",
				`package main

func main() {
	fmt.Println("Hello World");
}\n`
			);
			break;
		default:
			util.die("Not supported projectType");
			break;
	}

	console.log(`Using ${repoName}`);

	if (await fs.exists(".git")) {
		console.log("Info: Already have git directory. Skipping Git init stuff");
	} else {
		await util.exec({ cmd: ["git", "init"] });

		await util.exec({
			cmd: [
				"git",
				"remote",
				"add",
				"origin",
				`git@github.com:${username}/${repoName}`,
			],
		});

		await util.exec({ cmd: ["git", "add", "-A"] });
		await util.exec({ cmd: ["git", "commit", "-m", "chore: Initial commit"] });
	}

	await Deno.writeTextFile(
		"Bakefile.sh",
		`# shellcheck shell=bash
task.build() {
	:
}

task.util.exec() {
	:
}

task.version() {
	:
}

task.release() {
	:
}\n`
	);
	await util.exec({ cmd: ["bake"] });

	await Deno.writeTextFile("README.md", `${repoName}\n`);

	await util.exec({ cmd: ["gh", "repo", "create", repoName, "--public"] });
	await util.exec({ cmd: ["git", "push", "-u", "origin", "main"] });
}
