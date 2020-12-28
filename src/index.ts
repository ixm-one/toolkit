import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

import type { Matcher, Filter, Asset, Release } from './types';
import { matcher } from './types';
import { valid } from 'semver';
import * as github from './github';
import './archive';

export interface AssetFilterOptions {
  windows: Matcher<Asset>;
  linux: Matcher<Asset>;
  macos: Matcher<Asset>;
}

export interface ReleaseFilterOptions {
  releaseMatcher?: Filter<Release>;
  assetMatcher: Filter<Asset>;
  validate?: (tag: string) => boolean;
  prerelease?: boolean;
  token?: string;
}

export async function acquire(location: string) {
  core.debug(`Downloading ${location}`);
  return await tc.downloadTool(location);
}

export async function releases(
  owner: string,
  repo: string,
  options?: ReleaseFilterOptions
) {
  const validate = options?.validate ?? valid;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const matcher = options?.assetMatcher ?? ((_: Asset) => true);
  const token = github.token(options?.token);
  core.debug(`Retrieving list of '${owner}/${repo}' releases`);
  const instance = github.client(token);
  const { data: releases } = await instance.repos.listReleases({ owner, repo });
  return releases.filter((release) => {
    const selector = (asset: Asset) => {
      return matcher(asset) && (!release.prerelease || options?.prerelease);
    };
    return release.assets.find(selector) && validate(release.tag_name);
  });
}

export async function asset(
  owner: string,
  repo: string,
  asset: AssetFilterOptions,
  options?: ReleaseFilterOptions
) {
  const searchables = await releases(owner, repo, options);
  const selector = matcher<Asset>(
    (() => {
      switch (process.platform) {
        case 'darwin':
          return asset.macos;
        case 'win32':
          return asset.windows;
        default:
          return asset.linux;
      }
    })()
  );
  core.debug(`Filtering assets for ${process.platform}`);
}
