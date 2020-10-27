#!/usr/bin/env node

import { promises as fs } from 'fs';
import meow from 'meow';
import * as pkg from '../package.json';
import SoftAddDependencies, { SaveMode } from './SoftAddDependencies';

async function exists(filepath: string): Promise<boolean> {
  try {
    await fs.stat(filepath);
  } catch {
    return false;
  }
  return true;
}

function getMode(mode: string): SaveMode | null {
  switch (mode.toLowerCase()) {
    case 'dep':
    case SaveMode.Normal.toLowerCase():
      return SaveMode.Normal;
    case 'dev':
    case SaveMode.Dev.toLowerCase():
      return SaveMode.Dev;
    case 'opt':
    case 'optional':
    case SaveMode.Optional.toLowerCase():
      return SaveMode.Optional;
    case 'peer':
    case SaveMode.Peer.toLowerCase():
      return SaveMode.Peer;
    default:
      return null;
  }
}

const cli = meow(`
    Usage
      $ soft-add-dependencies [file = ./package.json] <dependencies>

    Options
      --save-mode, -s <dep/dev/peer/optional>
                    Defaults to "dependencies". Specify the type of dependency to install
      --overwrite   Defaults to false. If true, it will overwrite the version of the package if already installed.

    Examples
      $ soft-add-dependencies ./package.json eslint eslint-plugin-foo -m dev
      $ soft-add-dependencies zlib-sync sodium --overwrite --mode optional
  `,
  {
    pkg,
    flags: {
      saveMode: { type: 'string', alias: 's', default: SaveMode.Normal },
      overwrite: { type: 'boolean', alias: 'o', default: false },
      h: { type: 'boolean', default: false },
      v: { type: 'boolean', default: false },
    },
  });

void (async (): Promise<void> => {
  if (cli.flags.h)
    return cli.showHelp();
  if (cli.flags.v)
    return cli.showVersion();

  try {
    const packages: string[] = cli.input;
    let destination: string;

    if (await exists(packages[0]))
      destination = packages.shift();

    if (packages.length === 0)
      return console.log('You must enter dependencies');

    await new SoftAddDependencies({
      destination,
      packages,
      overwrite: cli.flags.overwrite,
      saveMode: getMode(cli.flags.saveMode),
    }).run();
  } catch (err: unknown) {
    console.log('An error occured while using nipinit... More information are available below this message.');
    console.log('If you think this is a bug, please report it here: https://github.com/noftaly/nipinit, with the "bug" issue template filled correctly.');
    console.log();
    console.error(err);
  }
})();
