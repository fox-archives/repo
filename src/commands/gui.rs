use std::process::Command;

use anyhow::Result;
use eframe::egui::{self, Button, Label, ScrollArea, TextEdit};

use crate::{repo, util};

pub struct RunGui;

impl RunGui {
	pub fn new() -> Self {
		Self
	}

	pub fn run(&self) -> Result<(), eframe::Error> {
		println!("Running GUI");
		env_logger::init(); // Log to stderr (if you run with `RUST_LOG=debug`).
		let options = eframe::NativeOptions {
			initial_window_size: Some(egui::vec2(320.0, 240.0)),
			..Default::default()
		};
		eframe::run_native("repomgr", options, Box::new(|_cc| Box::<MyApp>::default()))
	}
}

struct MyApp {
	name: String,
	age: u32,
	search_txt: String,
}

impl Default for MyApp {
	fn default() -> Self {
		Self {
			name: "Arthur".to_owned(),
			age: 42,
			search_txt: "".to_string(),
		}
	}
}

impl eframe::App for MyApp {
	fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
		egui::CentralPanel::default().show(ctx, |ui| {
			let repos = repo::get_repos().unwrap();

			ui.heading("repomgr");
			ui.text_edit_singleline(&mut self.search_txt).changed();

			// ui.add(egui::Slider::new(&mut self.age, 0..=120).text("age"));
			// if ui.button("Click each year").clicked() {
			// 	self.age += 1;
			// }
			// ui.label(format!("Hello '{}', age {}", self.name, self.age));

			ScrollArea::vertical().show(ui, |ui| {
				for repo in repos {
					if self.search_txt.is_empty() || repo.name.contains(&self.search_txt) {
						ui.horizontal(|ui| {
							ui.label(repo.name);
							if ui.button("Open").clicked() {
								Command::new("code").arg(repo.path.clone()).spawn().unwrap();
								println!("Opening {}", repo.path.display())
							}
						});
					}
				}
			});
		});
	}
}
