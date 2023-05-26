import { flags, fs, path, yaml } from "../deps.ts";

import * as types from "../types.ts";
import * as util from "../util/util.ts";
import * as helper from "../util/helper.ts";
import * as projectUtils from "../util/projectUtils.ts";

export async function foxxoDocs() {
	const ctx = await helper.getContext();

	if (!ctx.git) {
		util.die("The repository must have a valid remote");
	}

	const settings = {
		docsInputDir: "docs",
		docsOutputDir: "site",
		remoteName: "origin",
		remoteBranchNameSource: "main",
		remoteBranchName: "site",
		options: {
			mkdocs: {
				// repo_name
				// nav
				theme: {
					name: "readthedocs",
					locale: "en",
				},
				use_directory_urls: true,
				strict: false,
			},
		},
	};

	const remoteUrls = {
		api: `https://api.github.com/repos/${ctx.git.owner}/${ctx.git.repo}`,
		site: `https://${ctx.git.owner}.github.io/${ctx.git.repo}`,
		repo: `https://github.com/${ctx.git.owner}/${ctx.git.repo}`,
	};

	const mkdocsYml = {
		site_name: ctx.git.repo,
		site_url: remoteUrls.site,
		repo_url: remoteUrls.repo,
		edit_uri: `edit/${settings.remoteBranchNameSource}/${settings.docsInputDir}/`,
		// site_description: "", // TODO
		site_author: ctx.person.fullname,
		copyright: `© ${ctx.person.fullname}`,
		remote_branch: settings.remoteBranchName,
		remote_name: settings.remoteName,
		docs_dir: path.join(ctx.dir, settings.docsInputDir),
		site_dir: path.join(ctx.dir, settings.docsOutputDir),
		...settings.options.mkdocs,
	};

	// Push documentation branch to remote
	{
		const tmpDir = await Deno.makeTempDir({
			prefix: "foxxo-",
		});
		try {
			const mkdocsFile = path.join(tmpDir, "./mkdocs.yml");
			await Deno.writeTextFile(mkdocsFile, yaml.stringify(mkdocsYml));

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
					settings.remoteName,
					"--branch",
					settings.remoteBranchName,
					settings.docsOutputDir,
				],
			});
		} finally {
			await Deno.remove(tmpDir, { recursive: true });
		}
	}

	// Ensure GitHub pages are active
	{
		const res = await fetch(`${remoteUrls.api}/pages`, {
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: `token ${ctx.github_token}`,
			},
		});
		if (res.ok) {
			util.logInfo("GitHub pages already exists");
		} else {
			util.logInfo("GitHub pages does not exist. Creating now");
			const res = await fetch(`${remoteUrls.api}/pages`, {
				method: "POST",
				headers: {
					accept: "application/vnd.github.v3+json",
					authorization: `token ${ctx.github_token}`,
				},
				body: JSON.stringify({
					source: {
						branch: settings.remoteBranchName,
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

	// TODO
	// {
	// 	util.logInfo("Updating CNAME and https enforced");
	// 	const res = await fetch(`${remoteUrls.api}/pages`, {
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

	// Update remote with website URL
	{
		util.logInfo("Updating website repo");
		const res = await fetch(`${remoteUrls.api}`, {
			method: "PATCH",
			headers: {
				accept: "application/vnd.github.v3+json",
				authorization: `token ${ctx.github_token}`,
			},
			body: JSON.stringify({
				homepage: `https://${ctx.git.owner}.github.io/${ctx.git.repo}`,
			}),
		});
		if (!res.ok) {
			const json = await res.json();
			console.warn(json);
			util.die("Failed to set homepage for GitHub repo");
		}
	}
}
