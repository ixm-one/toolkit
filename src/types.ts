import * as github from '@actions/github';

export type GitHub = ReturnType<typeof github.getOctokit>;
/** @internal */
export type OctokitOptions = Exclude<
  Parameters<typeof github.getOctokit>[1],
  undefined
>;

export type Matcher<T> = string | RegExp | Seeker<T>;
export type Seeker<T> = (items: T[]) => T | undefined;
export type Filter<T> = (item: T) => boolean;

export interface Author {
  node_id: string;
  html_url: URL;
  login: string;
  url: URL;
  id: number;
}

export interface Asset {
  browser_download_url: string;
  node_id: string;
  label: string;
  state: string;
  name: string;
  download_count: number;
  content_type: string;
  created_at: string;
  updated_at: string;
  size: number;
  url: string;
  id: number;
}

export interface Release {
  target_commitish: string;
  prerelease: boolean;
  tag_name: string;
  assets: Asset[];
  author: Author;
  name: string;
  url: URL;

  node_id: string;
  tarball_url: URL;
  zipball_url: URL;
  assets_url: URL;
  published_at: string;
  created_at: string;
  body: string;
  id: number;
}

/* simple type constraint */
function isString(object: unknown): object is string {
  return typeof object === 'string';
}

/* simple type constraint */
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
 *   const m = matcher<Release>(/v1.0.0/);
 *   const m = matcher<Release>("v1.0.0");
 * ```
 */
export function matcher<T extends { name: string }>(m: Matcher<T>): Seeker<T> {
  if (isString(m)) {
    return matcher<T>(new RegExp(m, 'i'));
  } else if (isRegExp(m)) {
    return (items: T[]) => {
      return items.find((item) => item.name.match(m));
    };
  } else {
    return m;
  }
}
