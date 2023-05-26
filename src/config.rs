use std::{fs::File, io::BufReader};

use anyhow::Result;
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

pub fn parse_local_config() -> Result<()> {
	let base_dirs = BaseDirs::new().expect("Failed to create BaseDirs");

	let config_file = base_dirs.config_dir().join("foxxo/config.json");

	let file = File::open(config_file)?;
	let rdr = BufReader::new(file);
	let config: Config = serde_json::from_reader(rdr)?;

	println!("{:?}", config);

	Ok(())
}
