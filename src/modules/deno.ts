// TODO: parse deno.json and test for fmt.options etc.

export const name = "Deno";
export const description = "Lint deno.json";
export const onFilesHooks = [
	{
		files: ["deno.json"],
	},
];
