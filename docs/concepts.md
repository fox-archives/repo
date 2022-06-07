# Concepts

Fox performs tasks for a particular project. With Fox, the tasks are automatically run based on two factors: _ecosystem_ and _form_

An ecosystem is what it sounds like; the following are examples:

- NodeJS
- Go
- VueJS
- C

The _form_ is how the project will be ran in the context of the ecosystem. It can either be:

- `app`
- `lib`

Here, applications are tantamount to producers while libraries are tantamount to consumers

In cases where either cannot be automatically detected, an error will be thrown
