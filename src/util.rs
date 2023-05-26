use std::{env, fs, path::PathBuf, process::exit};

use anyhow::Result;
use directories::BaseDirs;
use minijinja::{context, Environment};
use walkdir::WalkDir;

pub fn get_templates_dir() -> PathBuf {
	BaseDirs::new()
		.expect("Failed to create BaseDirs")
		.home_dir()
		.join("groups/Meta/templates")
}

pub fn get_bin_dir() -> Result<PathBuf> {
	let dir = BaseDirs::new()
		.expect("Failed to create BaseDirs")
		.home_dir()
		.join(".local/state/repomgr/bin");
	fs::create_dir_all(&dir)?;

	Ok(dir)
}

fn should_skip_dir(entry: &walkdir::DirEntry) -> bool {
	let name = entry.file_name();

	for v in vec![
		"node_modules",
		"dist",
		"build",
		".cache",
		".gradle",
		".template",
		"target",
		".next",
		"favicon.ico",
	] {
		if name == v {
			return true;
		}
	}

	false
}

pub struct TemplateVars {
	pub template_name: String,
}

pub fn use_template(source: PathBuf, target: PathBuf, vars: TemplateVars) -> Result<()> {
	for entry in WalkDir::new(&source)
		.into_iter()
		.filter_entry(|e| !should_skip_dir(e))
	{
		let entry = entry?;

		if !entry.path().is_file() {
			continue;
		}

		let source_file = entry.path().to_str().unwrap();

		let source_relfile = source_file
			.strip_prefix(source.to_str().unwrap())
			.unwrap()
			.strip_prefix("/")
			.unwrap();

		let target_file =
			PathBuf::from(env::current_dir().expect("Failed to get current working directory"))
				.join(&target)
				.join(&source_relfile);

		println!("{}", source_file);
		let input_file = fs::read_to_string(source_file)?;
		let mut env = Environment::new();
		env.add_template("default", input_file.as_str())?;
		let tmpl = env.get_template("default")?;
		let output_file = tmpl.render(context!(project_name => vars.template_name))?;

		fs::create_dir_all(target_file.parent().unwrap())?;
		fs::write(target_file, output_file)?;
	}

	Ok(())
}

pub struct TemplateInfo {
	pub name: String,
	pub dir: PathBuf,
	pub target_dir: PathBuf,
}

pub fn get_template_info(template_name: String, target_dirname: String) -> TemplateInfo {
	let Some(base_dirs) = BaseDirs::new() else {
		eprintln!("Failed to get base_dirs");
		exit(1);
	};

	let template_dir = get_templates_dir().join(&template_name);
	if !template_dir.exists() {
		eprintln!("Failed to find template named '{}'", template_name);
		exit(1);
	}

	let Ok(current_dir) = env::current_dir() else {
		eprintln!("Failed to get current directory");
		exit(1);
	};
	let target_dir = PathBuf::from(current_dir).join(&target_dirname);

	TemplateInfo {
		name: template_name,
		dir: template_dir,
		target_dir,
	}
}
