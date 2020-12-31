import * as core from '@actions/core';
import * as tool from '@actions/tool-cache';

export type Matcher<T> = string | RegExp | Seeker<T>;
export type Seeker<T> = (items: T[]) => T | undefined;
export type Filter<T> = (item: T) => boolean;

/** @internal */
export function isGitHubActions(): boolean {
  return process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
}

export function error(message: string | Error): void {
  const module = isGitHubActions() ? core : console;
  module.error(message);
}

export function warn(message: string | Error): void {
  const warning = isGitHubActions() ? core.warning : console.warn;
  warning(message);
}

export function debug(message: string): void {
  const module = isGitHubActions() ? core : console;
  module.debug(message);
}

/** @internal simple type constraint */
function isString(object: unknown): object is string {
  return typeof object === 'string';
}

/** @internal simple type constraint */
function isRegExp(object: unknown): object is RegExp {
  return object instanceof RegExp;
}

/**
 * Converts all `Matcher<T>` into the resulting `Seeker<T>`.
 *
 * This is used to "compile down" the non functions into actual predicates.
 * This also means that at some point we might be able to expand what *is* and
 * *is not* a valid `Matcher<T>` and what can be used to seek out a given `T`
 *
 * ```typescript
 *   const m = toSeeker<Release>(/v1.0.0/);
 *   const r = toSeeker<Release>("v1.0.0");
 * ```
 * When `m` is a `string` a case-insensitive `RegExp` is constructed, and
 * `toSeeker` is called once more. If `m` is a `RegExp`, a function that matches
 * against the `Asset.name` property is returned.
 * @internal
 */
export function toSeeker<T extends { name: string }>(m: Matcher<T>): Seeker<T> {
  if (isString(m)) {
    return toSeeker<T>(new RegExp(m, 'i'));
  } else if (isRegExp(m)) {
    return (items: T[]) => {
      /* istanbul ignore next */
      return items.find((item) => item.name.match(m));
    };
  } else {
    return m;
  }
}

/**
 * Simple wrapper around tool-cache/downloadTool to reduce the number of
 * imports needed.
 * @param location The URL (as a string) to download into the tool cache
 * @param dest An optional destination for the downloaded file
 * @param auth An optional authentication mechanism
 */
export async function acquire(location: string, dest?: string, auth?: string) {
  debug(`Downloading ${location}`);
  return await tool.downloadTool(location, dest, auth);
}
