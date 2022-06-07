import { buffer } from "../deps.ts";

export async function incrementVersion(oldVersion: string): Promise<string> {
	console.log(`Old version: ${oldVersion}`);
	Deno.write(Deno.stdout.rid, new TextEncoder().encode("New version?: "));
	const newVersion = await promptString();
	console.log(`You chose: ${newVersion}`);

	if (!newVersion) {
		// FIXME
		console.error("Failed to get input. Exiting");
		Deno.exit(1);
	}

	return newVersion;
}

export async function promptString(): Promise<string | undefined> {
	for await (const line of buffer.readLines(Deno.stdin)) {
		return line;
	}
}
