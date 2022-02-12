export function logInfo(msg: string) {
	console.error(`Info: ${msg}`);
}

export function logError(msg: string) {
	console.error(`Error: ${msg}`);
}

export function die(msg: string) {
	logError(msg);
	Deno.exit(1);
}

export function writeFile(path: string | URL, text: string) {
	return Deno.writeTextFile(path, text);
}
