import { flags, fs, path, yaml } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as project from "../util/project.ts";

export async function foxDocs(ctx: types.Context, args: flags.Args) {
	const apiRepoUrl = `https://api.github.com/repos/${ctx.owner}/${ctx.repo}`;

	const mkdocsYml = {
		site_name: "dotfox",
		site_url: `https://${ctx.owner}.github.io/${ctx.repo}`,
		repo_url: `https://github.com/${ctx.owner}/${ctx.repo}`,
		// repo_name
		// edit_uri
		site_description: "",
		site_author: "Edwin Kofler",
		copyright: "© Edwin Kofler",
		remote_branch: "site",
		remote_name: "origin",
		// nav
		theme: {
			name: "readthedocs",
			locale: "en",
		},
		docs_dir: path.join(ctx.dir, "docs"),
		site_dir: path.join(ctx.dir, "site"),
		use_directory_urls: true,
		strict: false,
	};
	const content = yaml.stringify(mkdocsYml);

	const tmpDir = await Deno.makeTempDir({
		prefix: "fox-",
	});
	try {
		const mkdocsFile = path.join(tmpDir, "./mkdocs.yml");
		await Deno.writeTextFile(mkdocsFile, content);

		await util.exec({
			cmd: ["pipx", "run", "mkdocs", "build", "-f", mkdocsFile],
		});

		await util.exec({
			cmd: [
				"pipx",
				"run",
				"ghp-import",
				"--no-jekyll",
				"--push",
				"--remote",
				"origin",
				"--branch",
				"site",
				"./site",
			],
		});
	} finally {
		await Deno.remove(tmpDir, { recursive: true });
	}

	// Ensure GitHub pages are active
	{
		const res = await fetch(`${apiRepoUrl}/pages`, {
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: `token ${ctx.github_token}`,
			},
		});
		if (res.ok) {
			util.logInfo("GitHub pages already exists");
		} else {
			util.logInfo("GitHub pages does not exist. Creating now");
			const res = await fetch(`${apiRepoUrl}/pages`, {
				method: "POST",
				headers: {
					accept: "application/vnd.github.v3+json",
					authorization: `token ${ctx.github_token}`,
				},
				body: JSON.stringify({
					source: {
						branch: "site",
						path: "/",
					},
				}),
			});
			if (!res.ok) {
				const json = await res.json();
				console.error(json);
				util.die("Failed to create GitHub pages");
			}
		}
	}

	// {
	// 	util.logInfo("Updating CNAME and https enforced");
	// 	const res = await fetch(`${apiRepoUrl}/pages`, {
	// 		method: "PUT",
	// 		headers: {
	// 			accept: "application/vnd.github.v3+json",
	// 			authorization: `token ${ctx.github_token}`,
	// 		},
	// 		body: JSON.stringify({
	// 			cname: null,
	// 			https_enforced: true,
	// 		}),
	// 	});
	// 	if (!res.ok) {
	// 		const json = await res.json();
	// 		console.warn(json);
	// 		util.die("Failed to do thing 3");
	// 	}
	// }

	// Update "website" repo parameter
	{
		util.logInfo("Updating website repo");
		const res = await fetch(`${apiRepoUrl}`, {
			method: "PATCH",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: `token ${ctx.github_token}`,
			},
			body: JSON.stringify({
				homepage: `https://${ctx.owner}.github.io/${ctx.repo}`,
			}),
		});
		if (!res.ok) {
			const json = await res.json();
			console.warn(json);
			util.die("Failed to do thing");
		}
	}
}
