use std::{
	fs,
	path::Path,
	process::{exit, Command},
};

pub struct RunTask;

impl RunTask {
	pub fn new() -> Self {
		Self {}
	}

	pub fn run(&self, ecosystem: String, task_name: Option<String>) {
		let task_name = task_name.unwrap();

		match ecosystem.as_str() {
			"nodejs" => {
				let get_pkg_mgr = || -> &str {
					if Path::new("package-lock.json").exists() {
						"npm"
					} else if Path::new("yarn.lock").exists() {
						"yarn"
					} else if Path::new("pnpm-lock.yml").exists() {
						"pnpm"
					} else {
						"npm"
					}
				};

				let pkg_mgr = get_pkg_mgr();
				exec(
					task_name,
					TaskMap {
						build: format!("{pkg_mgr} run build").to_string(),
						run: format!("{pkg_mgr} run").to_string(),
						test: format!("{pkg_mgr} run test").to_string(),
					},
				);
			}
			"go" => exec(
				task_name,
				TaskMap {
					build: "go build".to_string(),
					run: "go run".to_string(),
					test: "go test".to_string(),
				},
			),
			_ => {
				println!("Ecosystem not found");
			}
		}
	}
}

struct TaskMap {
	build: String,
	run: String,
	test: String,
}

fn exec(task_name: String, task_map: TaskMap) {
	let run_command = match task_name.as_str() {
		"build" => task_map.build,
		"run" => task_map.run,
		"test" => task_map.test,
		_ => {
			println!("Not a task: {}", task_name);
			exit(1);
		}
	};

	Command::new("bash")
		.arg("-c")
		.arg(run_command)
		.spawn()
		.unwrap()
		.wait()
		.unwrap();
}
