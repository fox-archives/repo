use std::{
	fs::{self, File},
	io::{BufRead, BufReader},
	process::exit,
};

use directories::BaseDirs;
use serde::{Deserialize, Serialize};

// foxxo.toml
#[derive(Serialize, Deserialize)]
struct RepositoryManifest {
	project: Project,
	discovery: Discovery,
}

#[derive(Serialize, Deserialize)]
struct Project {
	ecosystem: String,
	form: String,
	#[serde(rename = "for")]
	t: String,
	status: String,
}

#[derive(Serialize, Deserialize)]
struct Discovery {
	categories: Vec<String>,
	tags: Vec<String>,
}

// config.toml
#[derive(Debug, Serialize, Deserialize)]
struct Config {
	person: Person,
	defaults: Defaults,
}

#[derive(Debug, Serialize, Deserialize)]
struct Person {
	fullname: String,
	email: String,
	#[serde(rename = "websiteURL")]
	website_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Defaults {
	#[serde(rename = "vcsOwner")]
	vcs_owner: String,
	#[serde(rename = "vcsSite")]
	vcs_site: String,
}

pub fn parse_local_config() {
	let Some(base_dirs) = BaseDirs::new() else {
		eprintln!("Failed to get base_dirs");
		exit(1);
	};

	let config_file = base_dirs.config_dir().join("foxxo/config.json");

	let file = File::open(config_file).unwrap();
	let rdr = BufReader::new(file);
	let config: Config = serde_json::from_reader(rdr).unwrap();

	println!("{:?}", config);
}
