export type Opts = {
	fix: "no" | "prompt" | "yes";
};

export function die(msg: string) {
	logError(msg);
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
