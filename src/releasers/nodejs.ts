import * as releaseUtils from "../util/releaseUtils.ts";

export default {
	id: "nodejs",
	name: "NodeJS",
	async release() {
		const packageJsonFile = "./package.json";
		const packageJson = JSON.parse(await Deno.readTextFile(packageJsonFile));
		const newVersion = await releaseUtils.incrementVersion(packageJson.version);
		packageJson.version = newVersion;

		await Deno.writeTextFile(
			packageJsonFile,
			JSON.stringify(packageJson, null, "\t")
		);
	},
};
