use std::{fs, process::exit};

use directories::BaseDirs;
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};

use crate::util::{use_template, TemplateInfo, TemplateVars};

pub struct RunTemplate;

impl RunTemplate {
	pub fn new() -> Self {
		Self {}
	}

	pub fn command_use(&self, template: TemplateInfo, watch: bool) {
		fs::create_dir_all(&template.target_dir).unwrap();

		if !watch {
			let is_empty = template.target_dir.read_dir().unwrap().next().is_none();
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
		);

		if watch {
			// watch
			let (tx, rx) = std::sync::mpsc::channel();

			// Automatically select the best implementation for your platform.
			// You can also access each implementation directly e.g. INotifyWatcher.
			let mut watcher = RecommendedWatcher::new(tx, Config::default()).unwrap();

			// Add a path to be watched. All files and directories at that path and
			// below will be monitored for changes.
			watcher
				.watch((&template.dir).as_ref(), RecursiveMode::Recursive)
				.unwrap();

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
						);
					}
					Err(e) => println!("watch error: {:?}", e),
				}
			}
		}
	}

	pub fn command_new(&self, template_name: String) {
		let template_dir = BaseDirs::new().unwrap().home_dir().join("templates");

		let dir = template_dir.join(template_name);
		if dir.exists() {
			eprintln!("already exists");
			return;
		}

		fs::create_dir_all(&dir).unwrap();
		fs::write(dir.join(".editorconfig"), "root = true\n").unwrap();

		println!("{}", dir.to_str().unwrap());
	}

	pub fn list(&self) {
		let template_dir = BaseDirs::new().unwrap().home_dir().join("templates");

		if !template_dir.exists() {
			return;
		}

		for entry in fs::read_dir(template_dir).unwrap() {
			let path = entry.unwrap().path();
			let filename = path.file_name().unwrap();
			println!("{}", filename.to_str().unwrap());
		}
	}
}
