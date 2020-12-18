import * as github from '@actions/github';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

import xdg from 'xdg-basedir';
import { valid } from 'semver';

import * as path from 'path';

import * as local from './github';
import './cache';

const CACHE = xdg.cache ?? __dirname;

type AssetSelector = (assets: Asset[]) => Asset;

export interface Asset {
  url: string;
  browser_download_url: string;
  id: number;
  node_id: string;
  name: string;
  label: string;
  state: string;
  content_type: string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface AssetFilterOptions {
  windows: string | RegExp | AssetSelector;
  linux: string | RegExp | AssetSelector;
  macos: string | RegExp | AssetSelector;
}

export interface ReleaseFilterOptions {
  assetMatcher: (asset: Asset) => boolean;
  validate?: (tag: string) => boolean;
  prerelease?: boolean;
  token?: string;
}

export function cache(location: string) {
  return path.join(CACHE, location);
}

export function token(value?: string): string | undefined {
  return (core.getInput('github-token') || process.env.GITHUB_TOKEN) ?? value;
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
  const matcher = options?.assetMatcher ?? ((_: Asset) => true);
  const token = local.token(options?.token);
  core.debug(`Retrieving list of '${owner}/${repo}' releases`);
  const instance = local.client(token);
  const { data: releases } = await instance.repos.listReleases({ owner, repo });
  return releases.filter((release) => {
    const selector = (asset: Asset) => {
      return matcher(asset) && (!release.prerelease || options?.prerelease);
    };
    return release.assets.find(selector) && validate(release.tag_name);
  });
}
