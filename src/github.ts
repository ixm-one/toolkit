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
    return github.getOctokit(token ?? '', options);
  } else {
    core.warning(
      'Not running under GitHub Actions, unauthenticated instance returned'
    );
    return new GitHub();
  }
}
