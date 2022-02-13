export type Opts = {
	fix: "no" | "prompt" | "auto";
};

export function die(msg: string) {
	logError(msg);
	Deno.exit(1);
}

export function logError(msg: string) {
	console.error(`Error: ${msg}`);
}

export function logInfo(msg: string) {
	console.info(`Info: ${msg}`);
}

export function printLineError(
	row: number,
	column: number,
	rule: string,
	ruleReason: string
) {
	logError(`${rule}: ${ruleReason} (row ${row}, column ${column})`);
}

export function logMissingProperty(property: string) {
	logError(`There should be a '${property}' property`);
}

export function logWrongPropertyValue(
	property: string,
	value: string | number | boolean
) {
	logError(`There should be a '${property}' property with a value of ${value}`);
}

export function ensureNotEmpty(property: string, value: string) {
	if (value === null) {
		logError(`The '${property}' property should not be null`);
	} else if (typeof value === "object") {
		if (Object.keys(value).length === 0) {
			logError(`The '${property}' property should not be an empty object`);
		}
	} else if (Array.isArray(value)) {
		logError(`The '${property}' property should not be an empty array`);
	} else if (typeof value === "string") {
		if (value.trim() === "") {
			logError(`The '${property}' property should not be empty`);
		}
	} else {
		logError(`The type for '${property}' is unaccounted for`);
	}
}

export async function writeFile(path: string | URL, text: string) {
	// if (globalThis.opts.shouldWrite) {
	await Deno.writeTextFile(path, text);
	// }
}
