import * as github from '@actions/github';
import { validRange } from 'semver';

import type { Matcher, Filter } from './common';
import * as input from './input';

/** @internal */
export type OctokitOptions = Exclude<
  Parameters<typeof github.getOctokit>[1],
  undefined
>;

/**
 * A minimal definition of the author JSON object found within a Release
 * response.
 */
export interface Author {
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
 */
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

/**
 * Represents the interface of an object representing a GitHub Release. These
 * differ from simple tags, as a GitHub release is a specific type of tag with
 * accompanying metadata and potentially binary assets
 */
export interface Release {
  target_commitish: string;
  prerelease: boolean;
  tag_name: string;
  assets: Asset[];
  author: Author;
  name: string;
  url: string;

  node_id: string;
  tarball_url: string;
  zipball_url: string;
  assets_url: string;
  published_at: string;
  created_at: string;
  body: string;
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
 * [[GitHub]] client.
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
  return github.getOctokit(authToken ?? '', options);
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
 * many to a single one.
 * @param releases A list of releases from which to select a single one from
 */
export function select(releases: Release[]): Release {
  return releases[0];
}

export async function asset(release: Release, options?: AssetOptions) {
  return;
}
