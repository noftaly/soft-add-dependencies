import path from 'path';
import editJsonFile from 'edit-json-file';
import type { Result } from 'libnpmsearch';
import search from 'libnpmsearch';


export enum SaveMode {
  Normal = 'dependencies',
  Dev = 'devDependencies',
  Peer = 'peerDependencies',
  Optional = 'optionalDependencies',
}

interface Options {
  destination: string;
  overwrite?: boolean;
  packages?: string[];
  saveMode?: SaveMode;
}

export default class SoftAddDependencies {
  public saveMode: SaveMode = SaveMode.Normal;
  public packages: string[] = [];
  public shouldOverwrite = false;
  public destination: string;

  constructor(optionsOrDestination: Options | string) {
    if (typeof optionsOrDestination === 'string') {
      this.destination = optionsOrDestination;
    } else {
      this.destination = optionsOrDestination.destination || './package.json';
      this.shouldOverwrite = optionsOrDestination.overwrite ?? false;
      this.packages = optionsOrDestination.packages || [];
      this.saveMode = optionsOrDestination.saveMode || SaveMode.Normal;
    }
  }

  private static _resolvePath(destination: string): string {
    return path.isAbsolute(destination)
      ? destination
      : path.join(process.cwd(), destination);
  }

  public overwrite(): this {
    this.shouldOverwrite = true;
    return this;
  }

  public add(...deps: string[]): this {
    this.packages = [...this.packages, ...deps];
    return this;
  }

  public as(mode: SaveMode): this {
    this.saveMode = mode;
    return this;
  }

  public async run(): Promise<void> {
    const file = editJsonFile(SoftAddDependencies._resolvePath(this.destination));
    const pendingDependenciesInfos: Array<Promise<Result[]>> = [];

    for (const dependency of this.packages)
      pendingDependenciesInfos.push(search(dependency));

    const newDependencies: Array<[pkg: string, version: string]> = (await Promise.allSettled(pendingDependenciesInfos))
      // Keep only successful promises
      .filter((promise): promise is PromiseFulfilledResult<Result[]> => promise.status === 'fulfilled')
      .map(promise => promise.value)
      // Get the exact same package
      .map((matching, i) => matching.find(dep => dep.name === this.packages[i]))
      .filter(Boolean)
      // Return a tuple with the dependency name and its version (formatted with the semver compatibility format)
      .map(dep => [dep.name, `^${dep.version}`]);

    /* eslint-disable object-curly-newline */
    let allDependencies: Record<string, string> = this.shouldOverwrite
      ? { ...file.get(this.saveMode),
          ...Object.fromEntries(newDependencies) }
      : { ...Object.fromEntries(newDependencies),
          ...file.get(this.saveMode) };
    /* eslint-enable object-curly-newline */

    allDependencies = Object.keys(allDependencies)
      .sort()
      .reduce((res, key) => {
        res[key] = allDependencies[key];
        return res;
      }, {});

    file.set(this.saveMode, allDependencies);
    file.save();
  }
}
