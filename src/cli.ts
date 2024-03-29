#!/usr/bin/env node --no-warnings

import { promises as fs } from 'node:fs';
import path from 'node:path';
import meow from 'meow';
import pkg from '../package.json' assert { type: 'json' };
import { SoftAddDependencies, SaveMode } from './index.js';

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
    importMeta: import.meta,
    flags: {
      saveMode: { type: 'string', alias: 's', default: SaveMode.Normal },
      overwrite: { type: 'boolean', alias: 'o', default: false },
      h: { type: 'boolean', default: false },
      v: { type: 'boolean', default: false },
    },
  });

void (async (): Promise<void> => {
  if (cli.flags.h) {
    cli.showHelp();
    return;
  }
  if (cli.flags.v) {
    cli.showVersion();
    return;
  }

  try {
    const packages: string[] = cli.input;
    let destination = path.join(process.cwd(), './package.json');

    if (await exists(packages[0]))
      destination = packages.shift()!;

    if (packages.length === 0) {
      console.log('You must enter dependencies');
      return;
    }

    await new SoftAddDependencies({
      destination,
      packages,
      overwrite: cli.flags.overwrite,
      saveMode: getMode(cli.flags.saveMode),
    }).run();
  } catch (err: unknown) {
    console.log('An error occured while using soft-add-dependencies... More information are available below this message.');
    console.log('If you think this is a bug, please report it here: https://github.com/noftaly/soft-add-dependencies, with the "bug" issue template filled correctly.');
    console.log();
    console.error(err);
  }
})();
