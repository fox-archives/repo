import { fs, toml, Ajv, z } from "../deps.ts";
import { FoxConfig, FoxConfigSchema } from "../types.ts";
import * as types from "../types.ts";

export type Opts = {
	fix: "no" | "prompt" | "yes";
};

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

export function printLineError(
	row: number,
	column: number,
	rule: string,
	ruleReason: string
) {
	logInfo(`${rule}: ${ruleReason} (row ${row}, column ${column})`);
}

export function logMissingProperty(property: string) {
	logInfo(`There should be a '${property}' property`);
}

export function logWrongPropertyValue(
	property: string,
	value: string | number | boolean
) {
	logInfo(`There should be a '${property}' property with a value of ${value}`);
}

export function ensureNotEmpty(property: string, value: string) {
	if (value === null) {
		logInfo(`The '${property}' property should not be null`);
	} else if (typeof value === "object") {
		if (Object.keys(value).length === 0) {
			logInfo(`The '${property}' property should not be an empty object`);
		}
	} else if (Array.isArray(value)) {
		logInfo(`The '${property}' property should not be an empty array`);
	} else if (typeof value === "string") {
		if (value.trim() === "") {
			logInfo(`The '${property}' property should not be empty`);
		}
	} else {
		logInfo(`The type for '${property}' is unaccounted for`);
	}
}

export async function writeFile(
	opts: types.ModuleOptions,
	path: string | URL,
	text: string
) {
	if (opts.fix === "prompt") {
		console.info("Prompting to overwrite not implemented");
		// await Deno.writeTextFile(path, text);
	} else if (opts.fix === "yes") {
		await Deno.writeTextFile(path, text);
	}
}

export function showHelp() {
	console.log(`foxomate

Summary: Task automater and general linter

Usage: foxomate [flags] [subcommand]

Subcommands:
  init [--lang=<lang>]

  lint [--fix=no|prompt|yes] [modules ...]

  release [version]

Flags:
  --help

Modules:
  - ${[].join(",")}`); // TODO
}

export async function run(args: string[]): Promise<void> {
	const process = Deno.run({
		cmd: args,
	});
	const status = await process.status();
	process.close();
	if (!status.success) {
		Deno.exit(1);
	}
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

export async function getFoxConfig(): Promise<FoxConfig> {
	const validateCfg = (obj: unknown) => {
		const data = FoxConfigSchema.safeParse(obj);
		if (!data.success) {
			// TODO
			console.error(data.error.issues);
			die("Schema validation failed");
		}

		return obj as FoxConfig;
	};

	try {
		const foxJson = await Deno.readTextFile("./fox.json");
		return validateCfg(JSON.parse(foxJson));
	} catch (errUnknown: unknown) {
		const err = assertInstanceOfError(errUnknown);
		if (!(err instanceof Deno.errors.NotFound)) {
			throw err;
		}
	}

	try {
		const foxToml = await Deno.readTextFile("./fox.toml");
		return validateCfg(toml.parse(foxToml));
	} catch (errUnknown: unknown) {
		const err = assertInstanceOfError(errUnknown);
		if (!(err instanceof Deno.errors.NotFound)) {
			throw err;
		}
	}

	return validateCfg({});
}
