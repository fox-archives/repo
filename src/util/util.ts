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

export function ensureNotEmpty(property: string, str: string) {
	if (str.trim() === "") {
		logError(`The '${property}' property should not be empty`);
	}
}

export async function writeFile(path: string | URL, text: string) {
	// if (globalThis.opts.shouldWrite) {
	await Deno.writeTextFile(path, text);
	// }
}
