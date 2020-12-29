import * as core from '@actions/core';
import './types';

export type Matcher<T> = string | RegExp | Seeker<T>;
export type Seeker<T> = (items: T[]) => T | undefined;
export type Filter<T> = (item: T) => boolean;

/** @internal */
export function isGitHubActions(): boolean {
  return process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
}

export function error(message: string | Error): void {
  if (isGitHubActions()) {
    core.error(message);
  } else {
    console.error(message);
  }
}

export function warn(message: string | Error): void {
  if (isGitHubActions()) {
    core.warning(message);
  } else {
    console.warn(message);
  }
}

export function debug(message: string): void {
  if (isGitHubActions()) {
    core.debug(message);
  } else {
    console.debug(message);
  }
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
 *   const m = seeker<Release>(/v1.0.0/);
 *   const m = seeker<Release>("v1.0.0");
 * ```
 */
export function seeker<T extends { name: string }>(m: Matcher<T>): Seeker<T> {
  if (isString(m)) {
    return seeker<T>(new RegExp(m, 'i'));
  } else if (isRegExp(m)) {
    return (items: T[]) => {
      return items.find((item) => item.name.match(m));
    };
  } else {
    return m;
  }
}
