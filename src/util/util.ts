import { moduleNames } from "../subcommands/lint.ts";

import { fs, toml, Ajv, z } from "../deps.ts";
import { FoxConfig, FoxConfigSchema } from "../types.ts";

export type Opts = {
	fix: "no" | "prompt" | "yes";
};

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

export async function writeFile(opts: Opts, path: string | URL, text: string) {
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
  - ${moduleNames.join(",")}`);
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

export async function arrayFromAsync<T>(asyncItems: AsyncIterable<T>) {
	const arr = [];
	for await (const item of asyncItems) {
		arr.push(await item);
	}
	return arr;
}

export async function determineFoxConfig(): Promise<FoxConfig> {
	const attemptParse = async (
		fn: () => Promise<Record<string, unknown>>
	): Promise<Record<string, unknown> | undefined> => {
		try {
			const content = await fn();
			return content;
		} catch (err: unknown) {
			if (!(err instanceof Error)) die("Failed");

			if (err instanceof Deno.errors.NotFound) {
				return undefined;
			} else {
				throw err;
			}
		}
	};

	const toFoxConfig = (obj: Record<string, unknown>): FoxConfig => {
		// const schema = {
		// 	type: "object",
		// 	additionalProperties: false,
		// 	properties: {
		// 		ecosystem: {
		// 			type: "string",
		// 		},
		// 		variant: {
		// 			type: "string",
		// 		},
		// 	},
		// };
		// const ajv = new Ajv.Ajv();
		// const validate = ajv.compile(schema);
		// const valid = validate(obj);
		// if (!valid) {
		// 	console.error("Validation error");
		// 	throw new Error(validate.errors);
		// }

		const data = FoxConfigSchema.safeParse(obj);
		if (!data.success) {
			console.error(data.error.issues);
			die("Schema validation failed");
		}

		return obj as FoxConfig;
	};

	for (const result of await Promise.allSettled([
		attemptParse(async () => {
			const content = await Deno.readTextFile("./fox.json");
			const contentJson = JSON.parse(content) as unknown;
			if (typeof contentJson !== "object" || contentJson === null) {
				throw new Error("Top level not a JSON object");
			}
			return contentJson as Record<string, unknown>;
		}),
		attemptParse(async () => {
			const content = await Deno.readTextFile("./fox.toml");
			return toml.parse(content);
		}),
	])) {
		if (result.status === "rejected") {
			console.error("Promise failed"); // FIXME
			die(result.reason);
		}

		if (!result.value) continue;
		return toFoxConfig(result.value);
	}

	return toFoxConfig({});
}
