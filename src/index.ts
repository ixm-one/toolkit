import * as github from '@actions/github';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

import xdg from 'xdg-basedir';
import { valid } from 'semver';

import * as path from 'path';

import './extract';

const CACHE = xdg.cache ?? __dirname;

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

export interface ReleaseFilterOptions {
  assetMatcher: (asset: Asset) => boolean;
  validate?: (tag: string) => boolean;
  prerelease?: boolean;
  token?: string;
}

export function cache(location: string) {
  return path.join(CACHE, location);
}

export function token(value?: string): string {
  return (core.getInput('github-token') || value) ?? '';
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
  const auth = options?.token ?? token('');
  const validate = options?.validate ?? valid;
  core.debug(`Retrieving list of '${owner}/${repo}' releases`);
  const instance = github.getOctokit(auth);
  const { data: releases } = await instance.repos.listReleases({ owner, repo });
  return releases.filter((release) => {
    return (
      release.assets.find(
        (asset) =>
          options?.assetMatcher(asset) &&
          (!release.prerelease || options?.prerelease)
      ) && validate(release.tag_name)
    );
  });
}
