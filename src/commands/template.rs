use std::{fs, process::exit};

use anyhow::Result;
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};

use crate::util::{self, use_template, TemplateInfo, TemplateVars};

pub struct RunTemplate;

impl RunTemplate {
	pub fn new() -> Self {
		Self {}
	}

	pub fn command_use(&self, template: TemplateInfo, watch: bool) -> Result<()> {
		fs::create_dir_all(&template.target_dir).unwrap();

		if !watch {
			let is_empty = template.target_dir.read_dir()?.next().is_none();
			if !is_empty {
				eprintln!(
					"Target directory is not empty: {}",
					template.target_dir.to_str().unwrap()
				);
				exit(1);
			}
		}

		use_template(
			template.dir.clone(),
			template.target_dir.clone(),
			TemplateVars {
				template_name: template.name.clone(),
			},
		)
		.unwrap();

		println!("Starting Watch...");
		if watch {
			// watch
			let (tx, rx) = std::sync::mpsc::channel();

			// Automatically select the best implementation for your platform.
			// You can also access each implementation directly e.g. INotifyWatcher.
			let mut watcher = RecommendedWatcher::new(tx, Config::default())?;

			// Add a path to be watched. All files and directories at that path and
			// below will be monitored for changes.
			watcher.watch((&template.dir).as_ref(), RecursiveMode::Recursive)?;

			for res in rx {
				match res {
					Ok(event) => {
						println!("re-templating {}", &template.name);
						use_template(
							template.dir.clone(),
							template.target_dir.clone(),
							TemplateVars {
								template_name: template.name.clone(),
							},
						)?;
					}
					Err(e) => println!("watch error: {:?}", e),
				}
			}
		}

		Ok(())
	}

	pub fn command_new(&self, template_name: String) -> Result<()> {
		let template_dir = util::get_templates_dir();

		let dir = template_dir.join(template_name);
		if dir.exists() {
			eprintln!("already exists");
			()
		}

		fs::create_dir_all(&dir)?;
		fs::write(dir.join(".editorconfig"), "root = true\n")?;

		println!("{}", dir.display());
		Ok(())
	}

	pub fn list(&self) -> Result<()> {
		let template_dir = util::get_templates_dir();

		if !template_dir.exists() {
			return Ok(());
		}

		for entry in fs::read_dir(template_dir)? {
			let path = entry?.path();
			let filename = path.file_name().unwrap();
			println!("{}", filename.to_string_lossy());
		}

		Ok(())
	}
}
