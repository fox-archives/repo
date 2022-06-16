import { fs, toml, Ajv, path, z } from "../deps.ts";

import * as types from "../types.ts";

export function die(msg: string): never {
	logError(`${msg}. Exiting`);
	Deno.exit(1);
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
export function saysYesTo(msg: string): boolean {
	const input = prompt(msg);
	if (input && /^y/iu.test(input)) {
		return true;
	}

	return false;
}

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

export function validateAjv<T>(schema: Record<string, unknown>, data: unknown) {
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

export async function getGitRemoteInfo(): Promise<types.GitRemoteInfo> {
	const result = await exec(
		{
			cmd: ["git", "remote", "get-url", "origin"],
		},
		{ allowFailure: true }
	);

	if (result.status.success) {
		if (result.stdout.includes("@")) {
			// SSH
			const match =
				/git@(?<site>.+?):(?<owner>.+?)\/(?<repo>.+?(?=.git))/u.exec(
					result.stdout
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
		} else if (result.stdout.includes("http")) {
			// HTTPS
			const match =
				/https?:\/\/(?<site>.+?)\/(?<owner>.+?)\/(?<repo>.+?(?=.git))/u.exec(
					result.stdout
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

export async function readConfig(
	dir: string,
	name: string
): Promise<Record<string, unknown>> {
	try {
		const foxJson = await Deno.readTextFile(path.join(dir, name + ".json"));
		return JSON.parse(foxJson);
	} catch (errUnknown: unknown) {
		const err = assertInstanceOfError(errUnknown);
		if (!(err instanceof Deno.errors.NotFound)) {
			throw err;
		}
	}

	try {
		const foxToml = await Deno.readTextFile(path.join(dir, name + ".toml"));
		return toml.parse(foxToml);
	} catch (errUnknown: unknown) {
		const err = assertInstanceOfError(errUnknown);
		if (!(err instanceof Deno.errors.NotFound)) {
			throw err;
		}
	}

	return {};
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
	console.log(`foxxy

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
