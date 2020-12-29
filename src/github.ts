/* TODO: This should all be moved to index.ts */
import * as github from '@actions/github';
import { GitHub } from '@actions/github/lib/utils';
import { valid } from 'semver';

import type { Matcher, Filter } from './common';
import * as common from './common';
import * as input from './input';

/** @internal */
export type GitHub = ReturnType<typeof github.getOctokit>;

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
  html_url: URL;
  login: string;
  url: URL;
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

export interface AssetOptions {
  windows: Matcher<Asset>;
  linux: Matcher<Asset>;
  macos: Matcher<Asset>;
}

export interface ReleaseOptions {
  releaseFilter?: Filter<Release>;
  assetFilter: Filter<Asset>;
  prerelease?: boolean;
  validate?: (tag: string) => boolean;
  octokit?: OctokitOptions;
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
  if (common.isGitHubActions()) {
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
  } else {
    /* TODO: This will be removed once we know we are reliably stable for the
     * API
     */
    common.warn('Not running under GitHub Actions.');
    common.warn('Unauthenticated instance returned.');
    return new GitHub();
  }
}

export async function releases(
  owner: string,
  repo: string,
  options?: ReleaseOptions
) {
  const validate = options?.validate ?? valid;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const assetFilter = options?.assetFilter ?? ((_: Asset) => true);
  const token = input.getToken(options?.token);
  const instance = client(token, options?.octokit);
  const { data: releases } = await instance.repos.listReleases({ owner, repo });
  return releases.filter((release) => {
    const selector = (asset: Asset) => {
      return assetFilter(asset) && (!release.prerelease || options?.prerelease);
    };
    return release.assets.find(selector) && validate(release.tag_name);
  });
}
