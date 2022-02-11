export function info(msg: string) {
	console.error(`Info: ${msg}`);
}

export function error(msg: string) {
	console.error(`Error: ${msg}`);
}

export function die(msg: string) {
	error(msg);
	Deno.exit(1);
}
