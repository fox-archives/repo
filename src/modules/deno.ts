// TODO: parse deno.json and test for fmt.options etc.

export function moduleDeno() {
	return {
		name: "Deno",
		description: "For deno projects",
		hooksFile: [
			{
				files: ["deno.json"],
			},
		],
	};
}
