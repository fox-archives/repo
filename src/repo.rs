use std::{error::Error, fs, path::PathBuf};

use anyhow::{Ok, Result};

pub struct Repo {
	pub name: String,
	pub category: String,
	pub path: PathBuf,
}

pub fn get_repos() -> Result<Vec<Repo>> {
	let repos_dir = "/home/edwin/Docs/Programming/Repositories";
	let mut repos = Vec::new();

	for entry in std::fs::read_dir(repos_dir)? {
		let entry = entry?;
		let path = entry.path();

		if !path.is_dir() {
			continue;
		}

		for subentry in fs::read_dir(path.clone())? {
			let subentry = subentry?;
			let subpath = subentry.path();

			if !subpath.is_dir() {
				continue;
			}

			let name = String::from(subpath.file_name().unwrap().to_str().unwrap());
			let category = path.file_name().unwrap().to_str().unwrap().to_owned();

			repos.push({
				Repo {
					name,
					category,
					path: subpath,
				}
			});
		}
	}

	Ok(repos)
}
