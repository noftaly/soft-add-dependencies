# soft-add-dependencies

> ⚡️ Add dependencies to your package.json without installing them.

`sort-add-dependencies` is a small package to add dependencies without installing them. It has a powerful yet easy JavaScript and TypeScript API, with chainable methods, promise support, and strong typings, but it also has a CLI to add packages from your terminal!

## Table of Contents
- [Usage](#usage)
  - [CLI](#cli)
    - [Explanations](#explanations)
    - [Examples](#examples)
  - [Code](#code)
    - [API](#api)
    - [Examples](#examples-1)
- [License](#license)

## Usage

### CLI

#### Explanations

`soft-add-dependencies` works great in the cli. You first need to install it:
```shell
$ npm i soft-add-dependencies [-g]
```

And then run it with npx if it is installed locally, or simply by calling `soft-add-dependencies`:
```
$ npx soft-add-dependencies
$ soft-add-dependencies
```

You first have to put the path to the package json. If it is not set, it will default to ./package.json. If no such file exist, it will create one.
Then you have to enter all the dependencies you want to add, separated by a space.

You can also add flags and options:
- If you add the `--overwrite` flag, it will overwrite the version of the package if already installed.
- You can specify the package type with `--save-mode <dep/dev/peer/optional>`.

#### Examples

```shell
$ soft-add-dependencies ./project/package.json eslint eslint-plugin-foo -m dev
$ soft-add-dependencies zlib-sync sodium --overwrite --mode optional
```

### Code

#### API

##### enum `SaveMode`

- `Normal`: `'dependencies'`
- `Dev`: `'devDependencies'`
- `Peer`: `'peerDependencies'`
- `Optional`: `'optionalDependencies'`

##### class `SoftAddDependencies(optionsOrDestination)`

**Parameters:**
- An object with the following fields:
  - `destination` (mandatory) (`string`): The destination path
  - `overwrite` (optional) (`boolean`): If it should overwrite the version if the package is already present
  - `packages` (optional) (`string[]`): List of packages to install
  - `saveMode` (optional) (`SaveMode`): The mode to save the dependencies
- A `string`, which is the destination path

**NOTE:** If the provided destination is absolute, then it will be used. Otherwise, it will be used relatively to the current working directory (`process.cwd()`)

###### SoftAddDependencies#`overwrite()`

- **Parameters:** None
- **Returns:** `this`
- Set the `overwrite` property to true

###### SoftAddDependencies#`add(...dependencies)`

- **Parameters:** `...dependencies` (`string[]`): The dependencies to add
- **Returns:** `this`
- Add the given dependencies to the list

###### SoftAddDependencies#`as(mode)`

- **Parameters:** `mode` (`SaveMode`): The mode to save the dependencies
- **Returns:** `this`
- Set the `saveMode` property to the mode given in the parameter

###### SoftAddDependencies#`run()`

- **Parameters:** None
- **Returns:** `Promise<void>`
- Run the installation process.

#### Examples

You can also use `soft-add-dependencies` directly inside your JavaScript/TypeScript code.
```js
import SoftAddDependencies, { SaveMode } from 'soft-add-dependencies';

// Using options in the constructor:
await new SoftAddDependencies({
  destination: './project/package.json',
  packages: ['@babel/core', '@babel/node', '@babel/preset-env'],
  overwrite: true,
  saveMode: SaveMode.Dev,
}).run();

// Or using the chainable API:
await new SoftAddDependencies('./project/package.json')
  .add('@babel/core', '@babel/node', '@babel/preset-env')
  .overwrite()
  .as(SaveMode.Optional)
  .run();
```

## License

Copyright © 2020 Elliot 'noftaly' Maisl. Licensed under the MIT license, see [the license](./LICENSE).
