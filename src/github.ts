import { coerce, maxSatisfying, SemVer, validRange } from 'semver';
import { getOctokit } from '@actions/github';

import { Matcher, Filter, toSeeker, Seeker } from './common';
import * as input from './input';

/** @internal */
function platformSeeker(options: AssetOptions): Seeker<Asset> {
  switch (process.platform) {
    case 'darwin':
      return toSeeker(options.macos);
    case 'win32':
      return toSeeker(options.windows);
    default:
      return toSeeker(options.linux);
  }
}
/** @internal */
export type OctokitOptions = Exclude<
  Parameters<typeof getOctokit>[1],
  undefined
>;

/**
 * A minimal definition of the author JSON object found within a Release
 * response.
 */
interface Author {
  node_id: string;
  html_url: string;
  login: string;
  url: string;
  id: number;
}

/**
 * A GitHub asset found within a release. This is the minimum interface an
 * object needs to be considered an Asset, however this is because getting the
 * actual types *out* of Octokit.js is painful.
 * @category GitHub
 */
export interface Asset {
  browser_download_url: string;
  node_id: string;
  label: string | null;
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

/**
 * Represents the interface of an object representing a GitHub Release. These
 * differ from simple tags, as a GitHub release is a specific type of tag with
 * accompanying metadata and potentially binary assets
 * @category GitHub
 */
export interface Release {
  target_commitish: string;
  prerelease: boolean;
  tag_name: string;
  assets: Asset[];
  author: Author | null;
  name: string | null;
  url: string;

  node_id: string;
  tarball_url: string | null;
  zipball_url: string | null;
  assets_url: string;
  published_at: string | null;
  created_at: string;
  body?: string | null;
  id: number;
}

export interface AssetOptions {
  windows: Matcher<Asset>;
  linux: Matcher<Asset>;
  macos: Matcher<Asset>;
}

export interface ReleaseOptions {
  prereleases?: boolean;
  octokit?: OctokitOptions;
  filter?: Filter<Release>;
  token?: string;
}

export type SelectPredicate =
  | ((release: Release) => boolean)
  | ((release: Release, releases: Release[]) => boolean);

/**
 * @returns A [[GitHub]] object with better defaults. If not running under
 * GitHub Actions, this function returns an unauthenticated client. This is
 * intended for local testing until a proper 'mock' object can be created for
 * unit tests only when running locally.
 * @param authToken If this is not set, and `options?.auth` is not set, this
 * will attempt to fallback to a `github-token` input or a `$GITHUB_TOKEN`
 * environment variable. When *not* running under GitHub actions, this fallback
 * is ignored and an unauthenticated client might result instead.
 * @param options These are passed through nearly untouched to the underlying
 * call to `getOctokit`.
 * @category GitHub
 */
export function client(authToken?: string, options?: OctokitOptions) {
  if (!options?.auth) {
    authToken ||= input.getToken();
  }
  if (!authToken && !options?.auth) {
    throw new Error(`'authToken' or 'options.auth' is required`);
  }
  if (authToken && options?.auth) {
    throw new Error(`Cannot set both 'token' or 'options.auth'`);
  }
  return getOctokit(authToken ?? '', options);
}

/**
 * By default [[`ReleaseOptions.token`]] will use [[`semver.validRange`]],
 * [[`ReleaseOptions.token`]] will call [[`getToken`]]. Additional options can
 * be passed to the underlying call to `getOctokit`. Prereleases are not
 * included by default, but can be included by setting
 * [[`ReleaseOptions.prereleases`]] to `true`. This is equivalent to writing
 *
 * ```typescript
 * const releases = toolkit.releases('owner', 'repo', {
 *   filter: (release: Release) => {
 *     return !!toolkit.validRange(release.tag_name, {
 *       includePrerelease: true
 *     });
 *   },
 * });
 * ```
 *
 * But is instead condensed down into
 *
 * ```typescript
 * const releases = toolkit.releases('owner', 'repo', { prereleases: true });
 * ```
 *
 * As you can see, this is much simpler.
 *
 * The [[`ReleaseOptions.prereleases`]] option is not used by custom
 * user-defined [[`ReleaseOptions.filter`]]s.
 * @param owner The user or organization of `repo`
 * @param repo The GitHub repository to look up
 * @param options Overridable options for finding releases
 * @returns A list of [[Release]] objects from a github repository.
 * @category GitHub
 */
export async function releases(
  owner: string,
  repo: string,
  options?: ReleaseOptions
) {
  const token = input.getToken(options?.token);
  const github = client(token, options?.octokit);
  const prereleases = options?.prereleases ?? false;
  const filter =
    options?.filter ??
    ((item: Release) =>
      !!validRange(item.tag_name, { includePrerelease: prereleases }));
  const { data: releases } = await github.repos.listReleases({ owner, repo });
  return releases.filter((release) => filter(release));
}

/**
 * This is typically the next step after receiving a list of releases from
 * [[`releases`]], and is used to more effectively whittle down the list from
 * many to a single one. Unlike other functions, this is not as convertible as
 * one might think, and simply takes a 'find' function but will filter out
 * versions that cannot be coerced to SemVer. These instances are fairly rare,
 * as SemVer as a coerce-able format is more common than the semantics that
 * SemVer expects.
 *
 * The default implementation of `predicate` is equivalent to
 * (but not implemented as)
 * ```typescript
 * function (release: Release) {
 *   const version = toolkit.getToolVersion(toolName) || '*';
 *   const versions = releases
 *     .map((release) => coerce(release.tag_name))
 *     .filter((version): version is SemVer => version !== null);
 *   const max = maxSatisfying(versions, version);
 *   const tag = coerce(release.tag_name) as NonNullable<SemVer>;
 *   return max?.version === tag.version;
 * }
 * ```
 *
 * If this implementation does *not* meet your requirements, its recommened to
 * write and test your own.
 * @param releases A list of releases from which to select a single one from
 * @param predicate Selection predicate. An implementation is provided if absent
 */
export function select(
  releases: Release[],
  toolName: string,
  predicate?: SelectPredicate
) {
  const version = input.getToolVersion(toolName) || '*';
  const versions = releases
    .map((release) => coerce(release.tag_name))
    .filter((version): version is SemVer => version !== null);
  const find =
    predicate ??
    ((release: Release) => {
      const max = maxSatisfying(versions, version);
      const tag = coerce(release.tag_name) as NonNullable<SemVer>;
      /* This is always non-nullable because it wouldn't be in this list to
       * begin with since we filtered before hand
       */
      return max?.version === tag.version;
    });
  return releases.find((release, _, releases) => find(release, releases));
}

/**
 * This is used to extract a single asset according to several 'matchers' that
 * are provided for each possible operating system. Even if a platform is not
 * being targeted, a dummy value of `key: '.*'` can still be provided. When no
 * asset is found, this function *will* return `undefined` (as
 * `Array.prototype.find` does), and this will then be used
 *
 * @param release
 * @param options
 */
export async function asset(release: Release, options: AssetOptions) {
  const seeker = platformSeeker(options);
  return seeker(release.assets);
}
