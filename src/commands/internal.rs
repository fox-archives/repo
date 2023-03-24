use serde::{Deserialize, Serialize};
use std::{fs, io, path::PathBuf, process::exit};

use minijinja::{context, Environment};

pub struct RunInternal;

#[derive(Serialize, Deserialize)]
struct BasaltPackage {
	#[serde(rename = "type")]
	t: String,
	name: String,
	slug: String,
	authors: Vec<String>,
	description: String,
}

#[derive(Serialize, Deserialize)]
struct BasaltManifest {
	package: BasaltPackage,
}

#[derive(Serialize, Deserialize)]
struct LocalFoxxoManifest {
	project: FoxxoProject,
	discovery: FoxxoDiscovery,
}

#[derive(Serialize, Deserialize)]
struct FoxxoProject {
	ecosystem: String,
	form: String,
	#[serde(rename = "for")]
	t: String,
	status: String,
}

#[derive(Serialize, Deserialize)]
struct FoxxoDiscovery {
	categories: Vec<String>,
	tags: Vec<String>,
}

impl RunInternal {
	pub fn new() -> Self {
		Self
	}

	pub fn run(&self, shell: String, cmd: &mut clap::Command) {
		let gen = match shell.as_str() {
			"bash" => clap_complete::Shell::Bash,
			"elvish" => clap_complete::Shell::Elvish,
			"fish" => clap_complete::Shell::Fish,
			"powershell" => clap_complete::Shell::PowerShell,
			"zsh" => clap_complete::Shell::Zsh,
			_ => {
				eprintln!("Shell not supported");
				exit(1);
			}
		};

		clap_complete::generate(gen, cmd, "repomgr", &mut io::stdout());
	}

	pub fn generate_readme(&self) {
		let readme_template_file = PathBuf::from("README.md.jinja");
		if !readme_template_file.exists() {
			eprintln!("README.md.jinja file not found");
			exit(1)
		}

		let foxxo_file = PathBuf::from("foxxo.toml");
		if !foxxo_file.exists() {
			eprintln!("stopping since foxxo.toml not present");
			exit(1)
		}

		let repomgr_config: LocalFoxxoManifest =
			toml::from_str(fs::read_to_string(foxxo_file).unwrap().as_str()).unwrap();
		match repomgr_config.project.ecosystem.as_str() {
			"rust" => {
				let cargo_toml_content: cargo_toml::Manifest =
					toml::from_str(fs::read_to_string("Cargo.toml").unwrap().as_str()).unwrap();

				let p = cargo_toml_content.package.unwrap();
				let project_name = p.name;
				let project_description = p.description.unwrap();
				let project_description = project_description.unwrap();

				let input_file = fs::read_to_string(readme_template_file).unwrap();
				let mut env = Environment::new();
				env.add_template("default", input_file.as_str()).unwrap();
				let tmpl = env.get_template("default").unwrap();
				let output_file = tmpl
					.render(
						context!(readme_pre => format!("# {project_name}\n\n{project_description}\n\n---"), readme_post => "", readme_heading_installation => r"## Installation
```sh
cargo install exa
```
")
					)
					.unwrap();

				fs::write("README.md", output_file.as_str()).unwrap();
			}
			"basalt" => {
				let basalt_toml_file = PathBuf::from("basalt.toml");

				if !basalt_toml_file.exists() {
					eprintln!("Failed to find basalt.toml");
					exit(1);
				}

				let basalt_toml: BasaltManifest =
					toml::from_str(fs::read_to_string(basalt_toml_file).unwrap().as_str()).unwrap();
				let project_name = basalt_toml.package.name;
				let project_description = basalt_toml.package.description;
				let project_slug = basalt_toml.package.slug;

				let input_file = fs::read_to_string(readme_template_file).unwrap();
				let mut env = Environment::new();
				env.add_template("default", input_file.as_str()).unwrap();
				let tmpl = env.get_template("default").unwrap();
				let output_file = tmpl
						.render(
							context!(readme_pre => format!("# {project_name}\n\n{project_description}\n\n---"), readme_post => "", readme_heading_installation => format!("## Installation

Use [Basalt](https://github.com/hyperupcall/basalt), a Bash package manager, to add this project as a dependency

```sh
basalt add hyperupcall/bash-object/{project_slug}
```
"))
						)
						.unwrap();

				fs::write("README.md", output_file.as_str()).unwrap();
			}
			_ => {
				eprintln!("ecosystem not supported");
				exit(1);
			}
		}
	}
}
