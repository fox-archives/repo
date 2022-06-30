import { fs, toml, Ajv, path, z, flags, Confirm } from "../deps.ts";

import * as types from "../types.ts";

export async function pathExists(filePath: string) {
	return await fs.exists(filePath);
}

export function die(msg: string): never {
	logFatal(`${msg}. Exiting`);
	Deno.exit(1);
}

export function dieWithHints(msg: string, hints: string[]): never {
	logFatal(`${msg}`);
	for (const hint of hints) {
		console.error(`  - ${hint}`);
	}
	Deno.exit(1);
}

export function logFatal(msg: string) {
	console.error(`Fatal: ${msg}`);
}

export function logError(msg: string) {
	console.error(`Error: ${msg}`);
}

export function logInfo(msg: string) {
	console.log("  - " + msg);
}

export function assertInstanceOfError(err: unknown) {
	if (!(err instanceof Error)) {
		throw Error("Thrown value is not an instance of Error");
	}

	return err;
}

export async function maybeReadFile(file: string): Promise<[boolean, string]> {
	let hasFile = false;
	let text = "";
	try {
		hasFile = true;
		text = await Deno.readTextFile(file);
	} catch (unknownError: unknown) {
		const err = assertInstanceOfError(unknownError);
		if (!(err instanceof Deno.errors.NotFound)) {
			throw err;
		}
	}

	return [hasFile, text];
}

// TODO: naming
export async function mustReadFile(file: string) {
	try {
		const text = await Deno.readTextFile(file);
		return text;
	} catch (unknownError) {
		const err = assertInstanceOfError(unknownError);
		die(`Failed to read file: ${file} (${err.name})`);
	}
}

export async function mustRemoveFile(file: string) {
	try {
		await Deno.remove(file);
	} catch (unknownError: unknown) {
		const err = assertInstanceOfError(unknownError);
		if (!(err instanceof Deno.errors.NotFound)) {
			throw err;
		}
	}
}

export async function mustRemoveDirectory(directory: string) {
	try {
		await Deno.remove(directory, { recursive: true });
	} catch (unknownError: unknown) {
		const err = assertInstanceOfError(unknownError);
		if (!(err instanceof Deno.errors.NotFound)) {
			throw err;
		}
	}
}

export async function writeButAskBeforeOverride(file: string, content: string) {
	// const f = await Deno.open(file, { write: true, create: true });
	// await f.write(new TextEncoder().encode(content));

	// f.close();

	// TODO
	if (await fs.exists(file)) {
		if (await Confirm.prompt(`Would you like to override file ${file}?`)) {
			await Deno.writeTextFile(file, content);
		}
	} else {
		await Deno.writeTextFile(file, content);
	}
}

export async function writeButDoNotOverride(file: string, content: string) {
	if (!(await fs.exists(file))) {
		await Deno.writeTextFile(file, content);
	}
}

export function lintObject() {}

export async function hasPath(glob: string) {
	let exists = false;
	for await (const _entry of fs.expandGlob(glob)) {
		exists = true;
		break;
	}
	return exists;
}

export async function arrayFromAsync<T>(asyncItems: AsyncIterable<T>) {
	const arr = [];
	for await (const item of asyncItems) {
		arr.push(await item);
	}
	return arr;
}

export function validateAjv<T>(
	schema: Record<string, unknown>,
	data: Record<string, unknown>
) {
	const ajv = new Ajv();

	const validate = ajv.compile(schema);
	const valid = validate(data);
	if (!valid) {
		console.error(validate.errors); // FIXME better error
		die("Failed to validate against schema");
	}

	return data as T;
}

export function validateZod<T>(schema: z.ZodType, data: unknown) {
	const parsedData = schema.safeParse(data);
	if (!parsedData.success) {
		console.error(parsedData.error.issues); // FIXME better error
		die("Failed to validate against schema");
	}

	return data as T;
}

export async function getVcsInfo(): Promise<types.VcsInfo> {
	const result = await exec(
		{
			cmd: ["git", "remote", "get-url", "origin"],
		},
		{ allowFailure: true }
	);

	let remoteUrl = result.stdout.trim();
	if (remoteUrl.endsWith(".git")) {
		remoteUrl = remoteUrl.slice(0, remoteUrl.lastIndexOf(".git"));
		await exec({
			cmd: ["git", "remote", "set-url", "origin", remoteUrl],
		});
	}

	if (result.status.success) {
		if (remoteUrl.includes("@")) {
			// SSH
			const match = /git@(?<site>.+?):(?<owner>.+?)\/(?<repo>.+)/u.exec(
				remoteUrl
			);

			const groups = match?.groups || {};
			if ("site" in groups && "owner" in groups && "repo" in groups) {
				return {
					site: groups.site,
					owner: groups.owner,
					repo: groups.repo,
				};
			} else {
				die("Failed to extract info from remote url");
			}
		} else if (remoteUrl.includes("http")) {
			// HTTPS
			const match = /https?:\/\/(?<site>.+?)\/(?<owner>.+?)\/(?<repo>.+)/u.exec(
				remoteUrl
			);

			const groups = match?.groups || {};
			if ("site" in groups && "owner" in groups && "repo" in groups) {
				return {
					site: groups.site,
					owner: groups.owner,
					repo: groups.repo,
				};
			} else {
				die("Failed to extract info from remote url");
			}
		} else {
			die("Failed to recognize format of remote url");
		}
	}
}

export async function exec(
	args: Pick<Deno.RunOptions, "cmd" | "cwd" | "env">,
	{ allowFailure = true, printCmd = true } = {}
) {
	if (printCmd) {
		console.log(`Executing: ${args.cmd.join(" ")}`);
	}

	const p = Deno.run({
		cmd: args.cmd,
		cwd: args.cwd,
		env: args.env,
		stdin: "null",
		stdout: "piped",
		stderr: "piped",
	});
	const [status, stdout, stderr] = await Promise.all([
		p.status(),
		p.output(),
		p.stderrOutput(),
	]);
	p.close();
	if (!status.success) {
		if (!allowFailure) {
			// TODO
			console.log("STDOUT");
			console.log(new TextDecoder().decode(stdout));
			console.log("STDERR");
			console.error(new TextDecoder().decode(stderr));
			die("Executing process unexpectedly failed");
		}
	}

	return {
		status,
		stdout: new TextDecoder().decode(stdout),
		stderr: new TextDecoder().decode(stderr),
	};
}

export function showHelp() {
	console.log(`Name: foxxy

Summary: Task automater and general linter

Usage: foxxy [flags] [subcommand]

Subcommands:
  init
    Initialize a new project

  lint [--fix]
    Runs Foxxy linters for this project. By default, it will list all
    errors; optionally automatically fix the errors by passing '--fix'

  docs
    Generates docs and push changes to GitHub

  release
    Create a version, release, and publish

Flags:
  --help
`);
}
