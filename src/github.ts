import * as github from '@actions/github';
import * as core from '@actions/core';
import { GitHub } from '@actions/github/lib/utils';

type OctokitOptions = Parameters<typeof github.getOctokit>[1];
type GitHub = ReturnType<typeof github.getOctokit>;

function isGitHubActions(): boolean {
  return process.env.CI === 'true' && process.env.GITHUB_ACTIONS === 'true';
}

export function token(value?: string): string | undefined {
  value ||= undefined;
  return (core.getInput('github-token') || process.env.GITHUB_TOKEN) ?? value;
}

export function client(token?: string, options?: OctokitOptions): GitHub {
  if (isGitHubActions()) {
    if (!token && !options?.auth) {
      throw new Error(`'token' or 'options.auth' is required`);
    }
    if (token && options?.auth) {
      throw new Error(`Cannot set both 'token' or 'options.auth'`);
    }
    return github.getOctokit(token ?? '', options);
  } else {
    console.warn('Not running under GitHub Actions.');
    console.warn('Unauthenticated instance returned.');
    return new GitHub();
  }
}
