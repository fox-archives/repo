# Motivation

It's tough synchronizing configuration across multiple repositories. Configuration is necessary to maximize the benefits of using tools like [EditorConfig](https://editorconfig.org), [ESLint](https://eslint.org), [Stylelint](https://stylelint.io), and many others

However, setting up configuration can be time consuming, and error-prone. It's something that can be automated.

I first approached this problem by developing [Glue](https://github.com/hyperupcall/glue). It had a number of problems:

1. Coupling the task runner and the configuration manager.

I thought this would make things more simple, but increased complexity since supposed-general-enough "tasks" would often need to be overridden on a per-repository Basis.

With Foxxy, it interoperates with any task runner, such as with [Bake](https://github.com/hyperupcall/bake), my home-grown one

2. Authoring the software in Bash

Originally, Glue was written in Bash, since it is highly portable (if carefully written) and terse. I understood the well-known deficiencies of Bash, but thought my existing experience would significantly mitigate the drawbacks. But, I ended up sidetracked writing a [package manager for Bash](https://github.com/hyperupcall/basalt), among other tools that wouldn't have been necessary in a different language

Now implemented in Deno, things are trivial to modify. If Deno doesn't support an architecture I need to use, I'll simply refactor to Go
