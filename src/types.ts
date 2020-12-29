import * as github from '@actions/github';

/**
 * @internal
 */
export type GitHub = ReturnType<typeof github.getOctokit>;

/** @internal */
export type OctokitOptions = Exclude<
  Parameters<typeof github.getOctokit>[1],
  undefined
>;

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
