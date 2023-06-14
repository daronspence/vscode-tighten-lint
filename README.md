# Tighten Lint for VSCode

A VScode linter for [Tighten Lint](https://github.com/tightenco/tlint)

![Example](./images/sample.png "Example")

## Installation

* `CTRL` + `SHIFT` + `X` (`View: show extensions`)
* Search for tighten lint and click install

### Manual Installation

```sh
# In Root of Project
vsce package
code --install-extension path-of.vsix
```

## Features

* Customisable linter severities
* Customise executed linters
* Supports tlint.json configuration file

## Requirements

You must install the linter executable as per the [tlint](https://github.com/tightenco/tlint#install-requires-php71) install instructions. The minimum supported version is [v3.0.12](https://github.com/tightenco/tlint/releases/tag/v3.0.12)

## Extension Settings

| setting                        | default | description                                                                                           |
|--------------------------------|---------|-------------------------------------------------------------------------------------------------------|
| `tlint-with-syntax.exec`            | `tlint` | The `tlint` executable path                                                                           |
| `tlint-with-syntax.defaultSeverity` | `error` | The default violation severity (error, warning, info, hint)                                           |
| `tlint-with-syntax.severities`      | `{}`    | Override default severity for specific [linter](https://github.com/tightenco/tlint#available-linters) |
| `tlint-with-syntax.only`            | `[]`    | A list of the specific linters to run                                                                 |

### Example Configuration

```json
"tlint-with-syntax.exec": "/usr/bin/tlint",
    "tlint-with-syntax.defaultSeverity": "warning",
    "tlint-with-syntax.only": [
        "AlphabeticalImports",
        "NoInlineVarDocs",
        "ImportFacades"
    ],
    "tlint-with-syntax.severities": {
        "NoInlineVarDocs": "info"
    },
```

### tlintUsing a configuration file

If you wish to use a [configuration file](https://github.com/tightenco/tlint#configuration) you should place the `tlint.json` file in the root of your project folder in the required format e.g.

![Explorer](./images/explorer.png "Explorer")

The extension will then use this configuration when linting in combination with the other settings.

## Known Limitations

* Linting is limited to local files and will not work on uri schemes other the `file` e.g. `ssh`

## Contributing

See the [contributing](CONTRIBUTING.md) guide and [Code of Conduct](CODE_OF_CONDUCT.md)
