import { flags, fs, path } from "../deps.ts";

import * as util from "../util/util.ts";

async function ArrayFromAsync<T>(asyncItems: AsyncIterable<T>) {
	const arr = [];
	for await (const item of asyncItems) {
		arr.push(await item);
	}
	return arr;
}

function die(msg: string) {
	console.error(`Error: ${msg}`);
	Deno.exit(1);
}

export async function subcommandInit(args: flags.Args) {
	const projectDir = String(args._[1] || "");
	const projectType = String(args._[2] || "");

	if (!projectDir) {
		die("Failed to specify project directory");
	}
	if (!/(?:(?:-|[[:alnum:]])+|\.)/.test(projectDir)) {
		die("Failed to match directory regex");
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
			die("Unexpected");
		}

		if (err instanceof Deno.errors.NotFound) {
			await Deno.mkdir(projectDir, { recursive: true });
			Deno.chdir(projectDir);
		} else {
			throw err;
		}
	}

	if ((await ArrayFromAsync(Deno.readDir("."))).length !== 0) {
		die("Project dir must be empty");
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
			util.run(["go", "mod", "init", `github.com/${username}/${repoName}`]);
			await Deno.writeTextFile(
				"main.go",
				`package main

func main() {
	fmt.Println("Hello World");
}\n`
			);
			break;
		default:
			die("Not supported projectType");
			break;
	}

	console.log(`Using ${repoName}`);

	if (await fs.exists(".git")) {
		console.log("Info: Already have git directory. Skipping Git init stuff");
	} else {
		await util.run(["git", "init"]);

		await util.run([
			"git",
			"remote",
			"add",
			"origin",
			`git@github.com:${username}/${repoName}`,
		]);

		await util.run(["git", "add", "-A"]);
		await util.run(["git", "commit", "-m", "chore: Initial commit"]);
	}

	await Deno.writeTextFile(
		"Bakefile.sh",
		`# shellcheck shell=bash
task.build() {
	:
}

task.util.run() {
	:
}

task.version() {
	:
}

task.release() {
	:
}\n`
	);
	await util.run(["bake"]);

	await Deno.writeTextFile("README.md", `${repoName}\n`);

	await util.run(["gh", "repo", "create", repoName, "--public"]);
	await util.run(["git", "push", "-u", "origin", "main"]);
}
