import { flags, c, fs, path } from "../deps.ts";
import NodeJSReleaser from "../releasers/nodejs.ts";

export async function foxRelease(args: flags.Args) {
	await NodeJSReleaser.release();
}
