import { fs, toml, Ajv, path, z } from "../deps.ts";
import * as types from "../types.ts";

export function die(msg: string): never {
	logError(`${msg}. Exiting`);
	Deno.exit(1);
}

export function assertInstanceOfError(err: unknown) {
	if (!(err instanceof Error)) {
		throw Error("assertInstanceOfError"); // TODO
	}

	return err;
}

export function logError(msg: string) {
	console.error(`Error: ${msg}`);
}

export function logInfo(msg: string) {
	console.log("  - " + msg);
}

export function showHelp() {
	console.log(`foxomate

Summary: Task automater and general linter

Usage: foxomate [flags] [subcommand]

Subcommands:
  init <projectType> [projectDir]

  lint [--fix=no|prompt|yes] [modules ...]

  docgen

  release [version]

Flags:
  --help

Modules:
  - ${[].join(",")}`); // TODO
}

export async function exec(
	args: Omit<Deno.RunOptions, "stdin" | "stdout" | "stderr">,
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
		status: status,
		stdout: new TextDecoder().decode(stdout),
		stderr: new TextDecoder().decode(stderr),
	};
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

export function saysYesTo(msg: string): boolean {
	const input = prompt(msg);
	if (input && /^y/iu.test(input)) {
		return true;
	}

	return false;
}
