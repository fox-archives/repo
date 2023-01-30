# Getting Started

A configuration file with your information is required

Make sure to create a [GitHub PAT](https://github.com/settings/tokens/new?scopes=repo,workflow&description=Foxxo) as well

At `~/.config/foxxo/config.json`:

```sh
{
	"person": {
		"fullname": "Edwin Kofler",
		"email": "edwin@kofler.dev",
		"websiteURL": "edwinkofler.com"
	},
	"defaults": {
		"vcsOwner": "hyperupcall",
		"vcsSite": "github.com"
	}
}
```

At `~/.local/state/foxxo/state.json`:

```sh
{
    "github_token": ""
}
```
